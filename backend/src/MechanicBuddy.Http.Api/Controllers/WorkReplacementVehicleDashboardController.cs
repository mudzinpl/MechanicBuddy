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
    public class WorkReplacementVehicleDashboardController : ControllerBase
    {
        private readonly ISession session;

        public WorkReplacementVehicleDashboardController(ISession session)
        {
            this.session = session;
        }

        [HttpGet("replacement-vehicle-dashboard")]
        public dynamic Dashboard()
        {
            const string baseReplacementCte = @"
                WITH replacement_data AS (
                    SELECT
                        w.id,
                        w.number::text AS worknr,
                        COALESCE(NULLIF(TRIM(w.damagestatus), ''), 'new') AS damagestatus,
                        CONCAT_WS(' ', p.firstname, p.lastname, l.name) AS clientname,
                        v.regnr,
                        rv.issuedon,
                        rv.plannedreturnon
                    FROM domain.work_replacement_vehicle rv
                    INNER JOIN domain.work w ON w.id = rv.workid
                    LEFT JOIN domain.legalclient l ON l.id = w.clientid
                    LEFT JOIN domain.privateclient p ON p.id = w.clientid
                    LEFT JOIN domain.vehicle v ON v.id = w.vehicleid
                    WHERE rv.status = 'issued'
                )";

            var tiles = session.Connection.Query<ReplacementVehicleDashboardTileDto>(baseReplacementCte + @"
                SELECT 'active_replacement_vehicles' AS key, COUNT(*)::int AS count FROM replacement_data
                UNION ALL SELECT 'replacement_returns_due', COUNT(*)::int FROM replacement_data
                    WHERE plannedreturnon IS NULL
                       OR (plannedreturnon AT TIME ZONE 'Europe/Warsaw')::date <= (CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Warsaw')::date
                UNION ALL SELECT 'replacement_returns_overdue', COUNT(*)::int FROM replacement_data
                    WHERE plannedreturnon IS NOT NULL
                      AND (plannedreturnon AT TIME ZONE 'Europe/Warsaw')::date < (CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Warsaw')::date").ToArray();

            var attention = session.Connection.Query<ReplacementVehicleDashboardWorkItemDto>(baseReplacementCte + @"
                SELECT id, worknr, clientname, regnr, damagestatus, 'replacement_without_return_date' AS kind, issuedon AS scheduledon
                FROM replacement_data
                WHERE plannedreturnon IS NULL
                UNION ALL
                SELECT id, worknr, clientname, regnr, damagestatus, 'replacement_return_overdue', plannedreturnon
                FROM replacement_data
                WHERE plannedreturnon IS NOT NULL
                  AND (plannedreturnon AT TIME ZONE 'Europe/Warsaw')::date < (CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Warsaw')::date
                UNION ALL
                SELECT id, worknr, clientname, regnr, damagestatus, 'replacement_issued_over_14_days', issuedon
                FROM replacement_data
                WHERE issuedon IS NOT NULL
                  AND issuedon < CURRENT_TIMESTAMP - INTERVAL '14 days'
                ORDER BY scheduledon NULLS LAST, worknr
                LIMIT 100").ToArray();

            return new { Tiles = tiles, Attention = attention };
        }

        private sealed class ReplacementVehicleDashboardTileDto
        {
            public string Key { get; set; }
            public int Count { get; set; }
        }

        private sealed class ReplacementVehicleDashboardWorkItemDto
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
