using System;
using System.Collections.Generic;
using System.Linq;
using Dapper;
using MechanicBuddy.Core.Application.Extensions;
using MechanicBuddy.Core.Application.RateLimiting;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Hosting;
using NHibernate;

namespace MechanicBuddy.Http.Api.Controllers
{
    [TenantRateLimit]
    [Authorize(Policy = "ServerSidePolicy")]
    [ApiController]
    [Route("api/demo/appra-data")]
    public class AppraDemoDataController : ControllerBase
    {
        private const string Marker = "APPRA_DEMO_DATA";
        private readonly ISession session;
        private readonly IWebHostEnvironment environment;

        public AppraDemoDataController(ISession session, IWebHostEnvironment environment)
        {
            this.session = session;
            this.environment = environment;
        }

        [HttpGet]
        public ActionResult<AppraDemoDataStatusDto> GetStatus()
        {
            var allowed = IsAllowedEnvironment();
            return Ok(new AppraDemoDataStatusDto
            {
                Allowed = allowed,
                Exists = DemoExists(),
                WorkCount = DemoWorkCount(),
                Message = allowed
                    ? "Dane demonstracyjne APPRA mogą zostać utworzone w tym środowisku."
                    : "Generator danych demonstracyjnych jest dostępny tylko lokalnie, w dev albo dla tenantów demo."
            });
        }

        [HttpPost]
        public ActionResult<AppraDemoDataResultDto> Create([FromBody] AppraDemoDataRequestDto request)
        {
            if (!IsAllowedEnvironment())
            {
                return BadRequest("Generator danych demonstracyjnych APPRA jest dostępny tylko lokalnie, w dev albo dla tenantów demo.");
            }

            var reset = request?.Reset == true;
            if (DemoExists() && !reset)
            {
                return Ok(new AppraDemoDataResultDto
                {
                    Created = false,
                    WorkCount = DemoWorkCount(),
                    Message = "Dane demonstracyjne APPRA już istnieją. Nie utworzono duplikatów."
                });
            }

            if (reset)
            {
                ResetDemoData();
            }

            var employeeIds = EnsureDemoEmployees();
            var clientIds = CreateClients();
            var vehicleIds = CreateVehicles(clientIds, false);
            var replacementVehicleIds = CreateVehicles(clientIds, true);
            var workIds = CreateWorks(clientIds, vehicleIds, employeeIds);
            CreateDocuments(workIds, employeeIds.Admin);
            CreateReplacementRentals(workIds, replacementVehicleIds);
            CreatePartOrders(workIds);
            CreateTasks(workIds, employeeIds);
            CreateChecklist(workIds, employeeIds);
            CreateStatusHistory(workIds, employeeIds);
            CreateCommunication(workIds, employeeIds);
            CreateVehicleReleases(workIds, employeeIds);

            return Ok(new AppraDemoDataResultDto
            {
                Created = true,
                WorkCount = workIds.Count,
                Message = reset
                    ? "Dane demonstracyjne APPRA zostały odtworzone."
                    : "Dane demonstracyjne APPRA zostały utworzone."
            });
        }

        private bool IsAllowedEnvironment()
        {
            var host = Request.Host.Host ?? string.Empty;
            var tenantId = Request.Headers.TryGetValue("X-Tenant-ID", out var tenantHeader)
                ? tenantHeader.ToString()
                : string.Empty;

            return environment.IsDevelopment()
                || host.Contains("localhost", StringComparison.OrdinalIgnoreCase)
                || host.Contains("127.0.0.1", StringComparison.OrdinalIgnoreCase)
                || tenantId.StartsWith("demo", StringComparison.OrdinalIgnoreCase)
                || tenantId.Contains("demo", StringComparison.OrdinalIgnoreCase);
        }

        private bool DemoExists()
        {
            return session.Connection.ExecuteScalar<bool>(
                "SELECT EXISTS (SELECT 1 FROM domain.work WHERE notes LIKE @Marker)",
                new { Marker = $"%{Marker}%" });
        }

        private int DemoWorkCount()
        {
            return session.Connection.ExecuteScalar<int>(
                "SELECT COUNT(*) FROM domain.work WHERE notes LIKE @Marker",
                new { Marker = $"%{Marker}%" });
        }

