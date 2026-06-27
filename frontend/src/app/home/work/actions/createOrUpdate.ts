'use server'

import { httpPut,httpPost } from "@/_lib/server/query-api";
import {  pushToast } from "@/_lib/server/pushToast";
import { redirect } from "next/navigation"; 

export async function createOrUpdate(
    formData: FormData
    ) {
      
     
    const id = formData.get('id');
    const optionalNumber = (name: string) => {
       const value = formData.get(name)?.toString();
       return value ? Number(value) : null;
    };
    const optionalText = (name: string) => {
       const value = formData.get(name)?.toString().trim();
       return value ? value : null;
    };
    const splitFullName = (fullName: string | null) => {
       const parts = (fullName ?? '').trim().split(/\s+/).filter(Boolean);
       if (parts.length === 0) return { firstName: '', lastName: '' };
       if (parts.length === 1) return { firstName: parts[0], lastName: '' };
       return { firstName: parts.slice(0, -1).join(' '), lastName: parts[parts.length - 1] };
    };

    const createNewClient = !id && formData.get('createNewClient') == 'on';
    const createNewVehicle = !id && formData.get('createNewVehicle') == 'on';
    let clientId: FormDataEntryValue | string | null = formData.get('clientId[value]');

    if (createNewClient) {
       const clientType = formData.get('newClientType')?.toString() || 'private';
       const email = optionalText('newClientEmail');
       const fullName = optionalText('newClientName');
       const { firstName, lastName } = splitFullName(fullName);
       const clientBody = {
          name: fullName,
          regNr: optionalText('newClientRegNr'),
          firstName,
          lastName,
          emailAddresses: email ? [email] : [],
          currentEmail: email,
          phone: optionalText('newClientPhone'),
          address: {
             street: optionalText('newClientAddress'),
             country: null,
             region: null,
             city: null,
             postalCode: null,
          },
          description: null,
          isAsshole: false,
          personalCode: null,
          introducedAt: new Date(),
       };
       const clientResponse = await httpPost({ url: clientType === 'company' ? 'legalclients' : 'privateclients', body: clientBody });
       clientId = await clientResponse.json();
    }

    // When 'onlyClientVehicles' switch is ON, user is searching all vehicles (VehiclesCombobox)
    // When OFF, user selects from client's vehicles dropdown (Select)
    let vehicleId: FormDataEntryValue | string | null = formData.get('onlyClientVehicles') == 'on'
        ? formData.get('vehicleId[value]')  // VehiclesCombobox uses hidden input
        : formData.get('vehicleId');         // Select uses direct value

    // Also try the hidden input if direct value is empty (for VehiclesCombobox)
    if (!vehicleId || vehicleId === '') {
        vehicleId = formData.get('vehicleId[value]');
    }

    if (createNewVehicle) {
       const vehicleBody = {
          model: optionalText('newVehicleModel'),
          producer: optionalText('newVehicleProducer'),
          vin: optionalText('newVehicleVin'),
          regNr: optionalText('newVehicleRegNr'),
          odo: optionalNumber('newVehicleOdo') ?? optionalNumber('odo') ?? 0,
          description: null,
          ownerId: clientId == '' ? null : clientId,
          isReplacementVehicle: false
       };
       const vehicleResponse = await httpPost({ url: 'vehicles', body: vehicleBody });
       vehicleId = await vehicleResponse.json();
    }

 //Guid? ClientId, string Description, Guid? VehicleId, Guid[] AssignedTo, int? Odo, bool StartWithOffer
    const body = {
       clientId: clientId == '' ? null : clientId,
       description: formData.get('about'),
       vehicleId: vehicleId == '' ? null : vehicleId ?? null,
       assignedTo: formData.getAll('mechanics'),
       odo: +(formData.get('odo')?.toString() ?? '0'),
       startWithOffer: formData.get('isOffer') == 'on',
       claimNumber: formData.get('claimNumber')?.toString() || null,
       insurer: formData.get('insurer')?.toString() || null,
       damageType: formData.get('damageType')?.toString() || null,
       damageStatus: formData.get('damageStatus')?.toString() || null,
       assignmentOfClaimSigned: formData.get('assignmentOfClaimSigned') == 'on',
       assignmentOfClaimSignedOn: formData.get('assignmentOfClaimSignedOn')?.toString() || null,
       powerOfAttorneySigned: formData.get('powerOfAttorneySigned') == 'on',
       powerOfAttorneySignedOn: formData.get('powerOfAttorneySignedOn')?.toString() || null,
       clientPaysVat: formData.get('clientPaysVat') == 'on',
       clientVatPercent: optionalNumber('clientVatPercent'),
       clientVatAmount: optionalNumber('clientVatAmount'),
       underpaymentAmount: optionalNumber('underpaymentAmount'),
       settlementStatus: formData.get('settlementStatus')?.toString() || 'unsettled',
       paymentDemandOn: formData.get('paymentDemandOn')?.toString() || null,
       paymentReceivedOn: formData.get('paymentReceivedOn')?.toString() || null,
       settlementNotes: formData.get('settlementNotes')?.toString() || null,
       audatexEstimateNumber: formData.get('audatexEstimateNumber')?.toString() || null,
       insurerNotes: formData.get('insurerNotes')?.toString() || null,
       claimHandlerName: formData.get('claimHandlerName')?.toString() || null,
       claimHandlerEmail: formData.get('claimHandlerEmail')?.toString() || null,
       claimHandlerPhone: formData.get('claimHandlerPhone')?.toString() || null,
       claimReportedOn: formData.get('claimReportedOn')?.toString() || null,
       estimateSentOn: formData.get('estimateSentOn')?.toString() || null,
       insurerDecisionOn: formData.get('insurerDecisionOn')?.toString() || null,
       supplementPaidOn: formData.get('supplementPaidOn')?.toString() || null,
       estimateSystem: formData.get('estimateSystem')?.toString() || null,
       estimateVersion: formData.get('estimateVersion')?.toString() || null,
       estimatePreparedOn: formData.get('estimatePreparedOn')?.toString() || null,
       estimateNetAmount: optionalNumber('estimateNetAmount'),
       estimateVatAmount: optionalNumber('estimateVatAmount'),
       estimateGrossAmount: optionalNumber('estimateGrossAmount'),
       estimateLaborMechanicalRbg: optionalNumber('estimateLaborMechanicalRbg'),
       estimateLaborPaintRbg: optionalNumber('estimateLaborPaintRbg'),
       estimateStatus: formData.get('estimateStatus')?.toString() || null,
       estimateAcceptedOn: formData.get('estimateAcceptedOn')?.toString() || null,
       estimateNotes: formData.get('estimateNotes')?.toString() || null,
       estimateDocumentId: formData.get('estimateDocumentId')?.toString() || null,
       plannedIntakeOn: formData.get('plannedIntakeOn')?.toString() || null,
       plannedReleaseOn: formData.get('plannedReleaseOn')?.toString() || null,
       plannedInspectionOn: formData.get('plannedInspectionOn')?.toString() || null
    }; 
    const url = "work"; 
    
    const isUpdating = !!id;
    
    const response = isUpdating?await httpPut({url:url+'/'+id,body}) : await httpPost({url,body});

    const jsonResponse = await response.json();
       
    pushToast(isUpdating ? 'Zlecenie zostało zaktualizowane.' : 'Zlecenie zostało zapisane.')

    if(id)
        redirect(`/home/work/${jsonResponse}`) 

    if(isUpdating){
        redirect(`/home/work/${jsonResponse.workId}/${jsonResponse.activityId}`) 
    }
    redirect(`/home/work/${jsonResponse.workId}/${jsonResponse.activityId}/edit/startfresh`) 
    
}

