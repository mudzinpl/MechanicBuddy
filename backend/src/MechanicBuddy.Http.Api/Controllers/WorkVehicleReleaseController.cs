using Dapper;
using MechanicBuddy.Core.Application.Extensions;
using MechanicBuddy.Core.Application.RateLimiting;
using MechanicBuddy.Core.Domain;
using MechanicBuddy.Http.Api.Models;
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
    [Route("api/work/{workId:guid}/vehicle-release")]
    public class WorkVehicleReleaseController : ControllerBase
    {
        private readonly NHibernateSession session;

        public WorkVehicleReleaseController(NHibernateSession session)
        {
            this.session = session;
        }

        [HttpGet]
        public ActionResult<WorkVehicleReleaseDto> Get(Guid workId)
        {
            if (!WorkExists(workId)) return NotFound();

            var release = session.Connection.QuerySingleOrDefault<WorkVehicleReleaseDto>(@"
                SELECT
                    COALESCE(r.id, uuid_generate_v4()) AS id,
                    w.id AS workid,
                    COALESCE(r.plannedreleaseon, w.plannedreleaseon) AS plannedreleaseon,
                    r.releasedon,
                    r.releasedbyemployeeid,
                    CONCAT_WS(' ', e.firstname, e.lastname) AS releasedbyemployeename,
                    r.receivedbyname,
                    r.identitydocumentnumber,
                    r.mileageout,
                    r.fuelout,
                    r.releasenotes,
                    COALESCE(r.clientreceiveddocuments, FALSE) AS clientreceiveddocuments,
                    COALESCE(r.clientreceivedinvoiceinfo, FALSE) AS clientreceivedinvoiceinfo,
                    COALESCE(r.vehiclewashed, FALSE) AS vehiclewashed,
                    COALESCE(r.finalcontrolcompleted, FALSE) AS finalcontrolcompleted,
                    r.clientsignatureplaceholder,
                    COALESCE(r.createdon, CURRENT_TIMESTAMP) AS createdon,
                    COALESCE(r.changedon, CURRENT_TIMESTAMP) AS changedon
                FROM domain.work w
                LEFT JOIN domain.work_vehicle_release r ON r.workid = w.id
                LEFT JOIN domain.employee e ON e.id = r.releasedbyemployeeid
                WHERE w.id = @WorkId", new { WorkId = workId });

            return Ok(release);
        }

        [HttpPut]
        public IActionResult Put(Guid workId, [FromBody] PutWorkVehicleReleaseDto model)
        {
            if (!WorkExists(workId)) return NotFound();

            session.Connection.Execute(@"
                INSERT INTO domain.work_vehicle_release (
                    id, workid, plannedreleaseon, releasedon, releasedbyemployeeid, receivedbyname,
                    identitydocumentnumber, mileageout, fuelout, releasenotes, clientreceiveddocuments,
                    clientreceivedinvoiceinfo, vehiclewashed, finalcontrolcompleted, clientsignatureplaceholder,
                    createdon, changedon)
                VALUES (
                    uuid_generate_v4(), @WorkId, @PlannedReleaseOn, @ReleasedOn, @ReleasedByEmployeeId, @ReceivedByName,
                    @IdentityDocumentNumber, @MileageOut, @FuelOut, @ReleaseNotes, @ClientReceivedDocuments,
                    @ClientReceivedInvoiceInfo, @VehicleWashed, @FinalControlCompleted, @ClientSignaturePlaceholder,
                    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                ON CONFLICT (workid) DO UPDATE SET
                    plannedreleaseon = EXCLUDED.plannedreleaseon,
                    releasedon = EXCLUDED.releasedon,
                    releasedbyemployeeid = EXCLUDED.releasedbyemployeeid,
                    receivedbyname = EXCLUDED.receivedbyname,
                    identitydocumentnumber = EXCLUDED.identitydocumentnumber,
                    mileageout = EXCLUDED.mileageout,
                    fuelout = EXCLUDED.fuelout,
                    releasenotes = EXCLUDED.releasenotes,
                    clientreceiveddocuments = EXCLUDED.clientreceiveddocuments,
                    clientreceivedinvoiceinfo = EXCLUDED.clientreceivedinvoiceinfo,
                    vehiclewashed = EXCLUDED.vehiclewashed,
                    finalcontrolcompleted = EXCLUDED.finalcontrolcompleted,
                    clientsignatureplaceholder = EXCLUDED.clientsignatureplaceholder,
                    changedon = CURRENT_TIMESTAMP",
                new
                {
                    WorkId = workId,
                    model.PlannedReleaseOn,
                    model.ReleasedOn,
                    model.ReleasedByEmployeeId,
                    model.ReceivedByName,
                    model.IdentityDocumentNumber,
                    model.MileageOut,
                    model.FuelOut,
                    model.ReleaseNotes,
                    model.ClientReceivedDocuments,
                    model.ClientReceivedInvoiceInfo,
                    model.VehicleWashed,
                    model.FinalControlCompleted,
                    model.ClientSignaturePlaceholder
                });

            session.Connection.Execute(@"
                UPDATE domain.work
                SET plannedreleaseon = @PlannedReleaseOn,
                    changedon = CURRENT_TIMESTAMP
                WHERE id = @WorkId", new { WorkId = workId, model.PlannedReleaseOn });

            if (model.ReleasedOn.HasValue)
            {
                MarkReleased(workId);
            }

            return Ok(new { Success = true });
        }

        [HttpGet("protocol")]
        public ActionResult<WorkVehicleReleaseProtocolDto> GetProtocol(Guid workId)
        {
            if (!WorkExists(workId)) return NotFound();

            var protocol = session.Connection.QuerySingleOrDefault<WorkVehicleReleaseProtocolDto>(@"
                SELECT
                    w.id AS workid,
                    w.number::text AS worknr,
                    w.claimnumber,
                    COALESCE(CONCAT_WS(' ', p.firstname, p.lastname), l.name) AS clientname,
                    COALESCE(p.address, l.address) AS clientaddress,
                    COALESCE(p.phone, l.phone) AS clientphone,
                    COALESCE(p.email, l.email) AS clientemail,
                    v.producer AS vehicleproducer,
                    v.model AS vehiclemodel,
                    v.vin AS vehiclevin,
                    v.regnr AS vehicleregnr,
                    COALESCE(r.plannedreleaseon, w.plannedreleaseon) AS plannedreleaseon,
                    r.releasedon,
                    r.receivedbyname,
                    r.identitydocumentnumber,
                    r.mileageout,
                    r.fuelout,
                    r.releasenotes,
                    COALESCE(r.clientreceiveddocuments, FALSE) AS clientreceiveddocuments,
                    COALESCE(r.clientreceivedinvoiceinfo, FALSE) AS clientreceivedinvoiceinfo,
                    COALESCE(r.vehiclewashed, FALSE) AS vehiclewashed,
                    COALESCE(r.finalcontrolcompleted, FALSE) AS finalcontrolcompleted,
                    r.clientsignatureplaceholder,
                    CONCAT_WS(' ', e.firstname, e.lastname) AS releasedbyemployeename
                FROM domain.work w
                LEFT JOIN domain.work_vehicle_release r ON r.workid = w.id
                LEFT JOIN domain.employee e ON e.id = r.releasedbyemployeeid
                LEFT JOIN domain.legalclient l ON l.id = w.clientid
                LEFT JOIN domain.privateclient p ON p.id = w.clientid
                LEFT JOIN domain.vehicle v ON v.id = w.vehicleid
                WHERE w.id = @WorkId", new { WorkId = workId });

            if (protocol == null) return NotFound();

            protocol.Checklist = session.Connection.Query<WorkVehicleReleaseChecklistDto>(@"
                SELECT itemname, iscompleted, notes
                FROM domain.work_quality_checklist_item
                WHERE workid = @WorkId
                  AND groupkey IN ('final_control', 'vehicle_release', 'washing')
                ORDER BY sortorder, itemname", new { WorkId = workId }).ToArray();

            return Ok(protocol);
        }

        private void MarkReleased(Guid workId)
        {
            var oldStatus = session.Connection.ExecuteScalar<string>(
                "SELECT COALESCE(NULLIF(TRIM(damagestatus), ''), 'new') FROM domain.work WHERE id = @WorkId",
                new { WorkId = workId });

            if (string.Equals(oldStatus, "released", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(oldStatus, "settled", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(oldStatus, "rejected", StringComparison.OrdinalIgnoreCase))
            {
                return;
            }

            session.Connection.Execute(@"
                UPDATE domain.work
                SET damagestatus = 'released', changedon = CURRENT_TIMESTAMP
                WHERE id = @WorkId", new { WorkId = workId });

            session.Connection.Execute(@"
                INSERT INTO domain.work_status_history
                    (workid, oldstatus, newstatus, comment, changedbyemployeeid, changedon)
                VALUES
                    (@WorkId, @OldStatus, 'released', @Comment, @ChangedByEmployeeId, CURRENT_TIMESTAMP)",
                new
                {
                    WorkId = workId,
                    OldStatus = string.IsNullOrWhiteSpace(oldStatus) ? "new" : oldStatus,
                    Comment = "Automatyczna zmiana po zapisaniu faktycznej daty wydania pojazdu",
                    ChangedByEmployeeId = this.EmployeeId()
                });
        }

        private bool WorkExists(Guid workId)
        {
            return session.Connection.ExecuteScalar<bool>(
                "SELECT EXISTS (SELECT 1 FROM domain.work WHERE id = @WorkId)",
                new { WorkId = workId });
        }

        public class WorkVehicleReleaseDto
        {
            public Guid Id { get; set; }
            public Guid WorkId { get; set; }
            public DateTime? PlannedReleaseOn { get; set; }
            public DateTime? ReleasedOn { get; set; }
            public Guid? ReleasedByEmployeeId { get; set; }
            public string ReleasedByEmployeeName { get; set; }
            public string ReceivedByName { get; set; }
            public string IdentityDocumentNumber { get; set; }
            public int? MileageOut { get; set; }
            public string FuelOut { get; set; }
            public string ReleaseNotes { get; set; }
            public bool ClientReceivedDocuments { get; set; }
            public bool ClientReceivedInvoiceInfo { get; set; }
            public bool VehicleWashed { get; set; }
            public bool FinalControlCompleted { get; set; }
            public string ClientSignaturePlaceholder { get; set; }
            public DateTime CreatedOn { get; set; }
            public DateTime ChangedOn { get; set; }
        }

        public class PutWorkVehicleReleaseDto
        {
            public DateTime? PlannedReleaseOn { get; set; }
            public DateTime? ReleasedOn { get; set; }
            public Guid? ReleasedByEmployeeId { get; set; }
            public string ReceivedByName { get; set; }
            public string IdentityDocumentNumber { get; set; }
            public int? MileageOut { get; set; }
            public string FuelOut { get; set; }
            public string ReleaseNotes { get; set; }
            public bool ClientReceivedDocuments { get; set; }
            public bool ClientReceivedInvoiceInfo { get; set; }
            public bool VehicleWashed { get; set; }
            public bool FinalControlCompleted { get; set; }
            public string ClientSignaturePlaceholder { get; set; }
        }

        public class WorkVehicleReleaseProtocolDto
        {
            public Guid WorkId { get; set; }
            public string WorkNr { get; set; }
            public string ClaimNumber { get; set; }
            public string ClientName { get; set; }
            public string ClientAddress { get; set; }
            public string ClientPhone { get; set; }
            public string ClientEmail { get; set; }
            public string VehicleProducer { get; set; }
            public string VehicleModel { get; set; }
            public string VehicleVin { get; set; }
            public string VehicleRegNr { get; set; }
            public DateTime? PlannedReleaseOn { get; set; }
            public DateTime? ReleasedOn { get; set; }
            public string ReleasedByEmployeeName { get; set; }
            public string ReceivedByName { get; set; }
            public string IdentityDocumentNumber { get; set; }
            public int? MileageOut { get; set; }
            public string FuelOut { get; set; }
            public string ReleaseNotes { get; set; }
            public bool ClientReceivedDocuments { get; set; }
            public bool ClientReceivedInvoiceInfo { get; set; }
            public bool VehicleWashed { get; set; }
            public bool FinalControlCompleted { get; set; }
            public string ClientSignaturePlaceholder { get; set; }
            public IEnumerable<WorkVehicleReleaseChecklistDto> Checklist { get; set; } = Array.Empty<WorkVehicleReleaseChecklistDto>();
        }

        public class WorkVehicleReleaseChecklistDto
        {
            public string ItemName { get; set; }
            public bool IsCompleted { get; set; }
            public string Notes { get; set; }
        }
    }

    [TenantRateLimit]
    [Authorize(Policy = "ServerSidePolicy")]
    [ApiController]
    [Route("api/work/vehicle-release-alerts")]
    public class WorkVehicleReleaseAlertsController : ControllerBase
    {
        private readonly NHibernateSession session;

        public WorkVehicleReleaseAlertsController(NHibernateSession session)
        {
            this.session = session;
        }

        [HttpGet]
        public ActionResult<IEnumerable<DashboardWorkItemDto>> Get()
        {
            var alerts = session.Connection.Query<DashboardWorkItemDto>(@"
                WITH release_data AS (
                    SELECT
                        w.id,
                        w.number::text AS worknr,
                        COALESCE(NULLIF(TRIM(w.damagestatus), ''), 'new') AS damagestatus,
                        CONCAT_WS(' ', p.firstname, p.lastname, l.name) AS clientname,
                        v.regnr,
                        COALESCE(r.plannedreleaseon, w.plannedreleaseon) AS plannedreleaseon,
                        r.releasedon,
                        COALESCE(r.finalcontrolcompleted, FALSE) AS finalcontrolcompleted,
                        COALESCE(r.clientreceivedinvoiceinfo, FALSE) AS clientreceivedinvoiceinfo,
                        w.invoiceid,
                        COALESCE(NULLIF(TRIM(w.invoicepaymentstatus), ''), 'not_issued') AS invoicepaymentstatus,
                        COALESCE(NULLIF(TRIM(w.settlementstatus), ''), 'unsettled') AS settlementstatus,
                        EXISTS (
                            SELECT 1
                            FROM domain.work_quality_checklist_item i
                            WHERE i.workid = w.id
                              AND i.groupkey = 'final_control'
                              AND i.iscompleted = TRUE
                        ) AS checklistfinaldone
                    FROM domain.work w
                    LEFT JOIN domain.work_vehicle_release r ON r.workid = w.id
                    LEFT JOIN domain.legalclient l ON l.id = w.clientid
                    LEFT JOIN domain.privateclient p ON p.id = w.clientid
                    LEFT JOIN domain.vehicle v ON v.id = w.vehicleid
                )
                SELECT id, worknr, clientname, regnr, damagestatus, 'vehicle_ready_for_release' AS kind, plannedreleaseon AS scheduledon
                FROM release_data
                WHERE damagestatus IN ('ready_for_pickup', 'quality_control')
                  AND releasedon IS NULL
                UNION ALL
                SELECT id, worknr, clientname, regnr, damagestatus, 'vehicle_release_overdue', plannedreleaseon
                FROM release_data
                WHERE plannedreleaseon IS NOT NULL
                  AND plannedreleaseon < CURRENT_TIMESTAMP
                  AND releasedon IS NULL
                  AND damagestatus NOT IN ('released', 'settled', 'rejected')
                UNION ALL
                SELECT id, worknr, clientname, regnr, damagestatus, 'vehicle_release_without_final_checklist', releasedon
                FROM release_data
                WHERE releasedon IS NOT NULL
                  AND finalcontrolcompleted = FALSE
                  AND checklistfinaldone = FALSE
                UNION ALL
                SELECT id, worknr, clientname, regnr, damagestatus, 'vehicle_release_without_settlement', releasedon
                FROM release_data
                WHERE releasedon IS NOT NULL
                  AND invoiceid IS NULL
                  AND invoicepaymentstatus NOT IN ('paid', 'partially_paid')
                  AND settlementstatus <> 'settled'
                ORDER BY scheduledon NULLS LAST, worknr DESC
                LIMIT 100").ToArray();

            return Ok(alerts);
        }
    }
}
