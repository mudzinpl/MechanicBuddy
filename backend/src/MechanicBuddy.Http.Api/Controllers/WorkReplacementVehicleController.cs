using System;
using Dapper;
using MechanicBuddy.Core.Application.RateLimiting;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NHibernateSession = NHibernate.ISession;

namespace MechanicBuddy.Http.Api.Controllers
{
    [TenantRateLimit]
    [Authorize(Policy = "ServerSidePolicy")]
    [ApiController]
    [Route("api/work/{workId:guid}/replacement-vehicle")]
    public class WorkReplacementVehicleController : ControllerBase
    {
        private readonly NHibernateSession session;

        public WorkReplacementVehicleController(NHibernateSession session)
        {
            this.session = session;
        }

        [HttpGet]
        public ActionResult<WorkReplacementVehicleDto> Get(Guid workId)
        {
            var rental = session.Connection.QuerySingleOrDefault<WorkReplacementVehicleDto>(@"
                SELECT
                    r.id,
                    r.workid,
                    r.replacementvehicleid,
                    CONCAT_WS(' ', v.producer, v.model, NULLIF('(' || v.regnr || ')', '()')) AS replacementvehiclename,
                    r.issuedon,
                    r.returnedon,
                    r.mileageout,
                    r.mileagein,
                    r.fuelout,
                    r.fuelin,
                    r.conditionout,
                    r.conditionin,
                    r.notes,
                    r.status,
                    r.createdon,
                    r.changedon
                FROM domain.work_replacement_vehicle r
                INNER JOIN domain.vehicle v ON v.id = r.replacementvehicleid
                WHERE r.workid = @WorkId
                  AND r.status <> 'cancelled'
                ORDER BY
                    CASE WHEN r.status = 'issued' THEN 0 WHEN r.status = 'planned' THEN 1 ELSE 2 END,
                    r.changedon DESC
                LIMIT 1", new { WorkId = workId });

            return Ok(rental);
        }

        [HttpPost]
        public IActionResult Create(Guid workId, [FromBody] UpsertReplacementVehicleDto model)
        {
            if (model == null || model.ReplacementVehicleId == Guid.Empty)
                return BadRequest("Wybierz pojazd zastępczy.");

            var status = model.IssuedOn.HasValue ? "issued" : "planned";

            var id = session.Connection.ExecuteScalar<Guid>(@"
                INSERT INTO domain.work_replacement_vehicle (
                    workid, replacementvehicleid, issuedon, mileageout, fuelout,
                    conditionout, notes, status, createdon, changedon)
                VALUES (
                    @WorkId, @ReplacementVehicleId, @IssuedOn, @MileageOut, @FuelOut,
                    @ConditionOut, @Notes, @Status, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                RETURNING id", new
                {
                    WorkId = workId,
                    model.ReplacementVehicleId,
                    model.IssuedOn,
                    model.MileageOut,
                    model.FuelOut,
                    model.ConditionOut,
                    model.Notes,
                    Status = status
                });

            return Ok(id);
        }

        [HttpPut("{id:guid}/return")]
        public IActionResult Return(Guid workId, Guid id, [FromBody] ReturnReplacementVehicleDto model)
        {
            var returnedOn = model?.ReturnedOn ?? DateTime.Now;
            var mileageIn = model?.MileageIn;
            var fuelIn = model?.FuelIn;
            var conditionIn = model?.ConditionIn;
            var notes = model?.Notes;

            var affected = session.Connection.Execute(@"
                UPDATE domain.work_replacement_vehicle
                SET returnedon = @ReturnedOn,
                    mileagein = @MileageIn,
                    fuelin = @FuelIn,
                    conditionin = @ConditionIn,
                    notes = COALESCE(NULLIF(@Notes, ''), notes),
                    status = 'returned',
                    changedon = CURRENT_TIMESTAMP
                WHERE id = @Id
                  AND workid = @WorkId
                  AND status <> 'cancelled'", new
                {
                    Id = id,
                    WorkId = workId,
                    ReturnedOn = returnedOn,
                    MileageIn = mileageIn,
                    FuelIn = fuelIn,
                    ConditionIn = conditionIn,
                    Notes = notes
                });

            return affected == 0 ? NotFound() : Ok();
        }

        [HttpPut("{id:guid}/cancel")]
        public IActionResult Cancel(Guid workId, Guid id)
        {
            var affected = session.Connection.Execute(@"
                UPDATE domain.work_replacement_vehicle
                SET status = 'cancelled',
                    changedon = CURRENT_TIMESTAMP
                WHERE id = @Id
                  AND workid = @WorkId
                  AND status <> 'returned'", new { Id = id, WorkId = workId });

            return affected == 0 ? NotFound() : Ok();
        }
    }

    public class UpsertReplacementVehicleDto
    {
        public Guid ReplacementVehicleId { get; set; }
        public DateTime? IssuedOn { get; set; }
        public int? MileageOut { get; set; }
        public string FuelOut { get; set; }
        public string ConditionOut { get; set; }
        public string Notes { get; set; }
    }

    public class ReturnReplacementVehicleDto
    {
        public DateTime? ReturnedOn { get; set; }
        public int? MileageIn { get; set; }
        public string FuelIn { get; set; }
        public string ConditionIn { get; set; }
        public string Notes { get; set; }
    }

    public class WorkReplacementVehicleDto
    {
        public Guid Id { get; set; }
        public Guid WorkId { get; set; }
        public Guid ReplacementVehicleId { get; set; }
        public string ReplacementVehicleName { get; set; }
        public DateTime? IssuedOn { get; set; }
        public DateTime? ReturnedOn { get; set; }
        public int? MileageOut { get; set; }
        public int? MileageIn { get; set; }
        public string FuelOut { get; set; }
        public string FuelIn { get; set; }
        public string ConditionOut { get; set; }
        public string ConditionIn { get; set; }
        public string Notes { get; set; }
        public string Status { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime ChangedOn { get; set; }
    }
}
