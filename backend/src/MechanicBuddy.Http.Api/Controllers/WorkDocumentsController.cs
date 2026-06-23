using Dapper;
using MechanicBuddy.Core.Application.Extensions;
using MechanicBuddy.Core.Application.RateLimiting;
using MechanicBuddy.Core.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NHibernateSession = NHibernate.ISession;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Mime;
using System.Threading.Tasks;

namespace MechanicBuddy.Http.Api.Controllers
{
    [TenantRateLimit]
    [Authorize(Policy = "ServerSidePolicy")]
    [ApiController]
    [Route("api/work/{workId:guid}/documents")]
    public class WorkDocumentsController : ControllerBase
    {
        private const long MaxFileSize = 25 * 1024 * 1024;
        private const int MaxFilesPerUpload = 20;

        private static readonly HashSet<string> Categories = new(StringComparer.OrdinalIgnoreCase)
        {
            "vehicle_photos",
            "audatex_estimates",
            "insurer_decisions",
            "claim_assignments",
            "authorizations",
            "invoices",
            "notes",
            "client_documents",
            "other"
        };

        private static readonly Dictionary<string, string> ContentTypes = new(StringComparer.OrdinalIgnoreCase)
        {
            [".pdf"] = "application/pdf",
            [".jpg"] = "image/jpeg",
            [".jpeg"] = "image/jpeg",
            [".png"] = "image/png",
            [".webp"] = "image/webp",
            [".doc"] = "application/msword",
            [".docx"] = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            [".xls"] = "application/vnd.ms-excel",
            [".xlsx"] = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            [".txt"] = "text/plain"
        };

        private readonly NHibernateSession session;

        public WorkDocumentsController(NHibernateSession session)
        {
            this.session = session;
        }

