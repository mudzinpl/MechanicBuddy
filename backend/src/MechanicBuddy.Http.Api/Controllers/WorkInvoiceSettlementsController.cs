using Dapper;
using MechanicBuddy.Core.Application.Extensions;
using MechanicBuddy.Core.Application.RateLimiting;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NHibernateSession = NHibernate.ISession;
using System;

namespace MechanicBuddy.Http.Api.Controllers
{
    [TenantRateLimit]
    [Authorize(Policy = "ServerSidePolicy")]
    [ApiController]
    [Route("api/work/{workId:guid}/invoice-settlement")]
    public class WorkInvoiceSettlementsController : ControllerBase
    {
        private readonly NHibernateSession session;

        public WorkInvoiceSettlementsController(NHibernateSession session)
        {
            this.session = session;
        }

        [HttpGet]
        public ActionResult<WorkInvoiceSettlementDto> Get(Guid workId)
        {
            var settlement = session.Connection.QuerySingleOrDefault<WorkInvoiceSettlementDto>(@"
                SELECT
                    w.id AS workid,
                    i.number::text AS invoicenumber,
                    ip.issuedon AS invoiceissuedon,
                    w.invoicenetamount,
                    w.invoicevatamount,
                    w.invoicegrossamount,
                    w.insurerpaidamount,
                    w.clientsurchargeamount,
                    w.underpaymentamount,
                    w.paymentdueon,
                    COALESCE(w.invoicepaymenton, w.paymentreceivedon) AS invoicepaymenton,
                    COALESCE(NULLIF(TRIM(w.invoicepaymentstatus), ''), CASE WHEN w.invoiceid IS NULL THEN 'not_issued' WHEN i.ispaid THEN 'paid' ELSE 'issued' END) AS invoicepaymentstatus,
                    w.settlementnotes,
                    w.externalinvoiceid,
                    COALESCE(NULLIF(TRIM(w.externalinvoicenumber), ''), i.number::text) AS externalinvoicenumber,
                    COALESCE(NULLIF(TRIM(w.invoicesourcesystem), ''), 'manual') AS invoicesourcesystem
                FROM domain.work w
                LEFT JOIN domain.invoice i ON i.id = w.invoiceid
                LEFT JOIN domain.pricing ip ON ip.id = i.id
                WHERE w.id = @WorkId", new { WorkId = workId });

            if (settlement == null) return NotFound();

            return Ok(settlement);
        }

        [HttpPut]
        public IActionResult Put(Guid workId, [FromBody] PutWorkInvoiceSettlementDto model)
        {
            var affected = session.Connection.Execute(@"
                UPDATE domain.work
                SET
                    invoicenetamount = @InvoiceNetAmount,
                    invoicevatamount = @InvoiceVatAmount,
                    invoicegrossamount = @InvoiceGrossAmount,
                    insurerpaidamount = @InsurerPaidAmount,
                    clientsurchargeamount = @ClientSurchargeAmount,
                    underpaymentamount = @UnderpaymentAmount,
                    paymentdueon = @PaymentDueOn,
                    invoicepaymenton = @InvoicePaymentOn,
                    invoicepaymentstatus = COALESCE(NULLIF(TRIM(@InvoicePaymentStatus), ''), 'not_issued'),
                    settlementnotes = @SettlementNotes,
                    externalinvoiceid = @ExternalInvoiceId,
                    externalinvoicenumber = @ExternalInvoiceNumber,
                    invoicesourcesystem = COALESCE(NULLIF(TRIM(@InvoiceSourceSystem), ''), 'manual'),
                    changedon = CURRENT_TIMESTAMP
                WHERE id = @WorkId",
                new
                {
                    WorkId = workId,
                    model.InvoiceNetAmount,
                    model.InvoiceVatAmount,
                    model.InvoiceGrossAmount,
                    model.InsurerPaidAmount,
                    model.ClientSurchargeAmount,
                    model.UnderpaymentAmount,
                    model.PaymentDueOn,
                    model.InvoicePaymentOn,
                    model.InvoicePaymentStatus,
                    model.SettlementNotes,
                    model.ExternalInvoiceId,
                    model.ExternalInvoiceNumber,
                    model.InvoiceSourceSystem
                });

            return affected == 0 ? NotFound() : Ok();
        }

        public class WorkInvoiceSettlementDto
        {
            public Guid WorkId { get; set; }
            public string InvoiceNumber { get; set; }
            public DateTime? InvoiceIssuedOn { get; set; }
            public decimal? InvoiceNetAmount { get; set; }
            public decimal? InvoiceVatAmount { get; set; }
            public decimal? InvoiceGrossAmount { get; set; }
            public decimal? InsurerPaidAmount { get; set; }
            public decimal? ClientSurchargeAmount { get; set; }
            public decimal? UnderpaymentAmount { get; set; }
            public DateTime? PaymentDueOn { get; set; }
            public DateTime? InvoicePaymentOn { get; set; }
            public string InvoicePaymentStatus { get; set; }
            public string SettlementNotes { get; set; }
            public string ExternalInvoiceId { get; set; }
            public string ExternalInvoiceNumber { get; set; }
            public string InvoiceSourceSystem { get; set; }
        }

        public class PutWorkInvoiceSettlementDto
        {
            public decimal? InvoiceNetAmount { get; set; }
            public decimal? InvoiceVatAmount { get; set; }
            public decimal? InvoiceGrossAmount { get; set; }
            public decimal? InsurerPaidAmount { get; set; }
            public decimal? ClientSurchargeAmount { get; set; }
            public decimal? UnderpaymentAmount { get; set; }
            public DateTime? PaymentDueOn { get; set; }
            public DateTime? InvoicePaymentOn { get; set; }
            public string InvoicePaymentStatus { get; set; }
            public string SettlementNotes { get; set; }
            public string ExternalInvoiceId { get; set; }
            public string ExternalInvoiceNumber { get; set; }
            public string InvoiceSourceSystem { get; set; }
        }
    }
}
