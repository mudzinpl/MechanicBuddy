using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using System.Xml.Linq;

namespace MechanicBuddy.Core.Domain
{ 
    public  class Work : GuidIdentityEntity
    {
        Client client;
        IList<Offer> offers = new List<Offer>();
        IList<RepairJob> jobs = new List<RepairJob>();
        private IList<Assignment> assignements = new List<Assignment>(); 
        public virtual IReadOnlyCollection<Offer> Offers { get => this.offers.ToList().AsReadOnly(); }
        public virtual IReadOnlyCollection<RepairJob> Jobs { get => this.jobs.ToList().AsReadOnly(); }
        public virtual IReadOnlyCollection<Employee> Mechanics => assignements.Select(x => x.Mechanic).ToList().AsReadOnly();
        protected Work() { }
        public  Work(int number,DateTime startedOn, Employee starter, Client client = null, Vehicle vehicle = null,Invoice invoice = null,string notes = null, int? odo = null, Guid? id = null)
        {
            Id = id.GetValueOrDefault();
            StartedOn = startedOn;
            this.ChangedOn = DateTime.Now;
            this.Starter = starter ?? throw new ArgumentNullException(nameof(starter));
            this.client = client;
            this.Vehicle = vehicle;
            this.Notes = notes;
            this.Odo = odo;
            this.Invoice = invoice;
            this.Number = number;
        }
      
        public virtual async Task<Offer> Issue(Offer offer, IPricingSender sender, int purchaseTax, Employee issuer, bool showVehicleOnPricing, bool sendClientEmail, string clientEmail)
        {
            if (sendClientEmail && string.IsNullOrWhiteSpace(clientEmail))
            {
                throw new UserException("Cannot send an estimate, client email not provided.");
            }
            
            if (offer.Estimate != null)   //reissuing has to create a new copy, most likely current issued version is already out there , cant have different versioins of offer with same number
            {
                offer = offer.MakeCopy(this, issuer);
                this.offers.Add(offer); 
            }

            offer.Issue(purchaseTax, issuer, showVehicleOnPricing);

            if (sendClientEmail)
            {
                await offer.SendEstimate(sender, clientEmail);
            }
            return offer;
        }
        public virtual WorkStatus UserStatus { get; protected set; }
        public virtual void ChangeState(WorkStatus status)
        {
            if (this.Invoice is not null && status == WorkStatus.Closed) throw new UserException("Cannot close, invoice issued.");

            this.UserStatus = status;
        }
         

        public virtual Work CreateCopy( int newNumber,Employee starter)
        {
            var work = new Work(newNumber,DateTime.Now,starter,Client,Vehicle,null,notes:Notes,odo:Odo);
            work.UpdateClaimDetails(
                ClaimNumber,
                Insurer,
                DamageType,
                DamageStatus,
                AssignmentOfClaimSigned,
                ClientPaysVat,
                AudatexEstimateNumber,
                InsurerNotes,
                ClaimHandlerName,
                ClaimHandlerEmail,
                ClaimHandlerPhone,
                ClaimReportedOn,
                EstimateSentOn,
                InsurerDecisionOn,
                SupplementPaidOn,
                EstimateSystem,
                EstimateVersion,
                EstimatePreparedOn,
                EstimateNetAmount,
                EstimateVatAmount,
                EstimateGrossAmount,
                EstimateLaborMechanicalRbg,
                EstimateLaborPaintRbg,
                EstimateStatus,
                EstimateAcceptedOn,
                EstimateNotes,
                EstimateDocumentId,
                AssignmentOfClaimSignedOn,
                PowerOfAttorneySigned,
                PowerOfAttorneySignedOn,
                ClientVatPercent,
                ClientVatAmount,
                UnderpaymentAmount,
                SettlementStatus,
                PaymentDemandOn,
                PaymentReceivedOn,
                SettlementNotes,
                InvoiceNetAmount,
                InvoiceVatAmount,
                InvoiceGrossAmount,
                InsurerPaidAmount,
                ClientSurchargeAmount,
                PaymentDueOn,
                InvoicePaymentOn,
                InvoicePaymentStatus,
                ExternalInvoiceId,
                ExternalInvoiceNumber,
                InvoiceSourceSystem);
            foreach (var job in jobs)
            {
                work.jobs.Add(job.MakeCopy(work, starter));
            }
            foreach (var offer in offers)
            {
                work.offers.Add(offer.MakeCopy(work, starter));
            }
            return work;
        }
          