        [HttpGet]
        public ActionResult<IEnumerable<WorkDocumentDto>> GetAll(Guid workId)
        {
            if (!WorkExists(workId)) return NotFound();

            var documents = session.Connection.Query<WorkDocumentDto>(@"
                SELECT
                    id,
                    category,
                    filename,
                    contenttype,
                    filesize,
                    uploadedon,
                    uploadedbyname
                FROM domain.workdocument
                WHERE workid = @WorkId
                ORDER BY uploadedon DESC", new { WorkId = workId });

            return Ok(documents);
        }

        [HttpPost]
        [RequestSizeLimit(MaxFileSize * MaxFilesPerUpload)]
        public async Task<IActionResult> Upload(Guid workId, [FromForm] string category, [FromForm] List<IFormFile> files)
        {
            if (!WorkExists(workId)) return NotFound();
            if (!Categories.Contains(category ?? string.Empty))
                return BadRequest("Wybierz prawidłową kategorię dokumentu.");
            if (files == null || files.Count == 0)
                return BadRequest("Wybierz co najmniej jeden plik.");
            if (files.Count > MaxFilesPerUpload)
                return BadRequest($"Jednorazowo można dodać maksymalnie {MaxFilesPerUpload} plików.");

            var employee = this.EmployeeId() is Guid employeeId
                ? session.Get<Employee>(employeeId)
                : null;
            var uploadedByName = employee?.Name?.Trim();
            if (string.IsNullOrWhiteSpace(uploadedByName)) uploadedByName = this.UserName() ?? "Użytkownik";

            foreach (var file in files)
            {
                if (file.Length <= 0 || file.Length > MaxFileSize)
                    return BadRequest($"Plik {Path.GetFileName(file.FileName)} ma nieprawidłowy rozmiar. Maksymalny rozmiar to 25 MB.");

                var fileName = Path.GetFileName(file.FileName);
                var extension = Path.GetExtension(fileName);
                if (!ContentTypes.ContainsKey(extension))
                    return BadRequest($"Format pliku {fileName} nie jest obsługiwany.");

                await using var signatureStream = file.OpenReadStream();
                var signature = new byte[Math.Min(12, (int)file.Length)];
                await signatureStream.ReadAsync(signature, 0, signature.Length);
                if (!HasValidSignature(extension, signature))
                    return BadRequest($"Zawartość pliku {fileName} nie odpowiada jego formatowi.");
            }

            foreach (var file in files)
            {
                var fileName = Path.GetFileName(file.FileName);
                var extension = Path.GetExtension(fileName);

                if (fileName.Length > 255)
                    fileName = fileName.Substring(fileName.Length - 255);

                await using var stream = new MemoryStream();
                await file.CopyToAsync(stream);

                session.Connection.Execute(@"
                    INSERT INTO domain.workdocument (
                        id, workid, category, filename, contenttype, filesize,
                        content, uploadedon, uploadedbyemployeeid, uploadedbyname)
                    VALUES (
                        @Id, @WorkId, @Category, @FileName, @ContentType, @FileSize,
                        @Content, CURRENT_TIMESTAMP, @UploadedByEmployeeId, @UploadedByName)",
                    new
                    {
                        Id = Guid.NewGuid(),
                        WorkId = workId,
                        Category = category,
                        FileName = fileName,
                        ContentType = ContentTypes[extension],
                        FileSize = file.Length,
                        Content = stream.ToArray(),
                        UploadedByEmployeeId = employee?.Id,
                        UploadedByName = uploadedByName
                    });
            }

            return Ok();
        }

        [HttpGet("{documentId:guid}/content")]
        public IActionResult GetContent(Guid workId, Guid documentId, [FromQuery] bool download = false)
        {
            var document = session.Connection.QuerySingleOrDefault<WorkDocumentContent>(@"
                SELECT filename, contenttype, content
                FROM domain.workdocument
                WHERE id = @DocumentId AND workid = @WorkId",
                new { DocumentId = documentId, WorkId = workId });

            if (document == null) return NotFound();

            if (download)
                return File(document.Content, document.ContentType, document.FileName, enableRangeProcessing: true);

            var safeName = Uri.EscapeDataString(document.FileName);
            Response.Headers.ContentDisposition = $"{DispositionTypeNames.Inline}; filename*=UTF-8''{safeName}";
            return File(document.Content, document.ContentType, enableRangeProcessing: true);
        }

        [HttpDelete("{documentId:guid}")]
        public IActionResult Delete(Guid workId, Guid documentId)
        {
            var affected = session.Connection.Execute(@"
                DELETE FROM domain.workdocument
                WHERE id = @DocumentId AND workid = @WorkId",
                new { DocumentId = documentId, WorkId = workId });

            return affected == 0 ? NotFound() : NoContent();
        }

        private bool WorkExists(Guid workId)
        {
            return session.Connection.ExecuteScalar<bool>(
                "SELECT EXISTS (SELECT 1 FROM domain.work WHERE id = @WorkId)",
                new { WorkId = workId });
        }

        private static bool HasValidSignature(string extension, byte[] bytes)
        {
            if (extension.Equals(".pdf", StringComparison.OrdinalIgnoreCase))
                return bytes.Length >= 5 && bytes[0] == 0x25 && bytes[1] == 0x50 && bytes[2] == 0x44 && bytes[3] == 0x46 && bytes[4] == 0x2D;
            if (extension.Equals(".jpg", StringComparison.OrdinalIgnoreCase) || extension.Equals(".jpeg", StringComparison.OrdinalIgnoreCase))
                return bytes.Length >= 3 && bytes[0] == 0xFF && bytes[1] == 0xD8 && bytes[2] == 0xFF;
            if (extension.Equals(".png", StringComparison.OrdinalIgnoreCase))
                return bytes.Length >= 8 && bytes[0] == 0x89 && bytes[1] == 0x50 && bytes[2] == 0x4E && bytes[3] == 0x47;
            if (extension.Equals(".webp", StringComparison.OrdinalIgnoreCase))
                return bytes.Length >= 12 && bytes[0] == 0x52 && bytes[1] == 0x49 && bytes[2] == 0x46 && bytes[3] == 0x46
                    && bytes[8] == 0x57 && bytes[9] == 0x45 && bytes[10] == 0x42 && bytes[11] == 0x50;

            return true;
        }

        public class WorkDocumentDto
        {
            public Guid Id { get; set; }
            public string Category { get; set; }
            public string FileName { get; set; }
            public string ContentType { get; set; }
            public long FileSize { get; set; }
            public DateTime UploadedOn { get; set; }
            public string UploadedByName { get; set; }
        }

        private class WorkDocumentContent
        {
            public string FileName { get; set; }
            public string ContentType { get; set; }
            public byte[] Content { get; set; }
        }
    }
}
