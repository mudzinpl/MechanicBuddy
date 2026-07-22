using System;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace MechanicBuddy.Http.Api.Models
{
    public record SendPricingDto(string EmailAddress, string DisplayName);
    public record PutActivityDto(string Notes, bool IsVehicelLinesOnPricing);
    public class PutProductOrService
    {
        public Guid Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public decimal? Quantity { get; set; }
        public string Unit { get; set; }
        public decimal Price { get; set; }
        public short? Discount { get; set; }
    }
    public record PostOrPutWork(
        Guid? ClientId,
        string Description,
        Guid? VehicleId,
        Guid[] AssignedTo,
        int? Odo,
        bool StartWithOffer,
        string ClaimNumber,
        string Insurer,
        string DamageType,
        string DamageStatus,
        bool AssignmentOfClaimSigned,
        bool ClientPaysVat,
        string AudatexEstimateNumber,
        string InsurerNotes,
        string ClaimHandlerName,
        string ClaimHandlerEmail,
        string ClaimHandlerPhone,
        DateTime? ClaimReportedOn,
        DateTime? EstimateSentOn,
        DateTime? InsurerDecisionOn,
        DateTime? SupplementPaidOn,
        string EstimateSystem,
        string EstimateVersion,
        DateTime? EstimatePreparedOn,
        decimal? EstimateNetAmount,
        decimal? EstimateVatAmount,
        decimal? EstimateGrossAmount,
        decimal? EstimateLaborMechanicalRbg,
        decimal? EstimateLaborPaintRbg,
        string EstimateStatus,
        DateTime? EstimateAcceptedOn,
        string EstimateNotes,
        Guid? EstimateDocumentId,
        DateTime? AssignmentOfClaimSignedOn,
        bool PowerOfAttorneySigned,
        DateTime? PowerOfAttorneySignedOn,
        int? ClientVatPercent,
        decimal? ClientVatAmount,
        decimal? UnderpaymentAmount,
        string SettlementStatus,
        DateTime? PaymentDemandOn,
        DateTime? PaymentReceivedOn,
        string SettlementNotes,
        decimal? InvoiceNetAmount,
        decimal? InvoiceVatAmount,
        decimal? InvoiceGrossAmount,
        decimal? InsurerPaidAmount,
        decimal? ClientSurchargeAmount,
        DateTime? PaymentDueOn,
        DateTime? InvoicePaymentOn,
        string InvoicePaymentStatus,
        string ExternalInvoiceId,
        string ExternalInvoiceNumber,
        string InvoiceSourceSystem,
        DateTime? PlannedIntakeOn,
        DateTime? PlannedReleaseOn,
        DateTime? PlannedInspectionOn,
        bool InspectionPreparationProvided,
        string InspectionMode,
        string InspectionVisitorName,
        string InspectionContactPhone,
        string InspectionRemoteEmail,
        bool? PowerOfAttorneyPrepared,
        bool? PowerOfAttorneySent,
        bool? VehiclePhotosReceived,
        bool? DamagePhotosReceived,
        bool? RegistrationDocumentPhotoReceived,
        bool? DrivingLicencePhotoReceived,
        bool? IncidentStatementReceived,
        bool? ResponsiblePartyDataReceived,
        bool? PolicyNumberReceived);

    public record DashboardTileDto(string Key, int Count);

    public record DashboardWorkItemDto(
        Guid Id,
        string WorkNr,
        string ClientName,
        string RegNr,
        string DamageStatus,
        string Kind,
        DateTime? ScheduledOn);

    
    public record WorkPage(
        Guid id, 
        string WorkNr, 
        DateTime StartedOn,
        DateTime? SentOn,
        string Status,
        string DamageStatus,
        string ClaimNumber,
        string Insurer,
        string DamageType,
        string AudatexEstimateNumber,
        string EstimateStatus,
        DateTime? EstimateSentOn,
        bool AssignmentOfClaimSigned,
        bool PowerOfAttorneySigned,
        bool ClientPaysVat,
        string SettlementStatus,
        string InvoicePaymentStatus,
        decimal? UnderpaymentAmount,
        DateTime? PaymentDueOn,
        string Issued, 
        Guid ClientId, 
        string ClientName, 
        Guid VehicleId, 
        string RegNr, 
        string MechanicNames, 
        string Notes,  
        int DocumentCount,
        bool hasRepairs,
        int numberOfOffers,
        JsonNode OfferIssuance, 
        JsonNode Issuance) 
    {
        public WorkPage() : this(default,default,default,default,default,default,default,default,default,default,default,default,default,default,default,default,default,default,default,default,default,default,default,default,default,default,default,default,default,default,default) { }
    }

}
