'use server'

import { httpPut } from '@/_lib/server/query-api';
import { pushToast } from '@/_lib/server/pushToast';
import { revalidatePath } from 'next/cache';

export interface InspectionPreparationUpdate {
    inspectionMode: string;
    plannedInspectionOn: string | null;
    inspectionVisitorName: string | null;
    inspectionContactPhone: string | null;
    inspectionRemoteEmail: string | null;
    powerOfAttorneyPrepared: boolean;
    powerOfAttorneySent: boolean;
    powerOfAttorneyReceived: boolean;
    vehiclePhotosReceived: boolean;
    damagePhotosReceived: boolean;
    registrationDocumentPhotoReceived: boolean;
    drivingLicencePhotoReceived: boolean;
    incidentStatementReceived: boolean;
    responsiblePartyDataReceived: boolean;
    policyNumberReceived: boolean;
}

export async function updateInspectionPreparation(workId: string, body: InspectionPreparationUpdate) {
    await httpPut({
        url: `work/${workId}/inspection-preparation`,
        body,
    });
    pushToast('Przygotowanie oględzin zostało zapisane.');
    revalidatePath(`/home/work/${workId}`);
}
