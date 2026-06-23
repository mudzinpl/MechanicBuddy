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
                  order by h.changedon desc",
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

            work.ChangeState(newWorkStatus);
            if (newWorkStatus != WorkStatus.Closed)
            {
                work.Changed();
            }

            session.Connection.Execute(
                @"insert into domain.work_status_history
                    (workid, oldstatus, newstatus, comment, changedbyemployeeid, changedon)
                  values
                    (@WorkId, @OldStatus, @NewStatus, @Comment, @ChangedByEmployeeId, CURRENT_TIMESTAMP)",
                new
                {
                    WorkId = work.Id,
                    OldStatus = oldWorkStatus.ToString(),
                    NewStatus = newWorkStatus.ToString(),
                    Comment = string.IsNullOrWhiteSpace(model?.Comment) ? null : model.Comment.Trim(),
                    ChangedByEmployeeId = this.EmployeeId()
                });

            session.Update(work);
            return Ok();
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