        public virtual void Complete(Employee completer)
        {
            this.Completer = completer;
            this.CompletedOn = DateTime.Now;
        }

        public virtual void Assign(Employee mechanic) 
        {
            this.Assign(new[] { mechanic });
        }
        public virtual void Assign(Employee[] mechanics)
        { 
            
            foreach (var mechanic in mechanics)
            {
                if (!this.assignements.Any(x => x.Mechanic == mechanic)) 
                {
                    this.assignements.Add(new Assignment(this, mechanic));
                }
            }
            var toRemove = assignements.Where(assignment => !mechanics.Any(x => x == assignment.Mechanic)).ToList();
            foreach (var assignment in toRemove)
            {
                this.assignements.Remove(assignment);
            } 
        }
         
        public virtual void GenerateInvoice(ISequnceNumberProviderFactory numberProvider, int purchaseTax, PaymentType paymentType, short dueDays, Employee issuer)
        {
            var number = numberProvider.
                GetNumberProvider<Invoice>();

            this.Invoice = Invoice.CreateFor(this,  number,purchaseTax, paymentType, dueDays, issuer); 
        }
  
        public virtual void WithNotes(string description)
        {
            this.Notes = description;
        }

        public virtual void UpdateClaimDetails(
            string claimNumber,
            string insurer,
            string damageType,
            string damageStatus,
            bool assignmentOfClaimSigned,
            bool clientPaysVat,
            string audatexEstimateNumber,
            string insurerNotes,
            string claimHandlerName = null,
            string claimHandlerEmail = null,
            string claimHandlerPhone = null,
            DateTime? claimReportedOn = null,
            DateTime? estimateSentOn = null,
            DateTime? insurerDecisionOn = null,
            DateTime? supplementPaidOn = null,
            string estimateSystem = null,
            string estimateVersion = null,
            DateTime? estimatePreparedOn = null,
            decimal? estimateNetAmount = null,
            decimal? estimateVatAmount = null,
            decimal? estimateGrossAmount = null,
            decimal? estimateLaborMechanicalRbg = null,
            decimal? estimateLaborPaintRbg = null,
            string estimateStatus = null,
            DateTime? estimateAcceptedOn = null,
            string estimateNotes = null,
            Guid? estimateDocumentId = null,
            DateTime? assignmentOfClaimSignedOn = null,
            bool powerOfAttorneySigned = false,
            DateTime? powerOfAttorneySignedOn = null,
            int? clientVatPercent = null,
            decimal? clientVatAmount = null,
            decimal? underpaymentAmount = null,
            string settlementStatus = null,
            DateTime? paymentDemandOn = null,
            DateTime? paymentReceivedOn = null,
            string settlementNotes = null,
            decimal? invoiceNetAmount = null,
            decimal? invoiceVatAmount = null,
            decimal? invoiceGrossAmount = null,
            decimal? insurerPaidAmount = null,
            decimal? clientSurchargeAmount = null,
            DateTime? paymentDueOn = null,
            DateTime? invoicePaymentOn = null,
            string invoicePaymentStatus = null,
            string externalInvoiceId = null,
            string externalInvoiceNumber = null,
            string invoiceSourceSystem = null)
        {
            ClaimNumber = claimNumber;
            Insurer = insurer;
            DamageType = damageType;
            DamageStatus = string.IsNullOrWhiteSpace(damageStatus) ? DamageStatus ?? "new" : damageStatus;
            AssignmentOfClaimSigned = assignmentOfClaimSigned;
            ClientPaysVat = clientPaysVat;
            AudatexEstimateNumber = audatexEstimateNumber;
            InsurerNotes = insurerNotes;
            ClaimHandlerName = claimHandlerName;
            ClaimHandlerEmail = claimHandlerEmail;
            ClaimHandlerPhone = claimHandlerPhone;
            ClaimReportedOn = claimReportedOn;
            EstimateSentOn = estimateSentOn;
            InsurerDecisionOn = insurerDecisionOn;
            SupplementPaidOn = supplementPaidOn;
            EstimateSystem = estimateSystem;
            EstimateVersion = estimateVersion;
            EstimatePreparedOn = estimatePreparedOn;
            EstimateNetAmount = estimateNetAmount;
            EstimateVatAmount = estimateVatAmount;
            EstimateGrossAmount = estimateGrossAmount;
            EstimateLaborMechanicalRbg = estimateLaborMechanicalRbg;
            EstimateLaborPaintRbg = estimateLaborPaintRbg;
            EstimateStatus = string.IsNullOrWhiteSpace(estimateStatus) ? EstimateStatus : estimateStatus;
            EstimateAcceptedOn = estimateAcceptedOn;
            EstimateNotes = estimateNotes;
            EstimateDocumentId = estimateDocumentId;
            AssignmentOfClaimSignedOn = assignmentOfClaimSignedOn;
            PowerOfAttorneySigned = powerOfAttorneySigned;
            PowerOfAttorneySignedOn = powerOfAttorneySignedOn;
            ClientVatPercent = clientVatPercent;
            ClientVatAmount = clientVatAmount;
            UnderpaymentAmount = underpaymentAmount;
            SettlementStatus = string.IsNullOrWhiteSpace(settlementStatus) ? SettlementStatus ?? "unsettled" : settlementStatus;
            PaymentDemandOn = paymentDemandOn;
            PaymentReceivedOn = paymentReceivedOn;
            SettlementNotes = settlementNotes;
            InvoiceNetAmount = invoiceNetAmount;
            InvoiceVatAmount = invoiceVatAmount;
            InvoiceGrossAmount = invoiceGrossAmount;
            InsurerPaidAmount = insurerPaidAmount;
            ClientSurchargeAmount = clientSurchargeAmount;
            PaymentDueOn = paymentDueOn;
            InvoicePaymentOn = invoicePaymentOn;
            InvoicePaymentStatus = string.IsNullOrWhiteSpace(invoicePaymentStatus) ? InvoicePaymentStatus ?? "not_issued" : invoicePaymentStatus;
            ExternalInvoiceId = externalInvoiceId;
            ExternalInvoiceNumber = externalInvoiceNumber;
            InvoiceSourceSystem = string.IsNullOrWhiteSpace(invoiceSourceSystem) ? InvoiceSourceSystem ?? "manual" : invoiceSourceSystem;
        }

