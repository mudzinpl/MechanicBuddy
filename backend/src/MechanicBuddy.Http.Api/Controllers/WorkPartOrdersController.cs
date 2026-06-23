using Dapper;
using MechanicBuddy.Core.Application.Extensions;
using MechanicBuddy.Core.Application.RateLimiting;
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
    [Route("api/work/{workId:guid}/part-orders")]
    public class WorkPartOrdersController : ControllerBase
    {
        private readonly NHibernateSession session;

        public WorkPartOrdersController(NHibernateSession session)
        {
            this.session = session;
        }

        [HttpGet]
        public ActionResult<IEnumerable<WorkPartOrderDto>> GetAll(Guid workId)
        {
            if (!WorkExists(workId)) return NotFound();

            var items = session.Connection.Query<WorkPartOrderDto>(@"
                SELECT
                    id,
                    workid,
                    partname,
                    oemnumber,
                    supplier,
                    quantity,
                    netprice,
                    vatamount,
                    grossprice,
                    status,
                    orderedon,
                    planneddeliveryon,
                    deliveredon,
                    ordernumber,
                    notes,
                    externalsupplierid,
                    externalorderid,
                    sourcesystem,
                    createdon,
                    changedon
                FROM domain.work_part_order
                WHERE workid = @WorkId
                ORDER BY changedon DESC, createdon DESC", new { WorkId = workId }).ToArray();

            return Ok(items);
        }

        [HttpPost]
        public IActionResult Post(Guid workId, [FromBody] PutWorkPartOrderDto model)
        {
            if (!WorkExists(workId)) return NotFound();
            if (string.IsNullOrWhiteSpace(model.PartName)) return BadRequest("Podaj nazwę części.");

            var id = Guid.NewGuid();
            session.Connection.Execute(@"
                INSERT INTO domain.work_part_order (
                    id, workid, partname, oemnumber, supplier, quantity, netprice, vatamount, grossprice,
                    status, orderedon, planneddeliveryon, deliveredon, ordernumber, notes,
                    externalsupplierid, externalorderid, sourcesystem, createdon, changedon)
                VALUES (
                    @Id, @WorkId, @PartName, @OemNumber, @Supplier, COALESCE(@Quantity, 1), @NetPrice, @VatAmount, @GrossPrice,
                    COALESCE(NULLIF(TRIM(@Status), ''), 'to_order'), @OrderedOn, @PlannedDeliveryOn, @DeliveredOn, @OrderNumber, @Notes,
                    @ExternalSupplierId, @ExternalOrderId, COALESCE(NULLIF(TRIM(@SourceSystem), ''), 'manual'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
                new
                {
                    Id = id,
                    WorkId = workId,
                    model.PartName,
                    model.OemNumber,
                    model.Supplier,
                    model.Quantity,
                    model.NetPrice,
                    model.VatAmount,
                    model.GrossPrice,
                    model.Status,
                    model.OrderedOn,
                    model.PlannedDeliveryOn,
                    model.DeliveredOn,
                    model.OrderNumber,
                    model.Notes,
                    model.ExternalSupplierId,
                    model.ExternalOrderId,
                    model.SourceSystem
                });

            TouchWork(workId);
            return Ok(id);
        }

        [HttpPut("{partOrderId:guid}")]
        public IActionResult Put(Guid workId, Guid partOrderId, [FromBody] PutWorkPartOrderDto model)
        {
            if (string.IsNullOrWhiteSpace(model.PartName)) return BadRequest("Podaj nazwę części.");

            var affected = session.Connection.Execute(@"
                UPDATE domain.work_part_order
                SET
                    partname = @PartName,
                    oemnumber = @OemNumber,
                    supplier = @Supplier,
                    quantity = COALESCE(@Quantity, 1),
                    netprice = @NetPrice,
                    vatamount = @VatAmount,
                    grossprice = @GrossPrice,
                    status = COALESCE(NULLIF(TRIM(@Status), ''), 'to_order'),
                    orderedon = @OrderedOn,
                    planneddeliveryon = @PlannedDeliveryOn,
                    deliveredon = @DeliveredOn,
                    ordernumber = @OrderNumber,
                    notes = @Notes,
                    externalsupplierid = @ExternalSupplierId,
                    externalorderid = @ExternalOrderId,
                    sourcesystem = COALESCE(NULLIF(TRIM(@SourceSystem), ''), 'manual'),
                    changedon = CURRENT_TIMESTAMP
                WHERE id = @PartOrderId AND workid = @WorkId",
                new
                {
                    WorkId = workId,
                    PartOrderId = partOrderId,
                    model.PartName,
                    model.OemNumber,
                    model.Supplier,
                    model.Quantity,
                    model.NetPrice,
                    model.VatAmount,
                    model.GrossPrice,
                    model.Status,
                    model.OrderedOn,
                    model.PlannedDeliveryOn,
                    model.DeliveredOn,
                    model.OrderNumber,
                    model.Notes,
                    model.ExternalSupplierId,
                    model.ExternalOrderId,
                    model.SourceSystem
                });

            if (affected == 0) return NotFound();
            TouchWork(workId);
            return Ok();
        }

        [HttpDelete("{partOrderId:guid}")]
        public IActionResult Delete(Guid workId, Guid partOrderId)
        {
            var affected = session.Connection.Execute(@"
                DELETE FROM domain.work_part_order
                WHERE id = @PartOrderId AND workid = @WorkId",
                new { WorkId = workId, PartOrderId = partOrderId });

            if (affected == 0) return NotFound();
            TouchWork(workId);
            return NoContent();
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

        public class WorkPartOrderDto
        {
            public Guid Id { get; set; }
            public Guid WorkId { get; set; }
            public string PartName { get; set; }
            public string OemNumber { get; set; }
            public string Supplier { get; set; }
            public decimal Quantity { get; set; }
            public decimal? NetPrice { get; set; }
            public decimal? VatAmount { get; set; }
            public decimal? GrossPrice { get; set; }
            public string Status { get; set; }
            public DateTime? OrderedOn { get; set; }
            public DateTime? PlannedDeliveryOn { get; set; }
            public DateTime? DeliveredOn { get; set; }
            public string OrderNumber { get; set; }
            public string Notes { get; set; }
            public string ExternalSupplierId { get; set; }
            public string ExternalOrderId { get; set; }
            public string SourceSystem { get; set; }
            public DateTime CreatedOn { get; set; }
            public DateTime ChangedOn { get; set; }
        }

        public class PutWorkPartOrderDto
        {
            public string PartName { get; set; }
            public string OemNumber { get; set; }
            public string Supplier { get; set; }
            public decimal? Quantity { get; set; }
            public decimal? NetPrice { get; set; }
            public decimal? VatAmount { get; set; }
            public decimal? GrossPrice { get; set; }
            public string Status { get; set; }
            public DateTime? OrderedOn { get; set; }
            public DateTime? PlannedDeliveryOn { get; set; }
            public DateTime? DeliveredOn { get; set; }
            public string OrderNumber { get; set; }
            public string Notes { get; set; }
            public string ExternalSupplierId { get; set; }
            public string ExternalOrderId { get; set; }
            public string SourceSystem { get; set; }
        }
    }

    [TenantRateLimit]
    [Authorize(Policy = "ServerSidePolicy")]
    [ApiController]
    [Route("api/work/part-order-alerts")]
    public class WorkPartOrderAlertsController : ControllerBase
    {
        private readonly NHibernateSession session;

        public WorkPartOrderAlertsController(NHibernateSession session)
        {
            this.session = session;
        }

        [HttpGet]
        public ActionResult<IEnumerable<DashboardWorkItemDto>> Get()
        {
            var alerts = session.Connection.Query<DashboardWorkItemDto>(@"
                WITH part_data AS (
                    SELECT
                        w.id,
                        w.number::text AS worknr,
                        COALESCE(NULLIF(TRIM(w.damagestatus), ''), 'new') AS damagestatus,
                        CONCAT_WS(' ', p.firstname, p.lastname, l.name) AS clientname,
                        v.regnr,
                        po.status,
                        po.orderedon,
                        po.planneddeliveryon,
                        po.deliveredon
                    FROM domain.work w
                    INNER JOIN domain.work_part_order po ON po.workid = w.id
                    LEFT JOIN domain.legalclient l ON l.id = w.clientid
                    LEFT JOIN domain.privateclient p ON p.id = w.clientid
                    LEFT JOIN domain.vehicle v ON v.id = w.vehicleid
                    WHERE w.damagestatus NOT IN ('released', 'settled', 'rejected')
                )
                SELECT id, worknr, clientname, regnr, damagestatus, 'parts_to_order' AS kind, NULL::timestamptz AS scheduledon
                FROM part_data WHERE status = 'to_order'
                UNION ALL
                SELECT id, worknr, clientname, regnr, damagestatus, 'parts_ordered_without_delivery_date', orderedon
                FROM part_data WHERE status IN ('ordered', 'in_delivery') AND planneddeliveryon IS NULL
                UNION ALL
                SELECT id, worknr, clientname, regnr, damagestatus, 'parts_delivery_overdue', planneddeliveryon
                FROM part_data WHERE status IN ('ordered', 'in_delivery') AND planneddeliveryon IS NOT NULL AND planneddeliveryon < CURRENT_TIMESTAMP AND deliveredon IS NULL
                UNION ALL
                SELECT id, worknr, clientname, regnr, damagestatus, 'repair_waiting_for_parts', NULL::timestamptz
                FROM part_data WHERE damagestatus = 'parts_pending' OR status IN ('to_order', 'ordered', 'in_delivery')
                ORDER BY worknr DESC
                LIMIT 100").ToArray();

            return Ok(alerts);
        }
    }
}
