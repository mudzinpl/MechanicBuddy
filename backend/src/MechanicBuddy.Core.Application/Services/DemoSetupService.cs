using System;
using System.Threading.Tasks;
using MechanicBuddy.Core.Application.Authorization;
using MechanicBuddy.Core.Application.Configuration;
using MechanicBuddy.Core.Application.Database;
using MechanicBuddy.Core.Application.Model;
using MechanicBuddy.Core.Domain;
using Dapper;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace MechanicBuddy.Core.Application.Services
{
    public interface IDemoSetupService
    {
        Task<(string username, string password, string tenantName)> CreateDemoTenant(string companyName = null);
        Task PopulateDemoData(string tenantName, string companyName, Guid adminEmployeeId);
    }

    public class DemoSetupService : IDemoSetupService
    {
        private readonly ILogger<DemoSetupService> _logger;
        private readonly DbOptions _dbOptions;
        private readonly ITenancyRepository _repository;

        public DemoSetupService(
            ILogger<DemoSetupService> logger,
            IOptions<DbOptions> dbOptions,
            ITenancyRepository repository)
        {
            _logger = logger;
            _dbOptions = dbOptions.Value;
            _repository = repository;
        }
        public async Task<(string username, string password, string tenantName)> CreateDemoTenant(string companyName = null)
        {
            if (_dbOptions.MultiTenancy?.Enabled != true)
            {
                throw new InvalidOperationException("Multi-tenancy must be enabled for demo setup");
            }

            string tenantName = ShortGuid.NewGuid();
            string username = $"demo{tenantName}";
            string password = "carcare";
            string hashedPassword = Authorization.PasswordHasher.getHash(password);

            // Create tenant database from template
            await _repository.CreateTenantDatabase(tenantName);

            // Create admin employee and user
            var adminEmployeeId = Guid.NewGuid();

            // Create user in tenancy database
            await _repository.CreateTenantUser(tenantName, username, hashedPassword, adminEmployeeId);

            // Populate demo data
            await PopulateDemoData(tenantName, companyName ?? "Warsztat demonstracyjny", adminEmployeeId);

            return (username, password, tenantName);
        }

        public async Task PopulateDemoData(string tenantName, string companyName, Guid adminEmployeeId)
        {

            await using (var connection = await _repository.GetTenantConnection(tenantName))
            {
                // Create admin employee
                await connection.ExecuteAsync(@"
                INSERT INTO domain.employee(id, firstname, lastname, email, phone, proffession, description, introducedat)
                VALUES (@Id, 'Demo', 'Administrator', 'admin@mechanicbuddy.app', '+48123456789', 'Administrator', 'Konto administratora wersji demonstracyjnej', CURRENT_TIMESTAMP)",
                    new { Id = adminEmployeeId });

                // Update the user with the employee ID
                await _repository.UpdateTenantUser(tenantName, adminEmployeeId);

                await connection.ExecuteAsync(@"
                    UPDATE tenant_config.requisites 
                    SET 
                        name = @CompanyName, 
                        updated_at = CURRENT_TIMESTAMP",
                  new { CompanyName = companyName ?? "Warsztat demonstracyjny" });

                // Create storage
                var storageId = Guid.NewGuid();
                await connection.ExecuteAsync(@"
                    INSERT INTO domain.storage(id, name, address, description, introducedat)
                    VALUES (@Id, 'Magazyn główny', 'ul. Magazynowa 1', 'Główny magazyn części', CURRENT_TIMESTAMP)",
                    new { Id = storageId });

                // Create clients - one company and one individual
                var companyClientId = Guid.NewGuid();
                await connection.ExecuteAsync(@"
                    INSERT INTO domain.client(id, address, country, region, city, postalcode, phone, isasshole, description, introducedat)
                    VALUES (@Id, 'ul. Główna 123', 'Polska', 'mazowieckie', 'Warszawa', '00-001', '+48221234567', false, 'Przykładowy klient firmowy', CURRENT_TIMESTAMP)",
                    new { Id = companyClientId });

                await connection.ExecuteAsync(@"
                    INSERT INTO domain.legalclient(id, name, regnr)
                    VALUES (@Id, @Name, 'REG12345')",
                    new { Id = companyClientId, Name = companyName });

                await connection.ExecuteAsync(@"
                    INSERT INTO domain.clientemail(clientid, address, isactive)
                    VALUES (@ClientId, 'company@mechanicbuddy.app', true)",
                    new { ClientId = companyClientId });

                var privateClientId = Guid.NewGuid();
                await connection.ExecuteAsync(@"
                    INSERT INTO domain.client(id, address, country, region, city, postalcode, phone, isasshole, description, introducedat)
                    VALUES (@Id, 'ul. Boczna 45', 'Polska', 'mazowieckie', 'Warszawa', '00-002', '+48500100200', false, 'Przykładowy klient indywidualny', CURRENT_TIMESTAMP)",
                    new { Id = privateClientId });

                await connection.ExecuteAsync(@"
                    INSERT INTO domain.privateclient(id, firstname, lastname, personalcode)
                    VALUES (@Id, 'Jan', 'Kowalski', 'ID12345')",
                    new { Id = privateClientId });

                await connection.ExecuteAsync(@"
                    INSERT INTO domain.clientemail(clientid, address, isactive)
                    VALUES (@ClientId, 'john.doe@mechanicbuddy.app', true)",
                    new { ClientId = privateClientId });

                // Create vehicles
                var vehicleId1 = Guid.NewGuid();
                await connection.ExecuteAsync(@"
                    INSERT INTO domain.vehicle(id, producer, model, regnr, vin, odo, body, engine, productiondate, introducedat)
                    VALUES (@Id, 'Toyota', 'Corolla', 'ABC123', 'VIN12345678901234', 50000, 'Sedan', '1.8L', '2020-01-01', CURRENT_TIMESTAMP)",
                    new { Id = vehicleId1 });

                await connection.ExecuteAsync(@"
                    INSERT INTO domain.vehicleregistration(vehicleid, ownerid, datetimefrom)
                    VALUES (@VehicleId, @OwnerId, CURRENT_TIMESTAMP)",
                    new { VehicleId = vehicleId1, OwnerId = companyClientId });

                var vehicleId2 = Guid.NewGuid();
                await connection.ExecuteAsync(@"
                    INSERT INTO domain.vehicle(id, producer, model, regnr, vin, odo, body, engine, productiondate, introducedat)
                    VALUES (@Id, 'Honda', 'Civic', 'XYZ789', 'VIN98765432109876', 30000, 'Hatchback', '1.5L', '2021-05-15', CURRENT_TIMESTAMP)",
                    new { Id = vehicleId2 });

                await connection.ExecuteAsync(@"
                    INSERT INTO domain.vehicleregistration(vehicleid, ownerid, datetimefrom)
                    VALUES (@VehicleId, @OwnerId, CURRENT_TIMESTAMP)",
                    new { VehicleId = vehicleId2, OwnerId = privateClientId });

                // Create spare parts
                string[] partNames = {
                    "Filtr oleju", "Filtr powietrza", "Filtr paliwa", "Klocki hamulcowe", "Świece zapłonowe",
                    "Pióra wycieraczek", "Pasek rozrządu", "Akumulator", "Chłodnica", "Alternator"
                };

                for (int i = 0; i < partNames.Length; i++)
                {
                    var partId = Guid.NewGuid();
                    await connection.ExecuteAsync(@"
                        INSERT INTO domain.sparepart(id, code, name, price, quantity, discount, storageid, description, introducedat)
                        VALUES (@Id, @Code, @Name, @Price, @Quantity, 0, @StorageId, @Description, CURRENT_TIMESTAMP)",
                        new
                        {
                            Id = partId,
                            Code = $"PART{i + 1:D3}",
                            Name = partNames[i],
                            Price = 10.0m + (i * 5.0m),
                            Quantity = 10 + i,
                            StorageId = storageId,
                            Description = $"Przykładowa część: {partNames[i]}"
                        });
                }

                // Create mechanics
                var mechanic1Id = Guid.NewGuid();
                await connection.ExecuteAsync(@"
                    INSERT INTO domain.employee(id, firstname, lastname, email, phone, proffession, description, introducedat)
                    VALUES (@Id, 'Marek', 'Nowak', 'marek.nowak@mechanicbuddy.app', '+48500111222', 'Starszy mechanik', 'Doświadczony mechanik', CURRENT_TIMESTAMP)",
                    new { Id = mechanic1Id });

                var mechanic2Id = Guid.NewGuid();
                await connection.ExecuteAsync(@"
                    INSERT INTO domain.employee(id, firstname, lastname, email, phone, proffession, description, introducedat)
                    VALUES (@Id, 'Anna', 'Wiśniewska', 'anna.wisniewska@mechanicbuddy.app', '+48500333444', 'Młodszy mechanik', 'Mechanik rozpoczynający pracę', CURRENT_TIMESTAMP)",
                    new { Id = mechanic2Id });

                // Create works with offers and jobs
                await CreateSampleWork(connection, companyClientId, vehicleId1, adminEmployeeId, mechanic1Id, mechanic2Id);
                await CreateSampleWork(connection, privateClientId, vehicleId2, adminEmployeeId, mechanic1Id, null);
            }


        }

        private async Task CreateSampleWork(
          Npgsql.NpgsqlConnection connection,
          Guid clientId,
          Guid vehicleId,
          Guid adminEmployeeId,
          Guid? mechanic1Id,
          Guid? mechanic2Id)
        {
            // Create a work record
            var workId = Guid.NewGuid();
            var workNumber = new Random().Next(1000, 9999);

            await connection.ExecuteAsync(@"
        INSERT INTO domain.work(id, number, startedon, starterid, clientid, vehicleid, notes, odo, userstatus, changedon)
        VALUES (@Id, @Number, CURRENT_TIMESTAMP, @StarterId, @ClientId, @VehicleId, 'Przykładowe zlecenie serwisowe', 55000, 0, CURRENT_TIMESTAMP)",
                new
                {
                    Id = workId,
                    Number = workNumber,
                    StarterId = adminEmployeeId,
                    ClientId = clientId,
                    VehicleId = vehicleId
                });

            // Assign mechanics to the work
            if (mechanic1Id.HasValue)
            {
                await connection.ExecuteAsync(@"
            INSERT INTO domain.assignment(workid, mechanicid)
            VALUES (@WorkId, @MechanicId)",
                    new { WorkId = workId, MechanicId = mechanic1Id.Value });
            }

            if (mechanic2Id.HasValue)
            {
                await connection.ExecuteAsync(@"
            INSERT INTO domain.assignment(workid, mechanicid)
            VALUES (@WorkId, @MechanicId)",
                    new { WorkId = workId, MechanicId = mechanic2Id.Value });
            }

            // Create an offer
            var offerId = Guid.NewGuid();
            await connection.ExecuteAsync(@"
        INSERT INTO domain.offer(id, workid, ordernr, notes, isvehilelinesonestimate, startedon, starterid)
        VALUES (@Id, @WorkId, 1, 'Przykładowa oferta', true, CURRENT_TIMESTAMP, @StarterId)",
                new { Id = offerId, WorkId = workId, StarterId = adminEmployeeId });

            // Add products to the offer
            var product1Id = Guid.NewGuid();
            await connection.ExecuteAsync(@"
        INSERT INTO domain.saleable(id, name, quantity, unit, price, discount)
        VALUES (@Id, @Name, @Quantity, @Unit, @Price, @Discount)",
                new
                {
                    Id = product1Id,
                    Name = "Usługa wymiany oleju",
                    Quantity = 1.0,
                    Unit = "szt.",
                    Price = 49.99,
                    Discount = (short)0
                });

            await connection.ExecuteAsync(@"
        INSERT INTO domain.productoffered(id, offerid, jnr, code)
        VALUES (@Id, @OfferId, @Jnr, @Code)",
                new
                {
                    Id = product1Id,
                    OfferId = offerId,
                    Jnr = (short)1,
                    Code = "SERVICE001"
                });

            var product2Id = Guid.NewGuid();
            await connection.ExecuteAsync(@"
        INSERT INTO domain.saleable(id, name, quantity, unit, price, discount)
        VALUES (@Id, @Name, @Quantity, @Unit, @Price, @Discount)",
                new
                {
                    Id = product2Id,
                    Name = "Kontrola układu hamulcowego",
                    Quantity = 1.0,
                    Unit = "szt.",
                    Price = 29.99,
                    Discount = (short)0
                });

            await connection.ExecuteAsync(@"
        INSERT INTO domain.productoffered(id, offerid, jnr, code)
        VALUES (@Id, @OfferId, @Jnr, @Code)",
                new
                {
                    Id = product2Id,
                    OfferId = offerId,
                    Jnr = (short)2,
                    Code = "SERVICE002"
                });

            // Create a repair job
            var jobId = Guid.NewGuid();
            await connection.ExecuteAsync(@"
        INSERT INTO domain.repairjob(id, workid, ordernr, notes, startedon, starterid)
        VALUES (@Id, @WorkId, @OrderNr, @Notes, CURRENT_TIMESTAMP, @StarterId)",
                new
                {
                    Id = jobId,
                    WorkId = workId,
                    OrderNr = (short)1,
                    Notes = "Przykładowa naprawa",
                    StarterId = adminEmployeeId
                });

            // Add products to the repair job
            var installed1Id = Guid.NewGuid();
            await connection.ExecuteAsync(@"
        INSERT INTO domain.saleable(id, name, quantity, unit, price, discount)
        VALUES (@Id, @Name, @Quantity, @Unit, @Price, @Discount)",
                new
                {
                    Id = installed1Id,
                    Name = "Wymiana filtra oleju",
                    Quantity = 1.0,
                    Unit = "szt.",
                    Price = 19.99,
                    Discount = (short)0
                });

            await connection.ExecuteAsync(@"
        INSERT INTO domain.productinstalled(id, repairjobid, jnr, code, status, notes)
        VALUES (@Id, @JobId, @Jnr, @Code, @Status, @Notes)",
                new
                {
                    Id = installed1Id,
                    JobId = jobId,
                    Jnr = (short)1,
                    Code = "PART001",
                    Status = (short)3,
                    Notes = "Zamontowano nowy filtr oleju"
                });

            var installed2Id = Guid.NewGuid();
            await connection.ExecuteAsync(@"
        INSERT INTO domain.saleable(id, name, quantity, unit, price, discount)
        VALUES (@Id, @Name, @Quantity, @Unit, @Price, @Discount)",
                new
                {
                    Id = installed2Id,
                    Name = "Olej silnikowy 5W-30",
                    Quantity = 5.0,
                    Unit = "L",
                    Price = 9.99,
                    Discount = (short)0
                });

            await connection.ExecuteAsync(@"
        INSERT INTO domain.productinstalled(id, repairjobid, jnr, code, status, notes)
        VALUES (@Id, @JobId, @Jnr, @Code, @Status, @Notes)",
                new
                {
                    Id = installed2Id,
                    JobId = jobId,
                    Jnr = (short)2,
                    Code = "PART002",
                    Status = (short)3,
                    Notes = "Zużyto 5 litrów oleju"
                });

            // Create an estimate
            var estimateId = Guid.NewGuid();
            var estimateNumber = $"{workNumber}-1";

            await connection.ExecuteAsync(@"
        INSERT INTO domain.pricing(id, issuedon, issuerid, partyname, vehicleline1, vehicleline2)
        VALUES (@Id, CURRENT_TIMESTAMP, @IssuerId, @PartyName, @VehicleLine1, @VehicleLine2)",
                new
                {
                    Id = estimateId,
                    IssuerId = adminEmployeeId,
                    PartyName = "Klient demonstracyjny",
                    VehicleLine1 = "Pojazd: samochód demonstracyjny",
                    VehicleLine2 = "Nr rej.: ABC123"
                });

            await connection.ExecuteAsync(@"
        INSERT INTO domain.estimate(id, number)
        VALUES (@Id, @Number)",
                new { Id = estimateId, Number = estimateNumber });

            // Link estimate to the offer
            await connection.ExecuteAsync(@"
        UPDATE domain.offer SET estimateid = @EstimateId WHERE id = @OfferId",
                new { EstimateId = estimateId, OfferId = offerId });

            // Add pricing lines
            await connection.ExecuteAsync(@"
        INSERT INTO domain.pricingline(pricingid, nr, description, quantity, unitprice, unit, discount, total, totalwithvat)
        VALUES (@PricingId, @Nr, @Description, @Quantity, @UnitPrice, @Unit, @Discount, @Total, @TotalWithVat)",
                new
                {
                    PricingId = estimateId,
                    Nr = (short)1,
                    Description = "Usługa wymiany oleju",
                    Quantity = 1.0,
                    UnitPrice = 49.99,
                    Unit = "szt.",
                    Discount = (short)0,
                    Total = 49.99,
                    TotalWithVat = 59.99
                });

            await connection.ExecuteAsync(@"
        INSERT INTO domain.pricingline(pricingid, nr, description, quantity, unitprice, unit, discount, total, totalwithvat)
        VALUES (@PricingId, @Nr, @Description, @Quantity, @UnitPrice, @Unit, @Discount, @Total, @TotalWithVat)",
                new
                {
                    PricingId = estimateId,
                    Nr = (short)2,
                    Description = "Kontrola układu hamulcowego",
                    Quantity = 1.0,
                    UnitPrice = 29.99,
                    Unit = "szt.",
                    Discount = (short)0,
                    Total = 29.99,
                    TotalWithVat = 35.99
                });
        } 
         
    }
}