        public virtual void UpdateSchedule(
            DateTime? plannedIntakeOn,
            DateTime? plannedReleaseOn,
            DateTime? plannedInspectionOn)
        {
            PlannedIntakeOn = plannedIntakeOn;
            PlannedReleaseOn = plannedReleaseOn;
            PlannedInspectionOn = plannedInspectionOn;
        }

        public virtual void UpdateInspectionPreparation(
            string inspectionMode,
            string inspectionVisitorName,
            string inspectionContactPhone,
            string inspectionRemoteEmail,
            bool powerOfAttorneyPrepared,
            bool powerOfAttorneySent,
            bool powerOfAttorneyReceived,
            bool vehiclePhotosReceived,
            bool damagePhotosReceived,
            bool registrationDocumentPhotoReceived,
            bool drivingLicencePhotoReceived,
            bool incidentStatementReceived,
            bool responsiblePartyDataReceived,
            bool policyNumberReceived)
        {
            InspectionMode = inspectionMode;
            InspectionVisitorName = inspectionVisitorName;
            InspectionContactPhone = inspectionContactPhone;
            InspectionRemoteEmail = inspectionRemoteEmail;
            PowerOfAttorneyPrepared = powerOfAttorneyPrepared;
            PowerOfAttorneySent = powerOfAttorneySent;
            if (PowerOfAttorneySigned != powerOfAttorneyReceived)
            {
                PowerOfAttorneySignedOn = powerOfAttorneyReceived ? DateTime.UtcNow : null;
            }
            PowerOfAttorneySigned = powerOfAttorneyReceived;
            VehiclePhotosReceived = vehiclePhotosReceived;
            DamagePhotosReceived = damagePhotosReceived;
            RegistrationDocumentPhotoReceived = registrationDocumentPhotoReceived;
            DrivingLicencePhotoReceived = drivingLicencePhotoReceived;
            IncidentStatementReceived = incidentStatementReceived;
            ResponsiblePartyDataReceived = responsiblePartyDataReceived;
            PolicyNumberReceived = policyNumberReceived;
        }

