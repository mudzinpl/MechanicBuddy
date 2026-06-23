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
    [Route("api/work/{workId:guid}/tasks")]
    public class WorkTasksController : ControllerBase
    {
        private readonly NHibernateSession session;

        public WorkTasksController(NHibernateSession session)
        {
            this.session = session;
        }

        [HttpGet]
        public ActionResult<IEnumerable<WorkTaskDto>> GetAll(Guid workId)
        {
            if (!WorkExists(workId)) return NotFound();
            var access = GetTaskAccess();

            var items = session.Connection.Query<WorkTaskDto>(@"
                SELECT
                    t.id,
                    t.workid,
                    t.title,
                    t.description,
                    t.tasktype,
                    t.assignedemployeeid,
                    CONCAT_WS(' ', assigned.firstname, assigned.lastname) AS assignedemployeename,
                    t.status,
                    t.priority,
                    t.dueon,
                    t.completedon,
                    t.comment,
                    t.createdbyemployeeid,
                    CONCAT_WS(' ', creator.firstname, creator.lastname) AS createdbyemployeename,
                    t.createdon,
                    t.changedon
                FROM domain.work_task t
                LEFT JOIN domain.employee assigned ON assigned.id = t.assignedemployeeid
                LEFT JOIN domain.employee creator ON creator.id = t.createdbyemployeeid
                WHERE t.workid = @WorkId
                  AND (@OnlyOwn = FALSE OR t.assignedemployeeid = @EmployeeId)
                ORDER BY
                    CASE t.priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 WHEN 'normal' THEN 2 ELSE 3 END,
                    t.dueon NULLS LAST,
                    t.changedon DESC",
                new { WorkId = workId, access.EmployeeId, access.OnlyOwn }).ToArray();

            return Ok(items);
        }

        [HttpPost]
        public IActionResult Post(Guid workId, [FromBody] PutWorkTaskDto model)
        {
            if (!WorkExists(workId)) return NotFound();
            if (string.IsNullOrWhiteSpace(model.Title)) return BadRequest("Podaj tytuł zadania.");

            var id = Guid.NewGuid();
            session.Connection.Execute(@"
                INSERT INTO domain.work_task (
                    id, workid, title, description, tasktype, assignedemployeeid, status,
                    priority, dueon, completedon, comment, createdbyemployeeid, createdon, changedon)
                VALUES (
                    @Id, @WorkId, @Title, @Description, COALESCE(NULLIF(TRIM(@TaskType), ''), 'other'), @AssignedEmployeeId,
                    COALESCE(NULLIF(TRIM(@Status), ''), 'new'), COALESCE(NULLIF(TRIM(@Priority), ''), 'normal'),
                    @DueOn, @CompletedOn, @Comment, @CreatedByEmployeeId, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
                new
                {
                    Id = id,
                    WorkId = workId,
                    model.Title,
                    model.Description,
                    model.TaskType,
                    model.AssignedEmployeeId,
                    model.Status,
                    model.Priority,
                    model.DueOn,
                    model.CompletedOn,
                    model.Comment,
                    CreatedByEmployeeId = this.EmployeeId()
                });

            TouchWork(workId);
            return Ok(id);
        }

        [HttpPut("{taskId:guid}")]
        public IActionResult Put(Guid workId, Guid taskId, [FromBody] PutWorkTaskDto model)
        {
            if (string.IsNullOrWhiteSpace(model.Title)) return BadRequest("Podaj tytuł zadania.");
            var access = GetTaskAccess();

            var affected = session.Connection.Execute(@"
                UPDATE domain.work_task
                SET
                    title = @Title,
                    description = @Description,
                    tasktype = COALESCE(NULLIF(TRIM(@TaskType), ''), 'other'),
                    assignedemployeeid = @AssignedEmployeeId,
                    status = COALESCE(NULLIF(TRIM(@Status), ''), 'new'),
                    priority = COALESCE(NULLIF(TRIM(@Priority), ''), 'normal'),
                    dueon = @DueOn,
                    completedon = @CompletedOn,
                    comment = @Comment,
                    changedon = CURRENT_TIMESTAMP
                WHERE id = @TaskId
                  AND workid = @WorkId
                  AND (@OnlyOwn = FALSE OR assignedemployeeid = @EmployeeId)",
                new
                {
                    WorkId = workId,
                    TaskId = taskId,
                    access.EmployeeId,
                    access.OnlyOwn,
                    model.Title,
                    model.Description,
                    model.TaskType,
                    model.AssignedEmployeeId,
                    model.Status,
                    model.Priority,
                    model.DueOn,
                    model.CompletedOn,
                    model.Comment
                });

            if (affected == 0) return NotFound();
            TouchWork(workId);
            return Ok(new { Success = true });
        }

        [HttpDelete("{taskId:guid}")]
        public IActionResult Delete(Guid workId, Guid taskId)
        {
            var access = GetTaskAccess();
            var affected = session.Connection.Execute(@"
                DELETE FROM domain.work_task
                WHERE id = @TaskId
                  AND workid = @WorkId
                  AND (@OnlyOwn = FALSE OR assignedemployeeid = @EmployeeId)",
                new { WorkId = workId, TaskId = taskId, access.EmployeeId, access.OnlyOwn });

            if (affected == 0) return NotFound();
            TouchWork(workId);
            return Ok(new { Success = true });
        }

        private bool WorkExists(Guid workId)
        {
            return session.Connection.ExecuteScalar<bool>(
                "SELECT EXISTS (SELECT 1 FROM domain.work WHERE id = @WorkId)",
                new { WorkId = workId });
        }

        private void TouchWork(Guid workId)
        {
            session.Connection.Execute("UPDATE domain.work SET changedon = CURRENT_TIMESTAMP WHERE id = @WorkId", new { WorkId = workId });
        }

        private TaskAccess GetTaskAccess()
        {
            var employeeId = this.EmployeeId();
            var employee = employeeId is Guid id ? session.Get<Employee>(id) : null;
            var roleText = string.Join(" ", employee?.Proffession, employee?.Description).ToLowerInvariant();
            var onlyOwn = roleText.Contains("mechanik") || roleText.Contains("lakiernik");
            return new TaskAccess(employeeId, onlyOwn);
        }

        private record TaskAccess(Guid? EmployeeId, bool OnlyOwn);

        public class WorkTaskDto
        {
            public Guid Id { get; set; }
            public Guid WorkId { get; set; }
            public string Title { get; set; }
            public string Description { get; set; }
            public string TaskType { get; set; }
            public Guid? AssignedEmployeeId { get; set; }
            public string AssignedEmployeeName { get; set; }
            public string Status { get; set; }
            public string Priority { get; set; }
            public DateTime? DueOn { get; set; }
            public DateTime? CompletedOn { get; set; }
            public string Comment { get; set; }
            public Guid? CreatedByEmployeeId { get; set; }
            public string CreatedByEmployeeName { get; set; }
            public DateTime CreatedOn { get; set; }
            public DateTime ChangedOn { get; set; }
        }

        public class PutWorkTaskDto
        {
            public string Title { get; set; }
            public string Description { get; set; }
            public string TaskType { get; set; }
            public Guid? AssignedEmployeeId { get; set; }
            public string Status { get; set; }
            public string Priority { get; set; }
            public DateTime? DueOn { get; set; }
            public DateTime? CompletedOn { get; set; }
            public string Comment { get; set; }
        }
    }

    [TenantRateLimit]
    [Authorize(Policy = "ServerSidePolicy")]
    [ApiController]
    [Route("api/work/task-alerts")]
    public class WorkTaskAlertsController : ControllerBase
    {
        private readonly NHibernateSession session;

        public WorkTaskAlertsController(NHibernateSession session)
        {
            this.session = session;
        }

        [HttpGet]
        public ActionResult<IEnumerable<DashboardWorkItemDto>> Get()
        {
            var employeeId = this.EmployeeId();
            var employee = employeeId is Guid id ? session.Get<Employee>(id) : null;
            var roleText = string.Join(" ", employee?.Proffession, employee?.Description).ToLowerInvariant();
            var onlyOwn = roleText.Contains("mechanik") || roleText.Contains("lakiernik");

            var alerts = session.Connection.Query<DashboardWorkItemDto>(@"
                WITH task_data AS (
                    SELECT
                        w.id,
                        w.number::text AS worknr,
                        COALESCE(NULLIF(TRIM(w.damagestatus), ''), 'new') AS damagestatus,
                        CONCAT_WS(' ', p.firstname, p.lastname, l.name) AS clientname,
                        v.regnr,
                        t.assignedemployeeid,
                        t.status,
                        t.priority,
                        t.dueon
                    FROM domain.work w
                    INNER JOIN domain.work_task t ON t.workid = w.id
                    LEFT JOIN domain.legalclient l ON l.id = w.clientid
                    LEFT JOIN domain.privateclient p ON p.id = w.clientid
                    LEFT JOIN domain.vehicle v ON v.id = w.vehicleid
                    WHERE t.status NOT IN ('completed', 'cancelled')
                      AND (@OnlyOwn = FALSE OR t.assignedemployeeid = @EmployeeId)
                )
                SELECT id, worknr, clientname, regnr, damagestatus, 'my_tasks' AS kind, dueon AS scheduledon
                FROM task_data WHERE assignedemployeeid = @EmployeeId
                UNION ALL
                SELECT id, worknr, clientname, regnr, damagestatus, 'task_overdue', dueon
                FROM task_data WHERE dueon IS NOT NULL AND dueon < CURRENT_TIMESTAMP
                UNION ALL
                SELECT id, worknr, clientname, regnr, damagestatus, 'task_urgent', dueon
                FROM task_data WHERE priority = 'urgent'
                UNION ALL
                SELECT id, worknr, clientname, regnr, damagestatus, 'task_unassigned', dueon
                FROM task_data WHERE assignedemployeeid IS NULL
                ORDER BY scheduledon NULLS LAST, worknr DESC
                LIMIT 100", new { EmployeeId = employeeId, OnlyOwn = onlyOwn }).ToArray();

            return Ok(alerts);
        }
    }
}
