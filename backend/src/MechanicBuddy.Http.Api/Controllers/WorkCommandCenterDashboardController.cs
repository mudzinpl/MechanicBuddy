using Dapper;
using MechanicBuddy.Core.Application.RateLimiting;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NHibernate;
using System;
using System.Linq;

namespace MechanicBuddy.Http.Api.Controllers
{
    [TenantRateLimit]
    [Authorize(Policy = "ServerSidePolicy")]
    [Route("api/work")]
    public class WorkCommandCenterDashboardController : ControllerBase
    {
        private readonly ISession session;

        public WorkCommandCenterDashboardController(ISession session)
        {
            this.session = session;
        }

        [HttpGet("command-center-dashboard")]
        public dynamic Dashboard()
        {
            var hasWorkPartOrders = session.Connection.ExecuteScalar<bool>("SELECT to_regclass('domain.work_part_order') IS NOT NULL");

            const string baseWorkCte = @"
                WITH work_data AS (
                    SELECT
                        w.id,
                        w.number::text AS worknr,
                        COALESCE(NULLIF(TRIM(w.damagestatus), ''), 'new') AS damagestatus,
                        w.estimatesenton,
                        w.insurerdecisionon,
                        w.audatexestimatenumber,
                        w.assignmentofclaimsigned,
                        w.powerofattorneysigned,
                        w.clientpaysvat,
                        w.clientvatamount,
                        w.underpaymentamount,
                        w.settlementstatus,
                        w.invoiceid,
                        w.invoicepaymentstatus,
                        w.paymentdueon,
                        w.plannedintakeon,
                        w.plannedinspectionon,
                        w.plannedreleaseon,
                        w.changedon,
                        CONCAT_WS(' ', p.firstname, p.lastname, l.name) AS clientname,
                        v.regnr
                    FROM domain.work w
                    LEFT JOIN domain.legalclient l ON l.id = w.clientid
                    LEFT JOIN domain.privateclient p ON p.id = w.clientid
                    LEFT JOIN domain.vehicle v ON v.id = w.vehicleid
                )";

            var partsWaitingKpiSql = hasWorkPartOrders
                ? @"UNION ALL SELECT 'parts_waiting', COUNT(DISTINCT workid)::int, NULL::numeric
                FROM domain.work_part_order WHERE status IN ('to_order', 'ordered', 'in_delivery')"
                : @"UNION ALL SELECT 'parts_waiting', 0::int, NULL::numeric";

            var overduePartItemsSql = hasWorkPartOrders
                ? @"UNION ALL SELECT po.workid FROM domain.work_part_order po
                      WHERE po.status IN ('ordered', 'in_delivery')
                        AND po.planneddeliveryon IS NOT NULL
                        AND (po.planneddeliveryon AT TIME ZONE 'Europe/Warsaw')::date < (CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Warsaw')::date"
                : string.Empty;

            var attentionPartsOverdueSql = hasWorkPartOrders
                ? @"UNION ALL
                SELECT w.id, w.worknr, w.clientname, w.regnr, w.damagestatus, 'parts_delivery_overdue', po.planneddeliveryon
                FROM domain.work_part_order po
                INNER JOIN work_data w ON w.id = po.workid
                WHERE po.status IN ('ordered', 'in_delivery')
                  AND po.planneddeliveryon IS NOT NULL
                  AND (po.planneddeliveryon AT TIME ZONE 'Europe/Warsaw')::date < (CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Warsaw')::date"
                : string.Empty;

            var kpis = session.Connection.Query<CommandCenterTileDto>(baseWorkCte + $@"
                SELECT 'active_work' AS key, COUNT(*)::int AS count, NULL::numeric AS amount
                FROM work_data WHERE damagestatus NOT IN ('released', 'settled', 'rejected')
                UNION ALL SELECT 'ready_for_pickup', COUNT(*)::int, NULL::numeric
                FROM work_data WHERE damagestatus = 'ready_for_pickup'
                {partsWaitingKpiSql}
                UNION ALL SELECT 'overdue', COUNT(DISTINCT id)::int, NULL::numeric FROM (
                    SELECT id FROM work_data WHERE plannedreleaseon IS NOT NULL
                      AND (plannedreleaseon AT TIME ZONE 'Europe/Warsaw')::date < (CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Warsaw')::date
                      AND damagestatus NOT IN ('released', 'settled', 'rejected')
                    {overduePartItemsSql}
                    UNION ALL SELECT wt.workid FROM domain.work_task wt
                      WHERE wt.status NOT IN ('completed', 'cancelled')
                        AND wt.dueon IS NOT NULL
                        AND (wt.dueon AT TIME ZONE 'Europe/Warsaw')::date < (CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Warsaw')::date
                    UNION ALL SELECT rv.workid FROM domain.work_replacement_vehicle rv
                      WHERE rv.status = 'issued'
                        AND rv.plannedreturnon IS NOT NULL
                        AND (rv.plannedreturnon AT TIME ZONE 'Europe/Warsaw')::date < (CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Warsaw')::date
                ) overdue_items
                UNION ALL SELECT 'missing_estimate', COUNT(*)::int, NULL::numeric
                FROM work_data WHERE damagestatus NOT IN ('released', 'settled', 'rejected') AND COALESCE(TRIM(audatexestimatenumber), '') = ''
                UNION ALL SELECT 'unsettled', COUNT(*)::int, NULL::numeric
                FROM work_data WHERE COALESCE(settlementstatus, 'unsettled') <> 'settled'
                UNION ALL SELECT 'active_replacement_vehicles', COUNT(DISTINCT workid)::int, NULL::numeric
                FROM domain.work_replacement_vehicle WHERE status = 'issued'
                UNION ALL SELECT 'task_overdue', COUNT(*)::int, NULL::numeric
                FROM domain.work_task WHERE status NOT IN ('completed', 'cancelled')
                  AND dueon IS NOT NULL
                  AND (dueon AT TIME ZONE 'Europe/Warsaw')::date < (CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Warsaw')::date").ToArray();

            var attention = session.Connection.Query<CommandCenterWorkItemDto>(baseWorkCte + $@"
                SELECT id, worknr, clientname, regnr, damagestatus, 'insurer_decision_overdue' AS kind, estimatesenton AS scheduledon
                FROM work_data WHERE estimatesenton IS NOT NULL AND insurerdecisionon IS NULL AND estimatesenton < CURRENT_TIMESTAMP - INTERVAL '3 days'
                UNION ALL
                SELECT id, worknr, clientname, regnr, damagestatus, 'missing_assignment', NULL::timestamptz
                FROM work_data WHERE damagestatus NOT IN ('released', 'settled', 'rejected') AND assignmentofclaimsigned = FALSE
                UNION ALL
                SELECT id, worknr, clientname, regnr, damagestatus, 'missing_power_of_attorney', NULL::timestamptz
                FROM work_data WHERE damagestatus NOT IN ('released', 'settled', 'rejected') AND powerofattorneysigned = FALSE
                UNION ALL
                SELECT id, worknr, clientname, regnr, damagestatus, 'missing_estimate', NULL::timestamptz
                FROM work_data WHERE damagestatus NOT IN ('released', 'settled', 'rejected') AND COALESCE(TRIM(audatexestimatenumber), '') = ''
                {attentionPartsOverdueSql}
                UNION ALL
                SELECT w.id, w.worknr, w.clientname, w.regnr, w.damagestatus, 'replacement_return_overdue', rv.plannedreturnon
                FROM domain.work_replacement_vehicle rv
                INNER JOIN work_data w ON w.id = rv.workid
                WHERE rv.status = 'issued'
                  AND rv.plannedreturnon IS NOT NULL
                  AND (rv.plannedreturnon AT TIME ZONE 'Europe/Warsaw')::date < (CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Warsaw')::date
                UNION ALL
                SELECT id, worknr, clientname, regnr, damagestatus, 'payment_overdue', paymentdueon
                FROM work_data WHERE COALESCE(invoicepaymentstatus, 'not_issued') NOT IN ('paid', 'disputed')
                  AND paymentdueon IS NOT NULL
                  AND (paymentdueon AT TIME ZONE 'Europe/Warsaw')::date < (CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Warsaw')::date
                UNION ALL
                SELECT w.id, w.worknr, w.clientname, w.regnr, w.damagestatus, 'task_overdue', wt.dueon
                FROM domain.work_task wt
                INNER JOIN work_data w ON w.id = wt.workid
                WHERE wt.status NOT IN ('completed', 'cancelled')
                  AND wt.dueon IS NOT NULL
                  AND (wt.dueon AT TIME ZONE 'Europe/Warsaw')::date < (CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Warsaw')::date
                UNION ALL
                SELECT id, worknr, clientname, regnr, damagestatus, 'checklist_incomplete_ready', NULL::timestamptz
                FROM work_data w
                WHERE damagestatus = 'ready_for_pickup'
                  AND EXISTS (
                      SELECT 1 FROM domain.work_quality_checklist_item qi
                      WHERE qi.workid = w.id AND qi.iscompleted = FALSE
                  )
                ORDER BY scheduledon NULLS LAST, worknr DESC
                LIMIT 200").ToArray();

            var today = session.Connection.Query<CommandCenterWorkItemDto>(baseWorkCte + @"
                SELECT id, worknr, clientname, regnr, damagestatus, 'intake' AS kind, plannedintakeon AS scheduledon
                FROM work_data WHERE (plannedintakeon AT TIME ZONE 'Europe/Warsaw')::date = (CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Warsaw')::date
                UNION ALL
                SELECT id, worknr, clientname, regnr, damagestatus, 'inspection', plannedinspectionon
                FROM work_data WHERE (plannedinspectionon AT TIME ZONE 'Europe/Warsaw')::date = (CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Warsaw')::date
                UNION ALL
                SELECT id, worknr, clientname, regnr, damagestatus, 'release', plannedreleaseon
                FROM work_data WHERE (plannedreleaseon AT TIME ZONE 'Europe/Warsaw')::date = (CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Warsaw')::date
                UNION ALL
                SELECT w.id, w.worknr, w.clientname, w.regnr, w.damagestatus, 'replacement_return', rv.plannedreturnon
                FROM domain.work_replacement_vehicle rv
                INNER JOIN work_data w ON w.id = rv.workid
                WHERE rv.status = 'issued'
                  AND rv.plannedreturnon IS NOT NULL
                  AND (rv.plannedreturnon AT TIME ZONE 'Europe/Warsaw')::date = (CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Warsaw')::date
                UNION ALL
                SELECT id, worknr, clientname, regnr, damagestatus, 'payment_due', paymentdueon
                FROM work_data WHERE COALESCE(invoicepaymentstatus, 'not_issued') NOT IN ('paid', 'disputed')
                  AND paymentdueon IS NOT NULL
                  AND (paymentdueon AT TIME ZONE 'Europe/Warsaw')::date = (CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Warsaw')::date
                UNION ALL
                SELECT w.id, w.worknr, w.clientname, w.regnr, w.damagestatus, 'task_due', wt.dueon
                FROM domain.work_task wt
                INNER JOIN work_data w ON w.id = wt.workid
                WHERE wt.status NOT IN ('completed', 'cancelled')
                  AND wt.dueon IS NOT NULL
                  AND (wt.dueon AT TIME ZONE 'Europe/Warsaw')::date = (CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Warsaw')::date
                ORDER BY scheduledon, worknr").ToArray();

            var process = session.Connection.Query<CommandCenterTileDto>(baseWorkCte + @"
                SELECT 'new' AS key, COUNT(*)::int AS count, NULL::numeric AS amount FROM work_data WHERE damagestatus = 'new'
                UNION ALL SELECT 'inspection_pending', COUNT(*)::int, NULL::numeric FROM work_data WHERE damagestatus = 'inspection_pending'
                UNION ALL SELECT 'estimate_done', COUNT(*)::int, NULL::numeric FROM work_data WHERE damagestatus IN ('estimate_sent', 'estimate_preparing')
                UNION ALL SELECT 'approval_pending', COUNT(*)::int, NULL::numeric FROM work_data WHERE damagestatus = 'approval_pending'
                UNION ALL SELECT 'parts_ordered', COUNT(*)::int, NULL::numeric FROM work_data WHERE damagestatus = 'parts_pending'
                UNION ALL SELECT 'repair', COUNT(*)::int, NULL::numeric FROM work_data WHERE damagestatus = 'repair'
                UNION ALL SELECT 'paint_shop', COUNT(*)::int, NULL::numeric FROM work_data WHERE damagestatus = 'paint_shop'
                UNION ALL SELECT 'quality_control', COUNT(*)::int, NULL::numeric FROM work_data WHERE damagestatus = 'quality_control'
                UNION ALL SELECT 'ready_for_pickup', COUNT(*)::int, NULL::numeric FROM work_data WHERE damagestatus = 'ready_for_pickup'
                UNION ALL SELECT 'released', COUNT(*)::int, NULL::numeric FROM work_data WHERE damagestatus = 'released'").ToArray();

            var replacements = session.Connection.Query<CommandCenterTileDto>(@"
                SELECT 'active' AS key, COUNT(*)::int AS count, NULL::numeric AS amount
                FROM domain.work_replacement_vehicle WHERE status = 'issued'
                UNION ALL SELECT 'due_today', COUNT(*)::int, NULL::numeric
                FROM domain.work_replacement_vehicle
                WHERE status = 'issued' AND plannedreturnon IS NOT NULL
                  AND (plannedreturnon AT TIME ZONE 'Europe/Warsaw')::date = (CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Warsaw')::date
                UNION ALL SELECT 'overdue', COUNT(*)::int, NULL::numeric
                FROM domain.work_replacement_vehicle
                WHERE status = 'issued' AND plannedreturnon IS NOT NULL
                  AND (plannedreturnon AT TIME ZONE 'Europe/Warsaw')::date < (CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Warsaw')::date
                UNION ALL SELECT 'without_return_date', COUNT(*)::int, NULL::numeric
                FROM domain.work_replacement_vehicle
                WHERE status = 'issued' AND plannedreturnon IS NULL").ToArray();

            var finance = session.Connection.Query<CommandCenterTileDto>(baseWorkCte + @"
                SELECT 'underpayment_total' AS key, COUNT(*)::int AS count, COALESCE(SUM(underpaymentamount), 0)::numeric AS amount
                FROM work_data WHERE COALESCE(underpaymentamount, 0) > 0
                UNION ALL SELECT 'overdue_payments', COUNT(*)::int, COALESCE(SUM(underpaymentamount), 0)::numeric
                FROM work_data WHERE COALESCE(invoicepaymentstatus, 'not_issued') NOT IN ('paid', 'disputed')
                  AND paymentdueon IS NOT NULL
                  AND (paymentdueon AT TIME ZONE 'Europe/Warsaw')::date < (CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Warsaw')::date
                UNION ALL SELECT 'not_issued_invoices', COUNT(*)::int, NULL::numeric
                FROM work_data WHERE invoiceid IS NULL AND damagestatus IN ('quality_control', 'ready_for_pickup', 'released', 'settled')
                UNION ALL SELECT 'disputed_cases', COUNT(*)::int, NULL::numeric
                FROM work_data WHERE invoicepaymentstatus = 'disputed'
                UNION ALL SELECT 'vat_payments', COUNT(*)::int, COALESCE(SUM(clientvatamount), 0)::numeric
                FROM work_data WHERE clientpaysvat = TRUE").ToArray();

            return new
            {
                Kpis = kpis,
                Attention = attention,
                Today = today,
                Process = process,
                Replacements = replacements,
                Finance = finance
            };
        }

        private sealed class CommandCenterTileDto
        {
            public string Key { get; set; }
            public int Count { get; set; }
            public decimal? Amount { get; set; }
        }

        private sealed class CommandCenterWorkItemDto
        {
            public Guid Id { get; set; }
            public string WorkNr { get; set; }
            public string ClientName { get; set; }
            public string RegNr { get; set; }
            public string DamageStatus { get; set; }
            public string Kind { get; set; }
            public DateTime? ScheduledOn { get; set; }
        }
    }
}