        public virtual IReadOnlyCollection<string> GetInspectionPreparationBlockers()
        {
            var blockers = new List<string>();
            var mode = InspectionMode?.Trim().ToLowerInvariant();

            if (mode != "workshop" && mode != "remote")
            {
                blockers.Add("Nie wybrano sposobu oględzin");
                return blockers.AsReadOnly();
            }

            if (mode == "workshop")
            {
                if (!PlannedInspectionOn.HasValue) blockers.Add("Brak terminu przyjazdu");
                if (string.IsNullOrWhiteSpace(InspectionVisitorName)) blockers.Add("Brak osoby, która przyjedzie");
                if (string.IsNullOrWhiteSpace(InspectionContactPhone) && string.IsNullOrWhiteSpace(ClaimHandlerPhone) && string.IsNullOrWhiteSpace(Client?.Phone))
                    blockers.Add("Brak telefonu kontaktowego");
                if (!PowerOfAttorneyPrepared) blockers.Add("Upoważnienie nie jest przygotowane");
            }
            else
            {
                if (string.IsNullOrWhiteSpace(InspectionRemoteEmail)) blockers.Add("Brak e-maila klienta");
                if (!PowerOfAttorneyPrepared) blockers.Add("Upoważnienie nie jest przygotowane");
                if (!PowerOfAttorneySent) blockers.Add("Upoważnienie nie zostało wysłane");
                if (!PowerOfAttorneySigned) blockers.Add("Upoważnienie nie zostało odebrane");
                if (!VehiclePhotosReceived) blockers.Add("Brak zdjęć pojazdu");
                if (!DamagePhotosReceived) blockers.Add("Brak zdjęć uszkodzeń");
                if (!RegistrationDocumentPhotoReceived) blockers.Add("Brak zdjęcia dowodu rejestracyjnego");
            }

            return blockers.AsReadOnly();
        }

        public virtual int GetInspectionPreparationCompletionPercent()
        {
            var mode = InspectionMode?.Trim().ToLowerInvariant();
            if (mode != "workshop" && mode != "remote") return 0;

            var totalRequirements = mode == "workshop" ? 5 : 8;
            return (int)Math.Round((totalRequirements - GetInspectionPreparationBlockers().Count) * 100d / totalRequirements);
        }

        public virtual void EnsureInspectionPreparationAllows(string newDamageStatus)
        {
            var currentStatus = string.IsNullOrWhiteSpace(DamageStatus) ? "new" : DamageStatus.Trim().ToLowerInvariant();
            if (currentStatus != "new" && currentStatus != "inspection_pending") return;

            var statusesAfterPreparation = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "inspected", "estimate_preparing", "estimate_sent", "approval_pending", "accepted",
                "parts_pending", "repair", "paint_shop", "quality_control", "ready_for_pickup",
                "released", "settled"
            };
            if (!statusesAfterPreparation.Contains(newDamageStatus ?? string.Empty)) return;

            var blockers = GetInspectionPreparationBlockers();
            if (blockers.Count > 0)
            {
                throw new UserException($"Nie można zakończyć przygotowania oględzin. Brakuje: {string.Join(", ", blockers)}.");
            }
        }

        public virtual void UpdateInspectionExecution(
            DateTime? inspectionPerformedOn,
            int? odo,
            bool inspectionVinVerified,
            bool inspectionDamageScopeConfirmed,
            bool inspectionVehiclePhotosComplete,
            bool inspectionDamagePhotosComplete,
            bool inspectionVinPhotoComplete,
            string inspectionNotes)
        {
            InspectionPerformedOn = inspectionPerformedOn;
            Odo = odo;
            InspectionVinVerified = inspectionVinVerified;
            InspectionDamageScopeConfirmed = inspectionDamageScopeConfirmed;
            InspectionVehiclePhotosComplete = inspectionVehiclePhotosComplete;
            InspectionDamagePhotosComplete = inspectionDamagePhotosComplete;
            InspectionVinPhotoComplete = inspectionVinPhotoComplete;
            InspectionNotes = inspectionNotes;
        }

        public virtual IReadOnlyCollection<string> GetInspectionExecutionBlockers(bool hasPhotoDocumentation)
        {
            var blockers = new List<string>();
            if (!InspectionPerformedOn.HasValue) blockers.Add("Brak daty wykonania oględzin");
            if (!Odo.HasValue || Odo.Value < 0) blockers.Add("Brak przebiegu pojazdu");
            if (!InspectionVinVerified) blockers.Add("VIN nie został zweryfikowany");
            if (!InspectionDamageScopeConfirmed) blockers.Add("Zakres uszkodzeń nie został potwierdzony");
            if (!InspectionVehiclePhotosComplete) blockers.Add("Nie potwierdzono kompletu zdjęć pojazdu");
            if (!InspectionDamagePhotosComplete) blockers.Add("Nie potwierdzono kompletu zdjęć uszkodzeń");
            if (!InspectionVinPhotoComplete) blockers.Add("Nie potwierdzono zdjęcia VIN");
            if (!hasPhotoDocumentation) blockers.Add("Brak plików ze zdjęciami w dokumentach sprawy");
            return blockers.AsReadOnly();
        }