        private void ResetDemoData()
        {
            session.Connection.Execute("DELETE FROM domain.work WHERE notes LIKE @Marker", new { Marker = $"%{Marker}%" });
            session.Connection.Execute(@"
                DELETE FROM domain.vehicleregistration
                WHERE vehicleid IN (SELECT id FROM domain.vehicle WHERE description LIKE @Marker)", new { Marker = $"%{Marker}%" });
            session.Connection.Execute("DELETE FROM domain.vehicle WHERE description LIKE @Marker", new { Marker = $"%{Marker}%" });
            session.Connection.Execute("DELETE FROM domain.clientemail WHERE clientid IN (SELECT id FROM domain.client WHERE description LIKE @Marker)", new { Marker = $"%{Marker}%" });
            session.Connection.Execute("DELETE FROM domain.legalclient WHERE id IN (SELECT id FROM domain.client WHERE description LIKE @Marker)", new { Marker = $"%{Marker}%" });
            session.Connection.Execute("DELETE FROM domain.privateclient WHERE id IN (SELECT id FROM domain.client WHERE description LIKE @Marker)", new { Marker = $"%{Marker}%" });
            session.Connection.Execute("DELETE FROM domain.client WHERE description LIKE @Marker", new { Marker = $"%{Marker}%" });
            session.Connection.Execute("DELETE FROM domain.employee WHERE description LIKE @Marker", new { Marker = $"%{Marker}%" });
        }

        private DemoEmployees EnsureDemoEmployees()
        {
            var currentEmployeeId = this.EmployeeId();
            var adminId = currentEmployeeId ?? session.Connection.ExecuteScalar<Guid?>("SELECT id FROM domain.employee ORDER BY introducedat LIMIT 1");
            var employees = new[]
            {
                new DemoEmployee("Kamil", "Maj", "Kierownik", "kamil.maj@appra-demo.local"),
                new DemoEmployee("Marta", "Zalewska", "Pracownik biura", "marta.zalewska@appra-demo.local"),
                new DemoEmployee("Piotr", "Baran", "Blacharz", "piotr.baran@appra-demo.local"),
                new DemoEmployee("Tomasz", "Lis", "Lakiernik", "tomasz.lis@appra-demo.local"),
                new DemoEmployee("Ewa", "Krawczyk", "Rzeczoznawca", "ewa.krawczyk@appra-demo.local")
            };

            var ids = new List<Guid>();
            foreach (var employee in employees)
            {
                var existingId = session.Connection.ExecuteScalar<Guid?>("SELECT id FROM domain.employee WHERE email = @Email", new { employee.Email });
                if (existingId.HasValue)
                {
                    ids.Add(existingId.Value);
                    continue;
                }

                var id = Guid.NewGuid();
                session.Connection.Execute(@"
                    INSERT INTO domain.employee(id, firstname, lastname, email, phone, proffession, description, introducedat)
                    VALUES (@Id, @FirstName, @LastName, @Email, @Phone, @Profession, @Description, CURRENT_TIMESTAMP)",
                    new
                    {
                        Id = id,
                        employee.FirstName,
                        employee.LastName,
                        employee.Email,
                        Phone = "+48 500 000 " + (100 + ids.Count),
                        Profession = employee.Profession,
                        Description = Marker
                    });
                ids.Add(id);
            }

            return new DemoEmployees(adminId ?? ids[0], ids[0], ids[1], ids[2], ids[3], ids[4]);
        }

        private List<Guid> CreateClients()
        {
            var clients = new[]
            {
                new DemoClient("Adam", "Nowicki", null, "ul. Modra 12", "Warszawa", "00-821", "+48 501 220 101"),
                new DemoClient("Karolina", "Wójcik", null, "ul. Dobra 4", "Piaseczno", "05-500", "+48 502 310 202"),
                new DemoClient("Michał", "Sadowski", null, "ul. Polna 8", "Pruszków", "05-800", "+48 503 401 303"),
                new DemoClient("Anna", "Kubiak", null, "ul. Leśna 17", "Otwock", "05-400", "+48 504 510 404"),
                new DemoClient("Tomasz", "Król", null, "ul. Wspólna 9", "Warszawa", "00-519", "+48 505 620 505"),
                new DemoClient("Ewelina", "Pawlak", null, "ul. Cicha 22", "Marki", "05-270", "+48 506 730 606"),
                new DemoClient("Paweł", "Malinowski", null, "ul. Krótka 3", "Ząbki", "05-091", "+48 507 840 707"),
                new DemoClient("Joanna", "Witkowska", null, "ul. Słoneczna 14", "Legionowo", "05-120", "+48 508 950 808"),
                new DemoClient(null, null, "APPRA Logistics Sp. z o.o.", "ul. Przemysłowa 44", "Warszawa", "03-228", "+48 22 210 40 10"),
                new DemoClient(null, null, "Flota Mazovia S.A.", "ul. Flotowa 7", "Warszawa", "02-676", "+48 22 310 50 20")
            };

            var ids = new List<Guid>();
            for (var i = 0; i < clients.Length; i++)
            {
                var client = clients[i];
                var id = Guid.NewGuid();
                session.Connection.Execute(@"
                    INSERT INTO domain.client(id, address, country, region, city, postalcode, phone, isasshole, description, introducedat)
                    VALUES (@Id, @Address, 'Polska', 'mazowieckie', @City, @PostalCode, @Phone, false, @Description, CURRENT_TIMESTAMP)",
                    new { Id = id, client.Address, client.City, client.PostalCode, client.Phone, Description = Marker });

                if (client.CompanyName != null)
                {
                    session.Connection.Execute("INSERT INTO domain.legalclient(id, name, regnr) VALUES (@Id, @Name, @RegNr)",
                        new { Id = id, Name = client.CompanyName, RegNr = $"APPRA-DEMO-{i + 1:D3}" });
                }
                else
                {
                    session.Connection.Execute("INSERT INTO domain.privateclient(id, firstname, lastname, personalcode) VALUES (@Id, @FirstName, @LastName, @PersonalCode)",
                        new { Id = id, client.FirstName, client.LastName, PersonalCode = $"DEMO{i + 1:D5}" });
                }

                session.Connection.Execute("INSERT INTO domain.clientemail(clientid, address, isactive) VALUES (@ClientId, @Address, true)",
                    new { ClientId = id, Address = $"appra-demo-{i + 1}@appra-demo.local" });
                ids.Add(id);
            }

            return ids;
        }

        private List<Guid> CreateVehicles(List<Guid> clients, bool replacement)
        {
            var vehicles = replacement
                ? new[]
                {
                    new DemoVehicle("Toyota", "Yaris", "WX 900ZA", "VNKKJ3D3X0A900001", 2021, 39000),
                    new DemoVehicle("Skoda", "Fabia", "WX 901ZA", "TMBEP6NJ8MZ900002", 2020, 58000),
                    new DemoVehicle("Kia", "Rio", "WX 902ZA", "KNADN512BM6900003", 2022, 24500),
                    new DemoVehicle("Hyundai", "i20", "WX 903ZA", "NLHBN51AAMZ900004", 2021, 31500),
                    new DemoVehicle("Opel", "Corsa", "WX 904ZA", "W0V7D9ED5L4900005", 2020, 61000)
                }
                : new[]
                {
                    new DemoVehicle("Toyota", "Corolla", "WA 2047P", "SB1K93BE80E123401", 2019, 68500),
                    new DemoVehicle("Skoda", "Octavia", "WI 8A241", "TMBJJ7NE6L0123402", 2020, 91200),
                    new DemoVehicle("Volkswagen", "Passat", "WX 42K9A", "WVWZZZ3CZLE123403", 2018, 143000),
                    new DemoVehicle("BMW", "Seria 3", "WE 3702M", "WBA8E51020K123404", 2021, 52200),
                    new DemoVehicle("Audi", "A4", "WPR 6H18", "WAUZZZF49MN123405", 2020, 77100),
                    new DemoVehicle("Kia", "Ceed", "WWL 91C2", "U5YH351ABL123406", 2022, 41000),
                    new DemoVehicle("Hyundai", "i30", "WPI 2T77", "TMAH381AALJ123407", 2019, 98300),
                    new DemoVehicle("Ford", "Focus", "WZ 5N620", "WF0PXXGCHPK123408", 2018, 118400),
                    new DemoVehicle("Mercedes", "Vito", "WA 88V20", "W1V4476031P123409", 2021, 75400),
                    new DemoVehicle("Renault", "Master", "WI 04R70", "VF1MA000X67123410", 2020, 132000),
                    new DemoVehicle("Opel", "Astra", "WGM 3P44", "W0VBE8EH4K8123411", 2019, 89900),
                    new DemoVehicle("Peugeot", "308", "WOT 7F12", "VF3LBHNSMMS123412", 2021, 47500),
                    new DemoVehicle("Mazda", "6", "WSC 5A90", "JMZGL6E7606123413", 2018, 126200),
                    new DemoVehicle("Volvo", "XC60", "WPI 9X44", "YV1UZK5V6N1123414", 2022, 33800),
                    new DemoVehicle("Nissan", "Qashqai", "WZ 81N35", "SJNFEAJ11U2123415", 2020, 70500),
                    new DemoVehicle("Toyota", "Corolla", "WE 6L290", "SB1Z93BE90E123416", 2021, 53000),
                    new DemoVehicle("Skoda", "Octavia", "WA 9T440", "TMBJR7NE8M0123417", 2022, 36500),
                    new DemoVehicle("Ford", "Focus", "WPR 4N91", "WF0NXXGCHNK123418", 2019, 97000),
                    new DemoVehicle("Audi", "A4", "WX 2R441", "WAUZZZF41LN123419", 2020, 80400),
                    new DemoVehicle("Hyundai", "i30", "WI 77K33", "TMAH381AAMJ123420", 2021, 61200)
                };

            var ids = new List<Guid>();
            for (var i = 0; i < vehicles.Length; i++)
            {
                var vehicle = vehicles[i];
                var id = Guid.NewGuid();
                session.Connection.Execute(@"
                    INSERT INTO domain.vehicle(id, producer, model, regnr, vin, odo, body, engine, productiondate, description, isreplacementvehicle, introducedat)
                    VALUES (@Id, @Producer, @Model, @RegNr, @Vin, @Odo, @Body, @Engine, @ProductionDate, @Description, @IsReplacementVehicle, CURRENT_TIMESTAMP)",
                    new
                    {
                        Id = id,
                        vehicle.Producer,
                        vehicle.Model,
                        vehicle.RegNr,
                        vehicle.Vin,
                        vehicle.Odo,
                        Body = replacement ? "Hatchback" : vehicle.Model.Contains("Vito") || vehicle.Model.Contains("Master") ? "Dostawczy" : "Osobowy",
                        Engine = replacement ? "benzyna" : "benzyna/diesel",
                        ProductionDate = new DateTime(vehicle.Year, 1, 1),
                        Description = Marker,
                        IsReplacementVehicle = replacement
                    });

                if (!replacement)
                {
                    session.Connection.Execute("INSERT INTO domain.vehicleregistration(vehicleid, ownerid, datetimefrom) VALUES (@VehicleId, @OwnerId, CURRENT_TIMESTAMP)",
                        new { VehicleId = id, OwnerId = clients[i % clients.Count] });
                }

                ids.Add(id);
            }

            return ids;
        }

        private List<Guid> CreateWorks(List<Guid> clients, List<Guid> vehicles, DemoEmployees employees)
        {
            var statuses = new[] { "new", "new", "inspection_pending", "inspection_pending", "estimate_sent", "estimate_sent", "approval_pending", "approval_pending", "parts_pending", "parts_pending", "repair", "repair", "paint_shop", "paint_shop", "quality_control", "quality_control", "ready_for_pickup", "ready_for_pickup", "released", "released" };
            var insurers = new[] { "PZU", "Warta", "ERGO Hestia", "UNIQA", "InterRisk", "Compensa", "Allianz", "Generali" };
            var damageTypes = new[] { "OC", "AC", "Gotówka", "Flota", "Assistance" };
            var startNumber = session.Connection.ExecuteScalar<int?>("SELECT COALESCE(MAX(number), 0) + 1 FROM domain.work") ?? 1;
            var ids = new List<Guid>();

            for (var i = 0; i < statuses.Length; i++)
            {
                var id = Guid.NewGuid();
                var status = statuses[i];
                var startedOn = DateTime.UtcNow.Date.AddDays(-(24 - i));
                var estimatePrepared = i >= 4;
                var estimateSent = i >= 6 ? startedOn.AddDays(2) : (DateTime?)null;
                var decisionOn = i >= 10 && i % 4 != 0 ? startedOn.AddDays(5) : (DateTime?)null;
                var settled = i == 18 || i == 19;
                var partiallySettled = i == 14 || i == 17;
                var clientVatPercent = i % 6 == 0 ? 50 : i % 9 == 0 ? 100 : 0;
                var gross = 4200m + i * 390m;
                var net = Math.Round(gross / 1.23m, 2);
                var vat = gross - net;

                session.Connection.Execute(@"
                    INSERT INTO domain.work(
                        id, number, startedon, starterid, clientid, vehicleid, notes, odo, userstatus, changedon,
                        claimnumber, insurer, damagetype, damagestatus, assignmentofclaimsigned, clientpaysvat,
                        audatexestimatenumber, insurernotes, claimhandlername, claimhandleremail, claimhandlerphone,
                        claimreportedon, estimatesenton, insurerdecisionon, supplementpaidon,
                        plannedintakeon, plannedinspectionon, plannedreleaseon,
                        assignmentofclaimsignedon, powerofattorneysigned, powerofattorneysignedon,
                        clientvatpercent, clientvatamount, underpaymentamount, settlementstatus, paymentdemandon, paymentreceivedon, settlementnotes,
                        estimatesystem, estimateversion, estimatepreparedon, estimatenetamount, estimatevatamount, estimategrossamount,
                        estimatelabormechanicalrbg, estimatelaborpaintrbg, estimatestatus, estimateacceptedon, estimatenotes,
                        invoicenetamount, invoicevatamount, invoicegrossamount, insurerpaidamount, clientsurchargeamount,
                        paymentdueon, invoicepaymenton, invoicepaymentstatus, externalinvoiceid, externalinvoicenumber, invoicesourcesystem)
                    VALUES(
                        @Id, @Number, @StartedOn, @StarterId, @ClientId, @VehicleId, @Notes, @Odo, 0, @ChangedOn,
                        @ClaimNumber, @Insurer, @DamageType, @DamageStatus, @AssignmentSigned, @ClientPaysVat,
                        @EstimateNumber, @InsurerNotes, @HandlerName, @HandlerEmail, @HandlerPhone,
                        @ClaimReportedOn, @EstimateSentOn, @InsurerDecisionOn, @SupplementPaidOn,
                        @PlannedIntakeOn, @PlannedInspectionOn, @PlannedReleaseOn,
                        @AssignmentSignedOn, @PowerSigned, @PowerSignedOn,
                        @ClientVatPercent, @ClientVatAmount, @UnderpaymentAmount, @SettlementStatus, @PaymentDemandOn, @PaymentReceivedOn, @SettlementNotes,
                        @EstimateSystem, @EstimateVersion, @EstimatePreparedOn, @EstimateNetAmount, @EstimateVatAmount, @EstimateGrossAmount,
                        @MechanicalRbg, @PaintRbg, @EstimateStatus, @EstimateAcceptedOn, @EstimateNotes,
                        @InvoiceNetAmount, @InvoiceVatAmount, @InvoiceGrossAmount, @InsurerPaidAmount, @ClientSurchargeAmount,
                        @PaymentDueOn, @InvoicePaymentOn, @InvoicePaymentStatus, @ExternalInvoiceId, @ExternalInvoiceNumber, 'manual')",
                    new
                    {
                        Id = id,
                        Number = startNumber + i,
                        StartedOn = startedOn,
                        StarterId = employees.Admin,
                        ClientId = clients[i % clients.Count],
                        VehicleId = vehicles[i],
                        Notes = $"[{Marker}] Demonstracyjna szkoda APPRA: {DemoStatusLabel(status)}.",
                        Odo = 42000 + i * 4100,
                        ChangedOn = startedOn.AddDays(Math.Min(i, 10)),
                        ClaimNumber = i % 7 != 0 ? $"APPRA/{DateTime.UtcNow:yyyy}/{1000 + i}" : null,
                        Insurer = i % 8 != 1 ? insurers[i % insurers.Length] : null,
                        DamageType = damageTypes[i % damageTypes.Length],
                        DamageStatus = status,
                        AssignmentSigned = i % 5 != 0,
                        ClientPaysVat = clientVatPercent > 0,
                        EstimateNumber = estimatePrepared ? $"AUD-{DateTime.UtcNow:yyyy}-{2000 + i}" : null,
                        InsurerNotes = i % 3 == 0 ? "Ubezpieczyciel wymaga dodatkowej dokumentacji zdjęciowej." : "Standardowa ścieżka likwidacji szkody.",
                        HandlerName = i % 6 == 0 ? null : $"Opiekun szkody {i + 1}",
                        HandlerEmail = i % 6 == 0 ? null : $"opiekun{i + 1}@ubezpieczyciel-demo.local",
                        HandlerPhone = i % 6 == 0 ? null : $"+48 22 100 {i + 1:D3}",
                        ClaimReportedOn = startedOn,
                        EstimateSentOn = estimateSent,
                        InsurerDecisionOn = decisionOn,
                        SupplementPaidOn = settled ? DateTime.UtcNow.AddDays(-2) : (DateTime?)null,
                        PlannedIntakeOn = startedOn.AddDays(1),
                        PlannedInspectionOn = startedOn.AddDays(2),
                        PlannedReleaseOn = status == "ready_for_pickup" ? DateTime.UtcNow.Date.AddDays(i % 2 == 0 ? -1 : 1) : status == "released" ? DateTime.UtcNow.Date.AddDays(-2) : (DateTime?)null,
                        AssignmentSignedOn = i % 5 != 0 ? startedOn.AddDays(1) : (DateTime?)null,
                        PowerSigned = i % 4 != 0,
                        PowerSignedOn = i % 4 != 0 ? startedOn.AddDays(1) : (DateTime?)null,
                        ClientVatPercent = clientVatPercent,
                        ClientVatAmount = clientVatPercent == 0 ? 0 : Math.Round(vat * clientVatPercent / 100m, 2),
                        UnderpaymentAmount = i % 6 == 0 ? 620m + i * 15 : 0,
                        SettlementStatus = settled ? "settled" : partiallySettled ? "partially_settled" : "unsettled",
                        PaymentDemandOn = i % 6 == 0 ? DateTime.UtcNow.AddDays(-9) : (DateTime?)null,
                        PaymentReceivedOn = settled ? DateTime.UtcNow.AddDays(-1) : (DateTime?)null,
                        SettlementNotes = settled ? "Sprawa rozliczona demonstracyjnie." : partiallySettled ? "Częściowa płatność, oczekiwanie na dopłatę." : "Rozliczenie w toku.",
                        EstimateSystem = estimatePrepared ? (i % 2 == 0 ? "audanet" : "audatex") : null,
                        EstimateVersion = estimatePrepared ? $"v{1 + i % 3}" : null,
                        EstimatePreparedOn = estimatePrepared ? startedOn.AddDays(2) : (DateTime?)null,
                        EstimateNetAmount = estimatePrepared ? net : (decimal?)null,
                        EstimateVatAmount = estimatePrepared ? vat : (decimal?)null,
                        EstimateGrossAmount = estimatePrepared ? gross : (decimal?)null,
                        MechanicalRbg = estimatePrepared ? 130m + i * 2 : (decimal?)null,
                        PaintRbg = estimatePrepared ? 150m + i * 2 : (decimal?)null,
                        EstimateStatus = i < 4 ? null : i < 6 ? "draft" : i < 10 ? "sent" : i % 7 == 0 ? "needs_correction" : "accepted",
                        EstimateAcceptedOn = decisionOn,
                        EstimateNotes = estimatePrepared ? "Kosztorys demonstracyjny APPRA." : null,
                        InvoiceNetAmount = i >= 16 ? net : (decimal?)null,
                        InvoiceVatAmount = i >= 16 ? vat : (decimal?)null,
                        InvoiceGrossAmount = i >= 16 ? gross : (decimal?)null,
                        InsurerPaidAmount = settled ? gross : partiallySettled ? gross - 800 : 0,
                        ClientSurchargeAmount = clientVatPercent > 0 ? Math.Round(vat * clientVatPercent / 100m, 2) : 0,
                        PaymentDueOn = i == 17 ? DateTime.UtcNow.AddDays(-5) : i >= 16 ? DateTime.UtcNow.AddDays(7) : (DateTime?)null,
                        InvoicePaymentOn = settled ? DateTime.UtcNow.AddDays(-1) : (DateTime?)null,
                        InvoicePaymentStatus = settled ? "paid" : i == 17 ? "overdue" : i >= 16 ? "issued" : "not_issued",
                        ExternalInvoiceId = i >= 16 ? $"APPRA-DEMO-INV-{i + 1:D3}" : null,
                        ExternalInvoiceNumber = i >= 16 ? $"FV/APPRA/{DateTime.UtcNow:yyyy}/{i + 1:D3}" : null
                    });
                ids.Add(id);
            }

            return ids;
        }

        private void CreateDocuments(List<Guid> workIds, Guid adminId)
        {
            var categories = new[] { "vehicle_photos", "audanet_estimates", "audatex_estimates", "insurer_decisions", "claim_assignments", "authorizations", "invoices", "notes", "transfer_confirmations", "other" };
            for (var i = 0; i < workIds.Count; i++)
            {
                var docsToCreate = i < 4 ? 1 : i < 12 ? 2 : 3;
                for (var j = 0; j < docsToCreate; j++)
                {
                    var category = categories[(i + j) % categories.Length];
                    var content = System.Text.Encoding.UTF8.GetBytes($"APPRA demo placeholder: {category} dla zlecenia {i + 1}");
                    session.Connection.Execute(@"
                        INSERT INTO domain.workdocument(id, workid, category, filename, contenttype, filesize, content, uploadedon, uploadedbyemployeeid, uploadedbyname)
                        VALUES (@Id, @WorkId, @Category, @FileName, 'application/pdf', @FileSize, @Content, @UploadedOn, @EmployeeId, 'APPRA Demo')",
                        new { Id = Guid.NewGuid(), WorkId = workIds[i], Category = category, FileName = $"appra-demo-{i + 1:D2}-{category}.pdf", FileSize = content.Length, Content = content, UploadedOn = DateTime.UtcNow.AddDays(-(20 - i)).AddHours(j), EmployeeId = adminId });
                }
            }
        }

        private void CreateReplacementRentals(List<Guid> workIds, List<Guid> replacementVehicleIds)
        {
            if (!TableExists("domain.work_replacement_vehicle")) return;
            var statuses = new[] { "planned", "issued", "returned", "issued", "issued" };
            var workIndexes = new[] { 1, 6, 10, 13, 17 };
            for (var i = 0; i < workIndexes.Length; i++)
            {
                var status = statuses[i];
                var issuedOn = status == "planned" ? (DateTime?)null : DateTime.UtcNow.AddDays(-8 + i);
                var plannedReturn = status == "issued" && i == 1 ? (DateTime?)null : DateTime.UtcNow.AddDays(i == 3 ? -2 : 3);
                var returnedOn = status == "returned" ? DateTime.UtcNow.AddDays(-1) : (DateTime?)null;
                session.Connection.Execute(@"
                    INSERT INTO domain.work_replacement_vehicle(id, workid, replacementvehicleid, issuedon, plannedreturnon, returnedon, mileageout, mileagein, fuelout, fuelin, conditionout, conditionin, notes, status, createdon, changedon)
                    VALUES (@Id, @WorkId, @VehicleId, @IssuedOn, @PlannedReturnOn, @ReturnedOn, @MileageOut, @MileageIn, @FuelOut, @FuelIn, @ConditionOut, @ConditionIn, @Notes, @Status, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
                    new { Id = Guid.NewGuid(), WorkId = workIds[workIndexes[i]], VehicleId = replacementVehicleIds[i % replacementVehicleIds.Count], IssuedOn = issuedOn, PlannedReturnOn = plannedReturn, ReturnedOn = returnedOn, MileageOut = 30000 + i * 1500, MileageIn = returnedOn.HasValue ? 30250 + i * 1500 : (int?)null, FuelOut = i % 2 == 0 ? "3/4" : "1/2", FuelIn = returnedOn.HasValue ? "1/2" : null, ConditionOut = "Stan dobry, dokumentacja zdjęciowa wykonana.", ConditionIn = returnedOn.HasValue ? "Zwrot bez nowych uszkodzeń." : null, Notes = i == 1 ? "Pojazd wydany bez daty zwrotu - alert demonstracyjny." : "Najem pojazdu zastępczego APPRA demo.", Status = status });
            }
        }

        private void CreatePartOrders(List<Guid> workIds)
        {
            if (!TableExists("domain.work_part_order")) return;
            var parts = new[] { "Zderzak przedni", "Reflektor lewy", "Błotnik prawy", "Drzwi przednie", "Maska", "Czujnik parkowania", "Chłodnica", "Wspornik zderzaka", "Listwa ozdobna", "Lampa tylna" };
            var statuses = new[] { "to_order", "ordered", "in_delivery", "delivered", "returned", "cancelled" };
            for (var i = 4; i < workIds.Count; i++)
            {
                var lines = i % 3 == 0 ? 3 : 2;
                for (var j = 0; j < lines; j++)
                {
                    var net = 320m + i * 40 + j * 120;
                    var vat = Math.Round(net * 0.23m, 2);
                    var status = statuses[(i + j) % statuses.Length];
                    session.Connection.Execute(@"
                        INSERT INTO domain.work_part_order(id, workid, partname, oemnumber, supplier, quantity, netprice, vatamount, grossprice, status, orderedon, planneddeliveryon, deliveredon, ordernumber, notes, externalsupplierid, externalorderid, sourcesystem, createdon, changedon)
                        VALUES (@Id, @WorkId, @PartName, @OemNumber, @Supplier, @Quantity, @NetPrice, @VatAmount, @GrossPrice, @Status, @OrderedOn, @PlannedDeliveryOn, @DeliveredOn, @OrderNumber, @Notes, @ExternalSupplierId, @ExternalOrderId, 'manual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
                        new { Id = Guid.NewGuid(), WorkId = workIds[i], PartName = parts[(i + j) % parts.Length], OemNumber = $"OEM-APPRA-{i + 1:D2}{j + 1:D2}", Supplier = j % 2 == 0 ? "Inter Cars" : "Lokalny dostawca części", Quantity = 1 + j, NetPrice = net, VatAmount = vat, GrossPrice = net + vat, Status = status, OrderedOn = status == "to_order" ? (DateTime?)null : DateTime.UtcNow.AddDays(-6 + j), PlannedDeliveryOn = i == 8 ? DateTime.UtcNow.AddDays(-2) : DateTime.UtcNow.AddDays(2 + j), DeliveredOn = status == "delivered" || status == "returned" ? DateTime.UtcNow.AddDays(-1) : (DateTime?)null, OrderNumber = status == "to_order" ? null : $"IC/APPRA/{i + 1:D2}/{j + 1}", Notes = i == 8 ? "Dostawa opóźniona - alert demonstracyjny." : "Pozycja części demonstracyjnych.", ExternalSupplierId = "APPRA-DEMO-SUPPLIER", ExternalOrderId = status == "to_order" ? null : $"APPRA-DEMO-ORDER-{i + 1:D2}{j + 1:D2}" });
                }
            }
        }

        private void CreateTasks(List<Guid> workIds, DemoEmployees employees)
        {
            if (!TableExists("domain.work_task")) return;
            var tasks = new[] { new DemoTask("Oględziny pojazdu", "inspection", employees.Expert), new DemoTask("Przygotować kosztorys", "estimate", employees.Expert), new DemoTask("Zamówić części", "parts", employees.Office), new DemoTask("Naprawa blacharska", "body_shop", employees.BodyWorker), new DemoTask("Lakierowanie elementów", "paint_shop", employees.Painter), new DemoTask("Kontrola jakości", "quality_control", employees.Manager), new DemoTask("Przygotowanie do wydania", "vehicle_release", employees.Office), new DemoTask("Rozliczenie sprawy", "settlement", employees.Office), new DemoTask("Kontakt z klientem", "office", employees.Office), new DemoTask("Kontakt z ubezpieczycielem", "other", employees.Expert) };
            var statuses = new[] { "new", "in_progress", "on_hold", "completed", "cancelled" };
            var priorities = new[] { "normal", "high", "urgent", "low" };
            for (var i = 0; i < workIds.Count; i++)
            {
                for (var j = 0; j < 2; j++)
                {
                    var task = tasks[(i + j) % tasks.Length];
                    var status = statuses[(i + j) % statuses.Length];
                    session.Connection.Execute(@"
                        INSERT INTO domain.work_task(id, workid, title, description, tasktype, assignedemployeeid, status, priority, dueon, completedon, comment, createdbyemployeeid, createdon, changedon)
                        VALUES (@Id, @WorkId, @Title, @Description, @TaskType, @AssignedEmployeeId, @Status, @Priority, @DueOn, @CompletedOn, @Comment, @CreatedByEmployeeId, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
                        new { Id = Guid.NewGuid(), WorkId = workIds[i], task.Title, Description = "Zadanie demonstracyjne APPRA.", TaskType = task.Type, AssignedEmployeeId = i % 9 == 0 ? (Guid?)null : task.EmployeeId, Status = status, Priority = priorities[(i + j) % priorities.Length], DueOn = i % 5 == 0 ? DateTime.UtcNow.AddDays(-2) : DateTime.UtcNow.AddDays(2 + j), CompletedOn = status == "completed" ? DateTime.UtcNow.AddDays(-1) : (DateTime?)null, Comment = i % 5 == 0 ? "Termin zadania przekroczony - alert demonstracyjny." : "Bez uwag.", CreatedByEmployeeId = employees.Admin });
                }
            }
        }

        private void CreateChecklist(List<Guid> workIds, DemoEmployees employees)
        {
            if (!TableExists("domain.work_quality_checklist_item")) return;
            var defaults = new[] { new ChecklistSeed("vehicle_photos_done", "vehicle_intake", "Zdjęcia pojazdu wykonane", 10), new ChecklistSeed("client_documents_added", "documents", "Dokumenty klienta dodane", 20), new ChecklistSeed("assignment_checked", "documents", "Cesja sprawdzona", 30), new ChecklistSeed("estimate_checked", "inspection", "Kosztorys sprawdzony", 40), new ChecklistSeed("parts_ordered", "parts", "Części zamówione", 50), new ChecklistSeed("parts_delivered", "parts", "Części dostarczone", 60), new ChecklistSeed("repair_completed", "mechanical_repair", "Naprawa zakończona", 70), new ChecklistSeed("fitment_checked", "body_repair", "Kontrola spasowania", 80), new ChecklistSeed("paint_checked", "painting", "Kontrola lakieru", 90), new ChecklistSeed("electronics_checked", "final_control", "Kontrola elektroniki", 100), new ChecklistSeed("test_drive_done", "final_control", "Jazda próbna", 110), new ChecklistSeed("vehicle_washed", "washing", "Pojazd umyty", 120), new ChecklistSeed("release_documents_ready", "vehicle_release", "Dokumenty wydania przygotowane", 130) };
            for (var i = 2; i < workIds.Count; i++)
            {
                var completedLimit = i < 8 ? 4 : i < 16 ? 9 : defaults.Length;
                for (var j = 0; j < defaults.Length; j++)
                {
                    var item = defaults[j];
                    var isCompleted = j < completedLimit || i >= 18;
                    session.Connection.Execute(@"
                        INSERT INTO domain.work_quality_checklist_item(id, workid, itemkey, groupkey, itemname, description, iscompleted, completedbyemployeeid, completedon, notes, sortorder, createdon, changedon)
                        VALUES (@Id, @WorkId, @ItemKey, @GroupKey, @ItemName, @Description, @IsCompleted, @CompletedByEmployeeId, @CompletedOn, @Notes, @SortOrder, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                        ON CONFLICT (workid, itemkey) DO NOTHING",
                        new { Id = Guid.NewGuid(), WorkId = workIds[i], item.ItemKey, item.GroupKey, item.ItemName, Description = "Pozycja checklisty demonstracyjnej APPRA.", IsCompleted = isCompleted, CompletedByEmployeeId = isCompleted ? employees.Manager : (Guid?)null, CompletedOn = isCompleted ? DateTime.UtcNow.AddDays(-1) : (DateTime?)null, Notes = isCompleted ? "Wykonano w danych demonstracyjnych." : "Do wykonania.", item.SortOrder });
                }
            }
        }

        private void CreateStatusHistory(List<Guid> workIds, DemoEmployees employees)
        {
            if (!TableExists("domain.work_status_history")) return;
            var flow = new[] { "new", "inspection_pending", "estimate_sent", "approval_pending", "parts_pending", "repair", "paint_shop", "quality_control", "ready_for_pickup", "released" };
            for (var i = 0; i < workIds.Count; i++)
            {
                var currentStatus = session.Connection.ExecuteScalar<string>("SELECT COALESCE(NULLIF(TRIM(damagestatus), ''), 'new') FROM domain.work WHERE id = @WorkId", new { WorkId = workIds[i] });
                var currentIndex = Array.IndexOf(flow, currentStatus);
                if (currentIndex <= 0) continue;
                var startedOn = session.Connection.ExecuteScalar<DateTime>("SELECT startedon FROM domain.work WHERE id = @WorkId", new { WorkId = workIds[i] });
                for (var step = 1; step <= currentIndex; step++)
                {
                    session.Connection.Execute(@"
                        INSERT INTO domain.work_status_history(id, workid, oldstatus, newstatus, comment, changedbyemployeeid, changedon)
                        VALUES (@Id, @WorkId, @OldStatus, @NewStatus, @Comment, @ChangedByEmployeeId, @ChangedOn)",
                        new { Id = Guid.NewGuid(), WorkId = workIds[i], OldStatus = flow[step - 1], NewStatus = flow[step], Comment = $"Demo APPRA: zmiana statusu na {DemoStatusLabel(flow[step])}.", ChangedByEmployeeId = employees.Manager, ChangedOn = startedOn.AddDays(step).AddHours(9 + step) });
                }
            }
        }

        private void CreateCommunication(List<Guid> workIds, DemoEmployees employees)
        {
            if (!TableExists("domain.work_communication_entry")) return;
            var categories = new[] { "phone_to_client", "phone_from_client", "email", "phone_to_insurer", "phone_from_insurer", "internal_note" };
            var statuses = new[] { "information", "waiting_for_response", "answered", "closed" };
            for (var i = 0; i < workIds.Count; i++)
            {
                for (var j = 0; j < 2; j++)
                {
                    var category = categories[(i + j) % categories.Length];
                    var status = i % 6 == 0 && j == 1 ? "waiting_for_response" : statuses[(i + j) % statuses.Length];
                    session.Connection.Execute(@"
                        INSERT INTO domain.work_communication_entry(id, workid, category, subject, note, status, documentid, authorbyemployeeid, authorname, occurredon, createdon, changedon, integrationchannel, externalmessageid, externalthreadid)
                        VALUES (@Id, @WorkId, @Category, @Subject, @Note, @Status, NULL, @AuthorId, @AuthorName, @OccurredOn, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, @Channel, NULL, NULL)",
                        new { Id = Guid.NewGuid(), WorkId = workIds[i], Category = category, Subject = category.Contains("insurer") ? "Kontakt z ubezpieczycielem" : "Kontakt w sprawie szkody", Note = status == "waiting_for_response" ? "Oczekujemy na odpowiedź - alert demonstracyjny." : "Wpis komunikacji demonstracyjnej APPRA.", Status = status, AuthorId = employees.Office, AuthorName = "APPRA Demo", OccurredOn = DateTime.UtcNow.AddDays(-(10 - j)).AddHours(i), Channel = category == "email" ? "email_placeholder" : "manual" });
                }
            }
        }

        private void CreateVehicleReleases(List<Guid> workIds, DemoEmployees employees)
        {
            if (!TableExists("domain.work_vehicle_release")) return;
            for (var i = 16; i < workIds.Count; i++)
            {
                var released = i >= 18;
                session.Connection.Execute(@"
                    INSERT INTO domain.work_vehicle_release(id, workid, plannedreleaseon, releasedon, releasedbyemployeeid, receivedbyname, identitydocumentnumber, mileageout, fuelout, releasenotes, clientreceiveddocuments, clientreceivedinvoiceinfo, vehiclewashed, finalcontrolcompleted, clientsignatureplaceholder, createdon, changedon)
                    VALUES (@Id, @WorkId, @PlannedReleaseOn, @ReleasedOn, @ReleasedByEmployeeId, @ReceivedByName, @IdentityDocumentNumber, @MileageOut, @FuelOut, @ReleaseNotes, @ClientReceivedDocuments, @ClientReceivedInvoiceInfo, @VehicleWashed, @FinalControlCompleted, @ClientSignaturePlaceholder, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                    ON CONFLICT (workid) DO NOTHING",
                    new { Id = Guid.NewGuid(), WorkId = workIds[i], PlannedReleaseOn = DateTime.UtcNow.Date.AddDays(i == 16 ? -2 : 1), ReleasedOn = released ? DateTime.UtcNow.Date.AddDays(-1) : (DateTime?)null, ReleasedByEmployeeId = employees.Manager, ReceivedByName = released ? "Klient demonstracyjny" : null, IdentityDocumentNumber = released ? "DOW-APPRA-DEMO" : null, MileageOut = 65000 + i * 1200, FuelOut = "3/4", ReleaseNotes = released ? "Pojazd wydany klientowi w danych demonstracyjnych." : "Pojazd przygotowany do wydania.", ClientReceivedDocuments = released, ClientReceivedInvoiceInfo = i != 16, VehicleWashed = i != 17, FinalControlCompleted = i >= 18, ClientSignaturePlaceholder = "Podpis klienta zbierany poza systemem." });
            }
        }

        private bool TableExists(string tableName)
        {
            return session.Connection.ExecuteScalar<bool>("SELECT to_regclass(@TableName) IS NOT NULL", new { TableName = tableName });
        }

        private static string DemoStatusLabel(string status)
        {
            return status switch
            {
                "new" => "nowa szkoda",
                "inspection_pending" => "oczekuje na oględziny",
                "estimate_sent" => "kosztorys wykonany",
                "approval_pending" => "oczekuje na decyzję ubezpieczyciela",
                "parts_pending" => "części zamówione",
                "repair" => "naprawa w toku",
                "paint_shop" => "lakiernia",
                "quality_control" => "kontrola jakości",
                "ready_for_pickup" => "gotowe do wydania",
                "released" => "wydane klientowi",
                _ => status
            };
        }

        private record DemoEmployee(string FirstName, string LastName, string Profession, string Email);
        private record DemoEmployees(Guid Admin, Guid Manager, Guid Office, Guid BodyWorker, Guid Painter, Guid Expert);
        private record DemoClient(string FirstName, string LastName, string CompanyName, string Address, string City, string PostalCode, string Phone);
        private record DemoVehicle(string Producer, string Model, string RegNr, string Vin, int Year, int Odo);
        private record DemoTask(string Title, string Type, Guid EmployeeId);
        private record ChecklistSeed(string ItemKey, string GroupKey, string ItemName, int SortOrder);
    }

    public class AppraDemoDataRequestDto
    {
        public bool Reset { get; set; }
    }

    public class AppraDemoDataResultDto
    {
        public bool Created { get; set; }
        public int WorkCount { get; set; }
        public string Message { get; set; }
    }

    public class AppraDemoDataStatusDto
    {
        public bool Allowed { get; set; }
        public bool Exists { get; set; }
        public int WorkCount { get; set; }
        public string Message { get; set; }
    }
}
