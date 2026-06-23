using System;
using System.Linq;
using Dapper;
using MechanicBuddy.Core.Application.Extensions;
using MechanicBuddy.Core.Application.RateLimiting;
using MechanicBuddy.Core.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NHibernate;

namespace MechanicBuddy.Http.Api.Controllers
{
    [TenantRateLimit]
    [Authorize(Policy = "ServerSidePolicy")]
    [Route("api/[controller]")]
    public class WorkStatusHistoryController : ControllerBase
    {
        private readonly ISession session;

        public WorkStatusHistoryController(ISession session)
        {
            this.session = session;
        }

        [HttpGet("{id}")]
        public OkObjectResult Get(Guid id)
        {
            var history = session.Connection.Query<WorkStatusHistoryDto>(
                @"select
                    h.id,
                    h.workid,
                    lower(h.oldstatus) as oldstatus,
                    lower(h.newstatus) as newstatus,
                    h.comment,
                    h.changedbyemployeeid,
                    concat_ws(' ', e.firstname, e.lastname) as changedbyname,
                    h.changedon
                  from domain.work_status_history h
                  left join domain.employee e on e.id = h.changedbyemployeeid
                  where h.workid = @id
                  union all
                  select
                    gen_random_uuid() as id,
                    w.id as workid,
                    lower(coalesce(nullif(w.damagestatus, ''), w.userstatus::text, 'new')) as oldstatus,
                    lower(coalesce(nullif(w.damagestatus, ''), w.userstatus::text, 'new')) as newstatus,
                    'Stan początkowy przed włączeniem historii statusów' as comment,
                    w.starterid as changedbyemployeeid,
                    concat_ws(' ', e.firstname, e.lastname) as changedbyname,
                    w.startedon as changedon
                  from domain.work w
                  left join domain.employee e on e.id = w.starterid
                  where w.id = @id
                    and not exists (select 1 from domain.work_status_history h where h.workid = w.id)
                  order by changedon desc",
                new { id }).ToArray();

            return Ok(history);
        }

        [HttpPut("{id}/status/{status}")]
        public OkResult PutStatus(Guid id, string status, [FromBody] PutWorkStatusDto model)
        {
            var work = session.Get<Work>(id);
            var newWorkStatus = (WorkStatus)Enum.Parse(typeof(WorkStatus), status);
            var oldWorkStatus = work.UserStatus;

            if (oldWorkStatus == newWorkStatus)
            {
                return Ok();
            }

            EnsureInitialHistory(work.Id, oldWorkStatus.ToString(), work.StartedOn, work.Starter?.Id);
            work.ChangeState(newWorkStatus);
            if (newWorkStatus != WorkStatus.Closed)
            {
                work.Changed();
            }

            SaveHistory(work.Id, oldWorkStatus.ToString(), newWorkStatus.ToString(), model?.Comment);
            session.Update(work);
            return Ok();
        }

        [HttpPut("{id}/damage-status/{status}")]
        public OkResult PutDamageStatus(Guid id, string status, [FromBody] PutWorkStatusDto model)
        {
            var work = session.Get<Work>(id);
            var oldStatus = string.IsNullOrWhiteSpace(work.DamageStatus) ? "new" : work.DamageStatus;
            var newStatus = string.IsNullOrWhiteSpace(status) ? "new" : status;

            if (string.Equals(oldStatus, newStatus, StringComparison.OrdinalIgnoreCase))
            {
                return Ok();
            }

            EnsureInitialHistory(work.Id, oldStatus, work.StartedOn, work.Starter?.Id);
            work.UpdateClaimDetails(
                work.ClaimNumber,
                work.Insurer,
                work.DamageType,
                newStatus,
                work.AssignmentOfClaimSigned,
                work.ClientPaysVat,
                work.AudatexEstimateNumber,
                work.InsurerNotes);
            work.Changed();

            SaveHistory(work.Id, oldStatus, newStatus, model?.Comment);
            session.Update(work);
            return Ok();
        }

        private void EnsureInitialHistory(Guid workId, string status, DateTime startedOn, Guid? starterId)
        {
            var exists = session.Connection.ExecuteScalar<bool>(
                "select exists(select 1 from domain.work_status_history where workid = @WorkId)",
                new { WorkId = workId });

            if (exists) return;

            session.Connection.Execute(
                @"insert into domain.work_status_history
                    (workid, oldstatus, newstatus, comment, changedbyemployeeid, changedon)
                  values
                    (@WorkId, @Status, @Status, @Comment, @ChangedByEmployeeId, @ChangedOn)",
                new
                {
                    WorkId = workId,
                    Status = status,
                    Comment = "Stan początkowy przed włączeniem historii statusów",
                    ChangedByEmployeeId = starterId,
                    ChangedOn = startedOn
                });
        }

        private void SaveHistory(Guid workId, string oldStatus, string newStatus, string comment)
        {
            session.Connection.Execute(
                @"insert into domain.work_status_history
                    (workid, oldstatus, newstatus, comment, changedbyemployeeid, changedon)
                  values
                    (@WorkId, @OldStatus, @NewStatus, @Comment, @ChangedByEmployeeId, CURRENT_TIMESTAMP)",
                new
                {
                    WorkId = workId,
                    OldStatus = oldStatus,
                    NewStatus = newStatus,
                    Comment = string.IsNullOrWhiteSpace(comment) ? null : comment.Trim(),
                    ChangedByEmployeeId = this.EmployeeId()
                });
        }
    }

    public record PutWorkStatusDto(string Comment);

    public record WorkStatusHistoryDto(
        Guid Id,
        Guid WorkId,
        string OldStatus,
        string NewStatus,
        string Comment,
        Guid? ChangedByEmployeeId,
        string ChangedByName,
        DateTime ChangedOn);
}