        public virtual int GetInspectionExecutionCompletionPercent(bool hasPhotoDocumentation)
        {
            const int totalRequirements = 8;
            return (int)Math.Round((totalRequirements - GetInspectionExecutionBlockers(hasPhotoDocumentation).Count) * 100d / totalRequirements);
        }

        public virtual void EnsureInspectionExecutionAllows(string newDamageStatus, bool hasPhotoDocumentation)
        {
            var currentStatus = string.IsNullOrWhiteSpace(DamageStatus) ? "new" : DamageStatus.Trim().ToLowerInvariant();
            if (currentStatus != "new" && currentStatus != "inspection_pending") return;

            var statusesAfterInspection = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "inspected", "estimate_preparing", "estimate_sent", "approval_pending", "accepted",
                "parts_pending", "repair", "paint_shop", "quality_control", "ready_for_pickup",
                "released", "settled"
            };
            if (!statusesAfterInspection.Contains(newDamageStatus ?? string.Empty)) return;

            var blockers = GetInspectionExecutionBlockers(hasPhotoDocumentation);
            if (blockers.Count > 0)
            {
                throw new UserException($"Nie można zakończyć oględzin. Brakuje: {string.Join(", ", blockers)}.");
            }
        }
         
        public virtual void WithoutVehicle()
        {
            this.Vehicle = null;
        }

       
        public  static Work Start(ISequnceNumberProviderFactory numberProvider, Employee starter,Client client = null,  Vehicle vehicle = null, string notes= null, int? odo = null)
        {
            var number = numberProvider.
                GetNumberProvider<Work>().Next();

            return new Work(number,DateTime.Now,starter,client,vehicle,null,notes,odo); 
        }

        public virtual int Number { get; protected set; }
        public virtual int? Odo { get; protected set; }
        public virtual Employee Starter { get; protected set; }
        public virtual DateTime? CompletedOn { get; protected set; }
        public virtual Employee Completer { get; protected set; } 
        public virtual string Notes { get; protected set; }
        public virtual string ClaimNumber { get; protected set; }
        public virtual string Insurer { get; protected set; }
        public virtual string DamageType { get; protected set; }
        public virtual string DamageStatus { get; protected set; }
        public virtual bool AssignmentOfClaimSigned { get; protected set; }
        public virtual bool ClientPaysVat { get; protected set; }
        public virtual string AudatexEstimateNumber { get; protected set; }
        public virtual string InsurerNotes { get; protected set; }
        public virtual string ClaimHandlerName { get; protected set; }
        public virtual string ClaimHandlerEmail { get; protected set; }
        public virtual string ClaimHandlerPhone { get; protected set; }
        public virtual DateTime? ClaimReportedOn { get; protected set; }
        public virtual DateTime? EstimateSentOn { get; protected set; }
        public virtual DateTime? InsurerDecisionOn { get; protected set; }
        public virtual DateTime? SupplementPaidOn { get; protected set; }
        public virtual string EstimateSystem { get; protected set; }
        public virtual string EstimateVersion { get; protected set; }
        public virtual DateTime? EstimatePreparedOn { get; protected set; }
        public virtual decimal? EstimateNetAmount { get; protected set; }
        public virtual decimal? EstimateVatAmount { get; protected set; }
        public virtual decimal? EstimateGrossAmount { get; protected set; }
        public virtual decimal? EstimateLaborMechanicalRbg { get; protected set; }
        public virtual decimal? EstimateLaborPaintRbg { get; protected set; }
        public virtual string EstimateStatus { get; protected set; }
        public virtual DateTime? EstimateAcceptedOn { get; protected set; }
        public virtual string EstimateNotes { get; protected set; }
        public virtual Guid? EstimateDocumentId { get; protected set; }
        public virtual DateTime? AssignmentOfClaimSignedOn { get; protected set; }
        public virtual bool PowerOfAttorneySigned { get; protected set; }
        public virtual DateTime? PowerOfAttorneySignedOn { get; protected set; }
        public virtual int? ClientVatPercent { get; protected set; }
        public virtual decimal? ClientVatAmount { get; protected set; }
        public virtual decimal? UnderpaymentAmount { get; protected set; }
        public virtual string SettlementStatus { get; protected set; }
        public virtual DateTime? PaymentDemandOn { get; protected set; }
        public virtual DateTime? PaymentReceivedOn { get; protected set; }
        public virtual string SettlementNotes { get; protected set; }
        public virtual decimal? InvoiceNetAmount { get; protected set; }
        public virtual decimal? InvoiceVatAmount { get; protected set; }
        public virtual decimal? InvoiceGrossAmount { get; protected set; }
        public virtual decimal? InsurerPaidAmount { get; protected set; }
        public virtual decimal? ClientSurchargeAmount { get; protected set; }
        public virtual DateTime? PaymentDueOn { get; protected set; }
        public virtual DateTime? InvoicePaymentOn { get; protected set; }
        public virtual string InvoicePaymentStatus { get; protected set; }
        public virtual string ExternalInvoiceId { get; protected set; }
        public virtual string ExternalInvoiceNumber { get; protected set; }
        public virtual string InvoiceSourceSystem { get; protected set; }
        public virtual DateTime? PlannedIntakeOn { get; protected set; }
        public virtual DateTime? PlannedReleaseOn { get; protected set; }
        public virtual DateTime? PlannedInspectionOn { get; protected set; }
        public virtual string InspectionMode { get; protected set; }
        public virtual string InspectionVisitorName { get; protected set; }
        public virtual string InspectionContactPhone { get; protected set; }
        public virtual string InspectionRemoteEmail { get; protected set; }
        public virtual bool PowerOfAttorneyPrepared { get; protected set; }
        public virtual bool PowerOfAttorneySent { get; protected set; }
        public virtual bool VehiclePhotosReceived { get; protected set; }
        public virtual bool DamagePhotosReceived { get; protected set; }
        public virtual bool RegistrationDocumentPhotoReceived { get; protected set; }
        public virtual bool DrivingLicencePhotoReceived { get; protected set; }
        public virtual bool IncidentStatementReceived { get; protected set; }
        public virtual bool ResponsiblePartyDataReceived { get; protected set; }
        public virtual bool PolicyNumberReceived { get; protected set; }
        public virtual DateTime? InspectionPerformedOn { get; protected set; }
        public virtual bool InspectionVinVerified { get; protected set; }
        public virtual bool InspectionDamageScopeConfirmed { get; protected set; }
        public virtual bool InspectionVehiclePhotosComplete { get; protected set; }
        public virtual bool InspectionDamagePhotosComplete { get; protected set; }
        public virtual bool InspectionVinPhotoComplete { get; protected set; }
        public virtual string InspectionNotes { get; protected set; }
        public virtual DateTime StartedOn { get; protected set; }

        public virtual DateTime ChangedOn { get; protected set; } //todo protected and user id too?

        public  virtual Client Client { get { return client; } } 
        public  virtual Vehicle Vehicle { get; protected set; }
        public  virtual Invoice Invoice { get; protected set; } 
        public  virtual void DoneOn(Vehicle vehicle)
        {
            this.Vehicle = vehicle ?? throw new ArgumentNullException(nameof(vehicle));
        }
        public  virtual void IsForPrivateClient()
        {
            this.client = null;
        }
        public  virtual void IsFor(Client client)
        {
            if (client is null)
            {
                throw new ArgumentNullException(nameof(client));
            }
            this.client = client;
        }
         
        public  virtual Offer CreateOffer(Employee starter,string notes = null)
        {
            var offer = Offer.Create(this, starter,notes);
            this.offers.Add(offer);
            return offer;
        }
        public virtual RepairJob StartRepairJob(Employee starter, string notes = null)
        {
            var job = RepairJob.Create(this, starter, notes);
            this.jobs.Add(job);
            return job;
        }
        
        public virtual void Remove(Offer offer)
        {
            this.offers.Remove(offer);
        }
        public virtual void Remove(RepairJob offer)
        {
            this.jobs.Remove(offer);
        }

        public virtual void DeleteInvoice(ISequnceNumberProviderFactory numberProviderFactory)
        {
            var newNumber = numberProviderFactory.GetNumberProvider<Invoice>().Next();
            if(newNumber!= (this.Invoice.Number+1)) // only the last one can be deleted, invoice order thing, numbers must go in sequence.
            {
                throw new UserException("Cannot delete an invoice, only last invoice can be deleted.");
            }
            this.Invoice = null;
        }

        public virtual void Changed()
        {
            ChangedOn = DateTime.Now;
        }
    }
}
