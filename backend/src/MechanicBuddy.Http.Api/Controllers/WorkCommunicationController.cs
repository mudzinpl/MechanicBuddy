using System;
using System.Collections.Generic;
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
    [ApiController]
    [Route("api/work/{workId:guid}/communication")]
    public class WorkCommunicationController : ControllerBase
    {
        private static readonly HashSet<string> Categories = new(StringComparer.OrdinalIgnoreCase)
        {
            "phone_to_client",
            "phone_from_client",
            "phone_to_insurer",
            "phone_from_insurer",
            "email",
            "sms",
            "meeting",
            "internal_note",
            "other"
        };

        private static readonly HashSet<string> Statuses = new(StringComparer.OrdinalIgnoreCase)
        {
            "information",
            "waiting_for_response",
            "answered",
            "closed"
        };

        private readonly ISession session;

        public WorkCommunicationController(ISession session)
        {
            this.session = session;
        }

        [HttpGet]
        public ActionResult<IEnumerable<WorkCommunicationEntryDto>> GetAll(Guid workId)
        {
            if (!WorkExists(workId)) return NotFound();

            var entries = session.Connection.Query<WorkCommunicationEntryDto>(@"
                SELECT
                    c.id,
                    c.workid,
                    c.category,
                    c.subject,
                    c.note,
                    c.status,
                    c.documentid,
                    d.filename AS documentfilename,
                    c.authorbyemployeeid,
                    c.authorname,
                    c.occurredon,
                    c.createdon,
                    c.changedon,
                    c.integrationchannel,
                    c.externalmessageid,
                    c.externalthreadid
                FROM domain.work_communication_entry c
                LEFT JOIN domain.workdocument d ON d.id = c.documentid
                WHERE c.workid = @WorkId
                ORDER BY c.occurredon DESC, c.createdon DESC", new { WorkId = workId });

            return Ok(entries);
        }

        [HttpPost]
        public IActionResult Create(Guid workId, [FromBody] CreateWorkCommunicationEntryDto model)
        {
            if (!WorkExists(workId)) return NotFound();
            if (!Categories.Contains(model?.Category ?? string.Empty))
                return BadRequest("Wybierz prawidłową kategorię komunikacji.");
            if (!Statuses.Contains(model?.Status ?? string.Empty))
                return BadRequest("Wybierz prawidłowy status komunikacji.");
            if (string.IsNullOrWhiteSpace(model?.Note))
                return BadRequest("Treść notatki jest wymagana.");

            if (model.DocumentId.HasValue && !DocumentBelongsToWork(workId, model.DocumentId.Value))
                return BadRequest("Wybrany dokument nie należy do tego zlecenia.");

            var employee = this.EmployeeId() is Guid employeeId
                ? session.Get<Employee>(employeeId)
                : null;
            var authorName = employee?.Name?.Trim();
            if (string.IsNullOrWhiteSpace(authorName)) authorName = this.UserName() ?? "Użytkownik";

            var id = Guid.NewGuid();
            var occurredOn = model.OccurredOn ?? DateTime.UtcNow;

            session.Connection.Execute(@"
                INSERT INTO domain.work_communication_entry (
                    id, workid, category, subject, note, status, documentid,
                    authorbyemployeeid, authorname, occurredon, createdon, changedon,
                    integrationchannel, externalmessageid, externalthreadid)
                VALUES (
                    @Id, @WorkId, @Category, @Subject, @Note, @Status, @DocumentId,
                    @AuthorByEmployeeId, @AuthorName, @OccurredOn, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
                    @IntegrationChannel, @ExternalMessageId, @ExternalThreadId)", new
            {
                Id = id,
                WorkId = workId,
                Category = model.Category,
                Subject = EmptyToNull(model.Subject),
                Note = model.Note.Trim(),
                Status = model.Status,
                DocumentId = model.DocumentId,
                AuthorByEmployeeId = employee?.Id,
                AuthorName = authorName,
                OccurredOn = occurredOn,
                IntegrationChannel = EmptyToNull(model.IntegrationChannel),
                ExternalMessageId = EmptyToNull(model.ExternalMessageId),
                ExternalThreadId = EmptyToNull(model.ExternalThreadId)
            });

            return Ok(new { id });
        }

        [HttpDelete("{entryId:guid}")]
        public IActionResult Delete(Guid workId, Guid entryId)
        {
            var affected = session.Connection.Execute(@"
                DELETE FROM domain.work_communication_entry
                WHERE id = @EntryId AND workid = @WorkId", new { EntryId = entryId, WorkId = workId });

            return affected == 0 ? NotFound() : NoContent();
        }

        private bool WorkExists(Guid workId)
        {
            return session.Connection.ExecuteScalar<bool>(
                "SELECT EXISTS (SELECT 1 FROM domain.work WHERE id = @WorkId)",
                new { WorkId = workId });
        }

        private bool DocumentBelongsToWork(Guid workId, Guid documentId)
        {
            return session.Connection.ExecuteScalar<bool>(
                "SELECT EXISTS (SELECT 1 FROM domain.workdocument WHERE id = @DocumentId AND workid = @WorkId)",
                new { WorkId = workId, DocumentId = documentId });
        }

        private static string EmptyToNull(string value)
        {
            return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
        }
    }

    public class CreateWorkCommunicationEntryDto
    {
        public string Category { get; set; }
        public string Subject { get; set; }
        public string Note { get; set; }
        public string Status { get; set; } = "information";
        public Guid? DocumentId { get; set; }
        public DateTime? OccurredOn { get; set; }
        public string IntegrationChannel { get; set; }
        public string ExternalMessageId { get; set; }
        public string ExternalThreadId { get; set; }
    }

    public class WorkCommunicationEntryDto
    {
        public Guid Id { get; set; }
        public Guid WorkId { get; set; }
        public string Category { get; set; }
        public string Subject { get; set; }
        public string Note { get; set; }
        public string Status { get; set; }
        public Guid? DocumentId { get; set; }
        public string DocumentFileName { get; set; }
        public Guid? AuthorByEmployeeId { get; set; }
        public string AuthorName { get; set; }
        public DateTime OccurredOn { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime ChangedOn { get; set; }
        public string IntegrationChannel { get; set; }
        public string ExternalMessageId { get; set; }
        public string ExternalThreadId { get; set; }
    }
}
