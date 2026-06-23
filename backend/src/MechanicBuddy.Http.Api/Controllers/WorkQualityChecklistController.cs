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
    [Route("api/work/{workId:guid}/quality-checklist")]
    public class WorkQualityChecklistController : ControllerBase
    {
        private readonly NHibernateSession session;

        public WorkQualityChecklistController(NHibernateSession session)
        {
            this.session = session;
        }

        [HttpGet]
        public ActionResult<IEnumerable<WorkQualityChecklistItemDto>> GetAll(Guid workId)
        {
            if (!WorkExists(workId)) return NotFound();
            EnsureDefaults(workId);

            var items = session.Connection.Query<WorkQualityChecklistItemDto>(@"
                SELECT
                    i.id,
                    i.workid,
                    i.itemkey,
                    i.groupkey,
                    i.itemname,
                    i.description,
                    i.iscompleted,
                    i.completedbyemployeeid,
                    CONCAT_WS(' ', e.firstname, e.lastname) AS completedbyemployeename,
                    i.completedon,
                    i.notes,
                    i.sortorder,
                    i.createdon,
                    i.changedon
                FROM domain.work_quality_checklist_item i
                LEFT JOIN domain.employee e ON e.id = i.completedbyemployeeid
                WHERE i.workid = @WorkId
                ORDER BY i.sortorder, i.itemname", new { WorkId = workId }).ToArray();

            return Ok(items);
        }

        [HttpPut("{itemId:guid}")]
        public IActionResult Put(Guid workId, Guid itemId, [FromBody] PutWorkQualityChecklistItemDto model)
        {
            var item = session.Connection.QuerySingleOrDefault<ChecklistAccessRow>(@"
                SELECT itemkey, groupkey
                FROM domain.work_quality_checklist_item
                WHERE id = @ItemId AND workid = @WorkId",
                new { WorkId = workId, ItemId = itemId });

            if (item == null) return NotFound();
            if (IsWorkshopWorker() && item.GroupKey is "final_control" or "vehicle_release")
                return BadRequest("Kontrolę końcową i wydanie pojazdu może zatwierdzić kierownik lub administrator.");

            var employeeId = this.EmployeeId();
            session.Connection.Execute(@"
                UPDATE domain.work_quality_checklist_item
                SET
                    iscompleted = @IsCompleted,
                    completedbyemployeeid = CASE WHEN @IsCompleted THEN @EmployeeId ELSE NULL END,
                    completedon = CASE WHEN @IsCompleted THEN COALESCE(completedon, CURRENT_TIMESTAMP) ELSE NULL END,
                    notes = @Notes,
                    changedon = CURRENT_TIMESTAMP
                WHERE id = @ItemId AND workid = @WorkId",
                new
                {
                    WorkId = workId,
                    ItemId = itemId,
                    model.IsCompleted,
                    model.Notes,
                    EmployeeId = employeeId
                });

            session.Connection.Execute("UPDATE domain.work SET changedon = CURRENT_TIMESTAMP WHERE id = @WorkId", new { WorkId = workId });
            return Ok(new { Success = true });
        }

        private bool WorkExists(Guid workId)
        {
            return session.Connection.ExecuteScalar<bool>(
                "SELECT EXISTS (SELECT 1 FROM domain.work WHERE id = @WorkId)",
                new { WorkId = workId });
        }

        private bool IsWorkshopWorker()
        {
            var employeeId = this.EmployeeId();
            var employee = employeeId is Guid id ? session.Get<Employee>(id) : null;
            var roleText = string.Join(" ", employee?.Proffession, employee?.Description).ToLowerInvariant();
            return roleText.Contains("mechanik") || roleText.Contains("lakiernik");
        }

        private void EnsureDefaults(Guid workId)
        {
            session.Connection.Execute(@"
                INSERT INTO domain.work_quality_checklist_item
                    (id, workid, itemkey, groupkey, itemname, description, sortorder, createdon, changedon)
                SELECT uuid_generate_v4(), @WorkId, itemkey, groupkey, itemname, description, sortorder, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                FROM (VALUES
                    ('vehicle_photos_done', 'vehicle_intake', 'Zdjęcia pojazdu wykonane', 'Dokumentacja fotograficzna przy przyjęciu pojazdu.', 10),
                    ('client_documents_added', 'documents', 'Dokumenty klienta dodane', 'Dokumenty klienta są dodane do sprawy.', 20),
                    ('assignment_checked', 'documents', 'Cesja sprawdzona', 'Cesja została zweryfikowana przed rozliczeniem.', 30),
                    ('estimate_checked', 'inspection', 'Kosztorys sprawdzony', 'Kosztorys naprawy został sprawdzony.', 40),
                    ('parts_ordered', 'parts', 'Części zamówione', 'Części potrzebne do naprawy zostały zamówione.', 50),
                    ('parts_delivered', 'parts', 'Części dostarczone', 'Części potrzebne do naprawy są dostarczone.', 60),
                    ('repair_completed', 'mechanical_repair', 'Naprawa zakończona', 'Prace naprawcze zostały zakończone.', 70),
                    ('fitment_checked', 'body_repair', 'Kontrola spasowania', 'Sprawdzone spasowanie elementów nadwozia.', 80),
                    ('paint_checked', 'painting', 'Kontrola lakieru', 'Powłoka lakiernicza została sprawdzona.', 90),
                    ('electronics_checked', 'final_control', 'Kontrola elektroniki', 'Sprawdzono podstawowe układy elektroniczne.', 100),
                    ('test_drive_done', 'final_control', 'Jazda próbna', 'Wykonano jazdę próbną po naprawie.', 110),
                    ('vehicle_washed', 'washing', 'Pojazd umyty', 'Pojazd został umyty i przygotowany do wydania.', 120),
                    ('release_documents_ready', 'vehicle_release', 'Dokumenty wydania przygotowane', 'Dokumenty potrzebne do wydania pojazdu są przygotowane.', 130)
                ) defaults(itemkey, groupkey, itemname, description, sortorder)
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM domain.work_quality_checklist_item existing
                    WHERE existing.workid = @WorkId AND existing.itemkey = defaults.itemkey
                )", new { WorkId = workId });
        }

        private class ChecklistAccessRow
        {
            public string ItemKey { get; set; }
            public string GroupKey { get; set; }
        }

        public class WorkQualityChecklistItemDto
        {
            public Guid Id { get; set; }
            public Guid WorkId { get; set; }
            public string ItemKey { get; set; }
            public string GroupKey { get; set; }
            public string ItemName { get; set; }
            public string Description { get; set; }
            public bool IsCompleted { get; set; }
            public Guid? CompletedByEmployeeId { get; set; }
            public string CompletedByEmployeeName { get; set; }
            public DateTime? CompletedOn { get; set; }
            public string Notes { get; set; }
            public int SortOrder { get; set; }
            public DateTime CreatedOn { get; set; }
            public DateTime ChangedOn { get; set; }
        }

        public class PutWorkQualityChecklistItemDto
        {
            public bool IsCompleted { get; set; }
            public string Notes { get; set; }
        }
    }

    [TenantRateLimit]
    [Authorize(Policy = "ServerSidePolicy")]
    [ApiController]
    [Route("api/work/quality-checklist-alerts")]
    public class WorkQualityChecklistAlertsController : ControllerBase
    {
        private readonly NHibernateSession session;

        public WorkQualityChecklistAlertsController(NHibernateSession session)
        {
            this.session = session;
        }

        [HttpGet]
        public ActionResult<IEnumerable<DashboardWorkItemDto>> Get()
        {
            var alerts = session.Connection.Query<DashboardWorkItemDto>(@"
                WITH checklist AS (
                    SELECT
                        w.id,
                        w.number::text AS worknr,
                        COALESCE(NULLIF(TRIM(w.damagestatus), ''), 'new') AS damagestatus,
                        CONCAT_WS(' ', p.firstname, p.lastname, l.name) AS clientname,
                        v.regnr,
                        COUNT(i.id) AS totalitems,
                        COUNT(i.id) FILTER (WHERE i.iscompleted) AS completeditems,
                        BOOL_OR(i.groupkey = 'final_control' AND i.iscompleted) AS finalcontrolcompleted,
                        BOOL_AND(CASE WHEN i.groupkey <> 'final_control' THEN i.iscompleted ELSE TRUE END) AS nonfinalcompleted
                    FROM domain.work w
                    INNER JOIN domain.work_quality_checklist_item i ON i.workid = w.id
                    LEFT JOIN domain.legalclient l ON l.id = w.clientid
                    LEFT JOIN domain.privateclient p ON p.id = w.clientid
                    LEFT JOIN domain.vehicle v ON v.id = w.vehicleid
                    WHERE COALESCE(NULLIF(TRIM(w.damagestatus), ''), 'new') NOT IN ('released', 'settled', 'rejected')
                    GROUP BY w.id, w.number, w.damagestatus, p.firstname, p.lastname, l.name, v.regnr
                )
                SELECT id, worknr, clientname, regnr, damagestatus, 'checklist_incomplete' AS kind, NULL::timestamptz AS scheduledon
                FROM checklist WHERE totalitems > completeditems
                UNION ALL
                SELECT id, worknr, clientname, regnr, damagestatus, 'ready_for_quality_control', NULL::timestamptz
                FROM checklist WHERE nonfinalcompleted = TRUE AND finalcontrolcompleted = FALSE
                UNION ALL
                SELECT id, worknr, clientname, regnr, damagestatus, 'quality_control_completed', NULL::timestamptz
                FROM checklist WHERE finalcontrolcompleted = TRUE
                ORDER BY worknr DESC
                LIMIT 100").ToArray();

            return Ok(alerts);
        }
    }
}
