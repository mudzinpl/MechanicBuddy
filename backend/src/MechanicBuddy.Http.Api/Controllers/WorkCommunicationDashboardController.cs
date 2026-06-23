using System;
using System.Linq;
using Dapper;
using MechanicBuddy.Core.Application.RateLimiting;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NHibernate;

namespace MechanicBuddy.Http.Api.Controllers
{
    [TenantRateLimit]
    [Authorize(Policy = "ServerSidePolicy")]
    [ApiController]
    [Route("api/work/communication-alerts")]
    public class WorkCommunicationDashboardController : ControllerBase
    {
        private readonly ISession session;

        public WorkCommunicationDashboardController(ISession session)
        {
            this.session = session;
        }

        [HttpGet]
        public ActionResult<CommunicationDashboardWorkItemDto[]> Get()
        {
            var alerts = session.Connection.Query<CommunicationDashboardWorkItemDto>(@"
                WITH work_data AS (
                    SELECT
                        w.id,
                        w.number::text AS worknr,
                        COALESCE(NULLIF(TRIM(w.damagestatus), ''), 'new') AS damagestatus,
                        CONCAT_WS(' ', p.firstname, p.lastname, l.name) AS clientname,
                        v.regnr,
                        last_contact.lastcontacton
                    FROM domain.work w
                    LEFT JOIN domain.legalclient l ON l.id = w.clientid
                    LEFT JOIN domain.privateclient p ON p.id = w.clientid
                    LEFT JOIN domain.vehicle v ON v.id = w.vehicleid
                    LEFT JOIN LATERAL (
                        SELECT MAX(c.occurredon) AS lastcontacton
                        FROM domain.work_communication_entry c
                        WHERE c.workid = w.id
                    ) last_contact ON TRUE
                    WHERE COALESCE(NULLIF(TRIM(w.damagestatus), ''), 'new') NOT IN ('released', 'settled', 'rejected')
                )
                SELECT DISTINCT wd.id, wd.worknr, wd.clientname, wd.regnr, wd.damagestatus, 'communication_waiting_client' AS kind, c.occurredon AS scheduledon
                FROM work_data wd
                INNER JOIN domain.work_communication_entry c ON c.workid = wd.id
                WHERE c.status = 'waiting_for_response'
                  AND c.category IN ('phone_to_client', 'phone_from_client', 'email', 'sms')
                UNION ALL
                SELECT DISTINCT wd.id, wd.worknr, wd.clientname, wd.regnr, wd.damagestatus, 'communication_waiting_insurer', c.occurredon
                FROM work_data wd
                INNER JOIN domain.work_communication_entry c ON c.workid = wd.id
                WHERE c.status = 'waiting_for_response'
                  AND c.category IN ('phone_to_insurer', 'phone_from_insurer', 'email')
                UNION ALL
                SELECT wd.id, wd.worknr, wd.clientname, wd.regnr, wd.damagestatus, 'communication_no_contact_7_days', wd.lastcontacton
                FROM work_data wd
                WHERE wd.lastcontacton IS NULL OR wd.lastcontacton < CURRENT_TIMESTAMP - INTERVAL '7 days'
                UNION ALL
                SELECT DISTINCT wd.id, wd.worknr, wd.clientname, wd.regnr, wd.damagestatus, 'communication_unresolved', c.occurredon
                FROM work_data wd
                INNER JOIN domain.work_communication_entry c ON c.workid = wd.id
                WHERE c.status NOT IN ('answered', 'closed')
                ORDER BY scheduledon NULLS LAST, worknr DESC
                LIMIT 100").ToArray();

            return Ok(alerts);
        }
    }

    public class CommunicationDashboardWorkItemDto
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
