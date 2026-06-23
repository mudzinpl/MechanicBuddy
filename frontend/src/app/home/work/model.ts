export interface IWorkData extends IActivity{ 
    id:              string;
   // number:          string;
   // starterName:     string;
    clientId:        string;
    clientName:      string;
    clientAddress:   string;
    clientEmail:     string;
    clientPhone:     string;
    vehicleId:       string;
    vehicleProducer: string;
    vehicleModel:    string;
    vehicleVin:      string;
    vehicleRegNr:    string;
    notes:           string;
    odo:             number;
    claimNumber:     string;
    insurer:         string;
    damageType:      string;
    damageStatus:    string;
    assignmentOfClaimSigned: boolean;
    assignmentOfClaimSignedOn: string;
    powerOfAttorneySigned: boolean;
    powerOfAttorneySignedOn: string;
    clientPaysVat:   boolean;
    clientVatPercent: number | null;
    clientVatAmount: number | null;
    underpaymentAmount: number | null;
    settlementStatus: string;
    paymentDemandOn: string;
    paymentReceivedOn: string;
    settlementNotes: string;
    audatexEstimateNumber: string;
    insurerNotes:    string;
    claimHandlerName: string;
    claimHandlerEmail: string;
    claimHandlerPhone: string;
    claimReportedOn: string;
    estimateSentOn: string;
    insurerDecisionOn: string;
    supplementPaidOn: string;
    plannedIntakeOn: string;
    plannedReleaseOn: string;
    plannedInspectionOn: string;
    mechanics:       IMechanic[];
    status:          string;
    issuance:       IWorkIssuance;  
    statusHistory?: IWorkStatusHistory[];
    replacementVehicle?: IWorkReplacementVehicle | null;
    
}

export interface IWorkReplacementVehicle {
    id: string;
    workId: string;
    replacementVehicleId: string;
    replacementVehicleName: string;
    issuedOn: string | null;
    plannedReturnOn: string | null;
    returnedOn: string | null;
    mileageOut: number | null;
    mileageIn: number | null;
    fuelOut: string | null;
    fuelIn: string | null;
    conditionOut: string | null;
    conditionIn: string | null;
    notes: string | null;
    status: string;
    createdOn: string;
    changedOn: string;
}

export interface IWorkStatusHistory {
    id: string;
    workId: string;
    oldStatus: string;
    newStatus: string;
    comment: string | null;
    changedByEmployeeId: string | null;
    changedByName: string | null;
    changedOn: string;
}

export interface IWorkDocument {
    id: string;
    category: string;
    fileName: string;
    contentType: string;
    fileSize: number;
    uploadedOn: string;
    uploadedByName: string;
}

export const damageStatuses = [
  { value: 'new', label: 'Nowe zgłoszenie' },
  { value: 'inspection_pending', label: 'Oczekuje na oględziny' },
  { value: 'inspected', label: 'Oględziny wykonane' },
  { value: 'estimate_preparing', label: 'Kosztorys w przygotowaniu' },
  { value: 'estimate_sent', label: 'Kosztorys wysłany do ubezpieczyciela' },
  { value: 'approval_pending', label: 'Oczekuje na akceptację' },
  { value: 'accepted', label: 'Zaakceptowane' },
  { value: 'parts_pending', label: 'Czeka na części' },
  { value: 'repair', label: 'W naprawie' },
  { value: 'paint_shop', label: 'Lakiernia' },
  { value: 'quality_control', label: 'Kontrola jakości' },
  { value: 'ready_for_pickup', label: 'Gotowe do odbioru' },
  { value: 'released', label: 'Wydane' },
  { value: 'settled', label: 'Rozliczone' },
  { value: 'on_hold', label: 'Wstrzymane' },
  { value: 'rejected', label: 'Odmowa / brak akceptacji' },
] as const;

export const insurers = [
  'PZU',
  'Warta',
  'ERGO Hestia',
  'UNIQA',
  'InterRisk',
  'Compensa',
  'Allianz',
  'Generali',
  'Link4',
  'Trasti',
  'Wiener',
  'HDI',
  'Inny',
] as const;

export const damageTypes = [
  'OC',
  'AC',
  'Gotówka',
  'Flota',
  'Assistance',
] as const;

export const settlementStatuses = [
  { value: 'unsettled', label: 'Nierozliczone' },
  { value: 'partially_settled', label: 'Częściowo rozliczone' },
  { value: 'settled', label: 'Rozliczone' },
] as const;

export function getDamageStatusLabel(status?: string | null): string {
  if (!status) return '';

  return damageStatuses.find(item =>
    item.value === status || item.label.toLocaleLowerCase('pl') === status.toLocaleLowerCase('pl')
  )?.label ?? status;
}

export function getSettlementStatusLabel(status?: string | null): string {
  if (!status) return 'Nierozliczone';

  return settlementStatuses.find(item => item.value === status)?.label ?? status;
}

export interface ICurrentActivity{
    id:        string;
    notes:     string;
    isVehicleLinesOnPricing: boolean;
    products: IProduct[];
    priceSummary: IPriceSummary
}

export interface IActivity{
    id:        string;
    number:    string;
    startedOn: Date;
    startedBy: string;
    name:      string;
    isEmpty: boolean;
}

export interface IWorkIssuance extends IIssuance{
    invoiceNumber: number;
     dueDays: number;
     isPaid:boolean;
}

export interface IOfferIssuance extends IIssuance{
    id: string,
    number: string,
    acceptedOn?: Date;
    acceptedBy?: string;
}

export interface IIssuance{
  
    sentOn?: Date;
    issuedOn: Date;
    issuedBy: string; 
    receiverEmail?: string 

}
export interface IActivities
{ 
    items: IActivity[]
    current: ICurrentActivity
}

export interface IPriceSummary{
    totalWithVat: number,
    totalWithoutVat:number
}

export interface IInvoice {
    isIssued: boolean;
}

export interface IStatus {
    startedOn:     Date;
    invoiceIssued: boolean;
    offers:        IOffer[];
}

export interface IOffer {
    number:   string;
    isIssued: boolean;
}

export interface IProduct
{
    id:       string;
    name:     string;
    quantity: number | null;
    unit:     string;
    price:    number| null;
    discount: number| null;
    code:     string;
    
}
export interface IMechanic{
    id: string,
    name: string,
}

export interface IActivityNames{
    [key: string]: string
    offer: string,
    repairjob: string,
  }
  export interface IStatusNames{
    [key: string]: string
    closed: string,
    inprogress: string,
    completed: string,
  }
 export const activityNames = {
    offer: 'Oferta',
    repairjob:'Zlecenie naprawy' 
  } as IActivityNames

  export const statusNames = {
    closed: 'Zamknięte',
    inprogress:'W toku',
    completed:'Zakończone'
  } as IStatusNames
    
  export interface IPaymentNames{
    [key: string]: string
  }

  export const paymentTypes ={ 
    cash:'Gotówka',
    banktransfer:'Przelew bankowy',
    cardpayment:'Płatność kartą'
  } as IPaymentNames
