using MechanicBuddy.Core.Application.Services;
using MechanicBuddy.Core.Domain;
using NHibernate;
using NHibernate.Linq;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace MechanicBuddy.Core.Persistence.Postgres.Repositories
{
    public class TenantConfigRepository : ITenantConfigRepository
    {
        private readonly ISession session;

        public TenantConfigRepository(ISession session)
        {
            this.session = session ?? throw new ArgumentNullException(nameof(session));
        }

        public async Task<TenantRequisites> GetRequisitesAsync()
        {
            // Get the first record (should only be one per tenant)
            var requisites = session.QueryOver<TenantRequisites>().List<TenantRequisites>().FirstOrDefault();
               

            if (requisites == null)
            {
                // Create default if none exists
                requisites = new TenantRequisites(
                    "Nazwa firmy",
                    "+48123456789",
                    "ul. Przykładowa 1, 00-001 Warszawa",
                    "kontakt@example.pl",
                    "PL00123456789012345678901234",
                    "REGON123456789",
                    "PL1234567890"
                );
                await session.SaveAsync(requisites);
                await session.FlushAsync();
            }
            await Task.CompletedTask;
            return requisites;
        }

        public async Task<TenantPricing> GetPricingAsync()
        {
            // Get the first record (should only be one per tenant)
            var pricing = session.QueryOver<TenantPricing>().List<TenantPricing>().FirstOrDefault();
                

            if (pricing == null)
            {
                // Create default if none exists
                pricing = new TenantPricing(
                    20,
                    "Dopłata",
                    "Zastrzeżenie",
                    true,
                    "Dziękujemy za skorzystanie z naszych usług. W załączeniu przesyłamy fakturę.",
                    "Dziękujemy za zainteresowanie ofertą. W załączeniu przesyłamy wycenę."
                );
                await session.SaveAsync(pricing);
                await session.FlushAsync();
            }
            await Task.CompletedTask;
            return pricing;
        }

        public async Task SaveRequisitesAsync(TenantRequisites requisites)
        {
            if (requisites == null)
                throw new ArgumentNullException(nameof(requisites));

            await session.SaveOrUpdateAsync(requisites);
            await session.FlushAsync();
        }

        public async Task SavePricingAsync(TenantPricing pricing)
        {
            if (pricing == null)
                throw new ArgumentNullException(nameof(pricing));

            await session.SaveOrUpdateAsync(pricing);
            await session.FlushAsync();
        }
    }
}
