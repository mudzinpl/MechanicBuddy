using Dapper;
using MechanicBuddy.Core.Application.RateLimiting;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NHibernateSession = NHibernate.ISession;
using System;
using System.Collections.Generic;
using System.Linq;

namespace MechanicBuddy.Http.Api.Controllers
{
    [TenantRateLimit]
    [Authorize(Policy = "ServerSidePolicy")]
    [ApiController]
    [Route("api/work/{workId:guid}/inspection-findings")]
    public class WorkInspectionFindingsController : ControllerBase
    {
        private static readonly HashSet<string> Sides = new(StringComparer.OrdinalIgnoreCase)
        {
            "left", "right", "front", "rear", "center", "not_applicable"
        };

        private static readonly HashSet<string> DamageTypes = new(StringComparer.OrdinalIgnoreCase)
        {
            "dent", "scratch", "crack", "deformation", "broken", "missing", "other"
        };

        private static readonly HashSet<string> Actions = new(StringComparer.OrdinalIgnoreCase)
        {
            "repair", "replace", "paint", "polish", "diagnose", "none"
        };

        private readonly NHibernateSession session;

        public WorkInspectionFindingsController(NHibernateSession session)
        {
            this.session = session;
        }

        [HttpGet]
        public ActionResult<IEnumerable<InspectionFindingDto>> GetAll(Guid workId)
        {
            if (!WorkExists(workId)) return NotFound();

            var items = session.Connection.Query<InspectionFindingDto>(@"
                SELECT id, workid, elementname, vehicleside, damagetype,
                       recommendedaction, notes, sortorder, createdon, changedon
                FROM domain.work_inspection_finding
                WHERE workid = @WorkId
                ORDER BY sortorder, createdon, id",
                new { WorkId = workId }).ToArray();

            return Ok(items);
        }

        [HttpPost]
        public IActionResult Post(Guid workId, [FromBody] PutInspectionFindingDto model)
        {
            if (!WorkExists(workId)) return NotFound();
            var validation = Validate(model);
            if (validation != null) return BadRequest(validation);

            var id = Guid.NewGuid();
            var sortOrder = session.Connection.ExecuteScalar<int>(@"
                SELECT COALESCE(MAX(sortorder), -1) + 1
                FROM domain.work_inspection_finding
                WHERE workid = @WorkId", new { WorkId = workId });

            session.Connection.Execute(@"
                INSERT INTO domain.work_inspection_finding (
                    id, workid, elementname, vehicleside, damagetype,
                    recommendedaction, notes, sortorder, createdon, changedon)
                VALUES (
                    @Id, @WorkId, @ElementName, @VehicleSide, @DamageType,
                    @RecommendedAction, @Notes, @SortOrder, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
                new
                {
                    Id = id,
                    WorkId = workId,
                    ElementName = model.ElementName.Trim(),
                    model.VehicleSide,
                    model.DamageType,
                    model.RecommendedAction,
                    model.Notes,
                    SortOrder = sortOrder
                });

            TouchWork(workId);
            return Ok(id);
        }

        [HttpPut("{findingId:guid}")]
        public IActionResult Put(Guid workId, Guid findingId, [FromBody] PutInspectionFindingDto model)
        {
            var validation = Validate(model);
            if (validation != null) return BadRequest(validation);

            var affected = session.Connection.Execute(@"
                UPDATE domain.work_inspection_finding
                SET elementname = @ElementName,
                    vehicleside = @VehicleSide,
                    damagetype = @DamageType,
                    recommendedaction = @RecommendedAction,
                    notes = @Notes,
                    changedon = CURRENT_TIMESTAMP
                WHERE id = @FindingId AND workid = @WorkId",
                new
                {
                    WorkId = workId,
                    FindingId = findingId,
                    ElementName = model.ElementName.Trim(),
                    model.VehicleSide,
                    model.DamageType,
                    model.RecommendedAction,
                    model.Notes
                });

            if (affected == 0) return NotFound();
            TouchWork(workId);
            return Ok(new { Success = true });
        }

        [HttpDelete("{findingId:guid}")]
        public IActionResult Delete(Guid workId, Guid findingId)
        {
            var affected = session.Connection.Execute(@"
                DELETE FROM domain.work_inspection_finding
                WHERE id = @FindingId AND workid = @WorkId",
                new { WorkId = workId, FindingId = findingId });

            if (affected == 0) return NotFound();
            TouchWork(workId);
            return Ok(new { Success = true });
        }

        private static string Validate(PutInspectionFindingDto model)
        {
            if (string.IsNullOrWhiteSpace(model?.ElementName)) return "Podaj uszkodzony element.";
            if (!Sides.Contains(model.VehicleSide ?? string.Empty)) return "Wybierz prawidłową stronę pojazdu.";
            if (!DamageTypes.Contains(model.DamageType ?? string.Empty)) return "Wybierz prawidłowy rodzaj uszkodzenia.";
            if (!Actions.Contains(model.RecommendedAction ?? string.Empty)) return "Wybierz prawidłowe zalecenie.";
            return null;
        }

        private bool WorkExists(Guid workId)
        {
            return session.Connection.ExecuteScalar<bool>(
                "SELECT EXISTS (SELECT 1 FROM domain.work WHERE id = @WorkId)",
                new { WorkId = workId });
        }

        private void TouchWork(Guid workId)
        {
            session.Connection.Execute(
                "UPDATE domain.work SET changedon = CURRENT_TIMESTAMP WHERE id = @WorkId",
                new { WorkId = workId });
        }

        public class InspectionFindingDto
        {
            public Guid Id { get; set; }
            public Guid WorkId { get; set; }
            public string ElementName { get; set; }
            public string VehicleSide { get; set; }
            public string DamageType { get; set; }
            public string RecommendedAction { get; set; }
            public string Notes { get; set; }
            public int SortOrder { get; set; }
            public DateTime CreatedOn { get; set; }
            public DateTime ChangedOn { get; set; }
        }

        public class PutInspectionFindingDto
        {
            public string ElementName { get; set; }
            public string VehicleSide { get; set; }
            public string DamageType { get; set; }
            public string RecommendedAction { get; set; }
            public string Notes { get; set; }
        }
    }
}
