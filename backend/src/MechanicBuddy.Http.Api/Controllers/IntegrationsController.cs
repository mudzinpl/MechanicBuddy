using System;
using System.Collections.Generic;
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
    [Route("api/[controller]")]
    [ApiController]
    public class IntegrationsController : ControllerBase
    {
        private const string SecretMask = "********";
        private readonly ISession session;

        public IntegrationsController(ISession session)
        {
            this.session = session;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var integrations = session.Connection.Query<IntegrationConfigurationDto>(@"
                SELECT
                    id,
                    integrationtype,
                    displayname,
                    description,
                    baseurl,
                    secretplaceholder,
                    loginemail,
                    status,
                    lastsyncat,
                    enabled,
                    notes,
                    createdon,
                    changedon
                FROM domain.integration_configuration
                ORDER BY CASE integrationtype
                    WHEN 'fakturownia' THEN 1
                    WHEN 'email' THEN 2
                    WHEN 'audanet_audatex' THEN 3
                    WHEN 'parts_suppliers' THEN 4
                    WHEN 'bank_payments' THEN 5
                    ELSE 6
                END").ToList();

            return Ok(integrations.Select(MaskSecret));
        }

        [HttpGet("{integrationType}")]
        public IActionResult Get(string integrationType)
        {
            var integration = session.Connection.QueryFirstOrDefault<IntegrationConfigurationDto>(@"
                SELECT
                    id,
                    integrationtype,
                    displayname,
                    description,
                    baseurl,
                    secretplaceholder,
                    loginemail,
                    status,
                    lastsyncat,
                    enabled,
                    notes,
                    createdon,
                    changedon
                FROM domain.integration_configuration
                WHERE integrationtype = @integrationType", new { integrationType });

            if (integration == null)
            {
                return NotFound();
            }

            return Ok(MaskSecret(integration));
        }

        [HttpPut("{integrationType}")]
        public IActionResult Save(string integrationType, [FromBody] SaveIntegrationConfigurationDto model)
        {
            if (!KnownIntegrationTypes.Contains(integrationType))
            {
                return BadRequest("Nieznany typ integracji");
            }

            var existing = session.Connection.QueryFirstOrDefault<IntegrationConfigurationDto>(@"
                SELECT id, secretplaceholder
                FROM domain.integration_configuration
                WHERE integrationtype = @integrationType", new { integrationType });

            var now = DateTime.UtcNow;
            var hasSecretInput = !string.IsNullOrWhiteSpace(model.SecretPlaceholder) && model.SecretPlaceholder != SecretMask;
            var secretPlaceholder = hasSecretInput ? SecretMask : existing?.SecretPlaceholder;
            var status = NormalizeStatus(model.Status, model.Enabled, model.BaseUrl, model.LoginEmail, secretPlaceholder);
            var id = existing?.Id ?? Guid.NewGuid();

            // Produkcyjne sekrety powinny trafić do bezpiecznego magazynu lub zostać zaszyfrowane poza repozytorium.
            session.Connection.Execute(@"
                INSERT INTO domain.integration_configuration (
                    id, integrationtype, displayname, description, baseurl, secretplaceholder,
                    loginemail, status, lastsyncat, enabled, notes, createdon, changedon
                )
                VALUES (
                    @id, @integrationType, @displayName, @description, @baseUrl, @secretPlaceholder,
                    @loginEmail, @status, NULL, @enabled, @notes, @now, @now
                )
                ON CONFLICT (integrationtype) DO UPDATE SET
                    displayname = EXCLUDED.displayname,
                    description = EXCLUDED.description,
                    baseurl = EXCLUDED.baseurl,
                    secretplaceholder = EXCLUDED.secretplaceholder,
                    loginemail = EXCLUDED.loginemail,
                    status = EXCLUDED.status,
                    enabled = EXCLUDED.enabled,
                    notes = EXCLUDED.notes,
                    changedon = EXCLUDED.changedon", new
            {
                id,
                integrationType,
                displayName = string.IsNullOrWhiteSpace(model.DisplayName) ? GetDefaultDisplayName(integrationType) : model.DisplayName.Trim(),
                description = string.IsNullOrWhiteSpace(model.Description) ? GetDefaultDescription(integrationType) : model.Description.Trim(),
                baseUrl = EmptyToNull(model.BaseUrl),
                secretPlaceholder,
                loginEmail = EmptyToNull(model.LoginEmail),
                status,
                enabled = model.Enabled,
                notes = EmptyToNull(model.Notes),
                now
            });

            return Ok();
        }

        [HttpPost("{integrationType}/test")]
        public IActionResult Test(string integrationType)
        {
            if (!KnownIntegrationTypes.Contains(integrationType))
            {
                return BadRequest("Nieznany typ integracji");
            }

            return Ok(new IntegrationTestResultDto
            {
                Success = false,
                Message = "Test połączenia nie jest jeszcze zaimplementowany"
            });
        }

        private static readonly HashSet<string> KnownIntegrationTypes = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "fakturownia",
            "email",
            "audanet_audatex",
            "parts_suppliers",
            "bank_payments",
            "other"
        };

        private static IntegrationConfigurationDto MaskSecret(IntegrationConfigurationDto integration)
        {
            if (!string.IsNullOrWhiteSpace(integration.SecretPlaceholder))
            {
                integration.SecretPlaceholder = SecretMask;
            }

            return integration;
        }

        private static string NormalizeStatus(string status, bool enabled, string baseUrl, string loginEmail, string secretPlaceholder)
        {
            var allowedStatuses = new[] { "not_configured", "configured", "active", "error" };
            if (!string.IsNullOrWhiteSpace(status) && allowedStatuses.Contains(status))
            {
                return status;
            }

            var hasConfiguration = !string.IsNullOrWhiteSpace(baseUrl) || !string.IsNullOrWhiteSpace(loginEmail) || !string.IsNullOrWhiteSpace(secretPlaceholder);
            if (!hasConfiguration)
            {
                return "not_configured";
            }

            return enabled ? "active" : "configured";
        }

        private static string EmptyToNull(string value)
        {
            return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
        }

        private static string GetDefaultDisplayName(string integrationType)
        {
            return integrationType switch
            {
                "fakturownia" => "Fakturownia",
                "email" => "Poczta e-mail",
                "audanet_audatex" => "Audanet / Audatex",
                "parts_suppliers" => "Dostawcy części",
                "bank_payments" => "Bank / płatności",
                _ => "Inne"
            };
        }

        private static string GetDefaultDescription(string integrationType)
        {
            return integrationType switch
            {
                "fakturownia" => "Przyszła integracja do wystawiania i synchronizacji faktur.",
                "email" => "Przyszła integracja z Outlook lub Gmail do obsługi korespondencji.",
                "audanet_audatex" => "Przyszła integracja z systemami kosztorysowania szkód.",
                "parts_suppliers" => "Przyszła integracja z dostawcami części, np. Inter Cars.",
                "bank_payments" => "Przyszła integracja z bankiem i potwierdzeniami wpływów.",
                _ => "Miejsce na pozostałe integracje z systemami zewnętrznymi."
            };
        }
    }

    public class IntegrationConfigurationDto
    {
        public Guid Id { get; set; }
        public string IntegrationType { get; set; }
        public string DisplayName { get; set; }
        public string Description { get; set; }
        public string BaseUrl { get; set; }
        public string SecretPlaceholder { get; set; }
        public string LoginEmail { get; set; }
        public string Status { get; set; }
        public DateTime? LastSyncAt { get; set; }
        public bool Enabled { get; set; }
        public string Notes { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime ChangedOn { get; set; }
    }

    public class SaveIntegrationConfigurationDto
    {
        public string DisplayName { get; set; }
        public string Description { get; set; }
        public string BaseUrl { get; set; }
        public string SecretPlaceholder { get; set; }
        public string LoginEmail { get; set; }
        public string Status { get; set; }
        public bool Enabled { get; set; }
        public string Notes { get; set; }
    }

    public class IntegrationTestResultDto
    {
        public bool Success { get; set; }
        public string Message { get; set; }
    }
}
