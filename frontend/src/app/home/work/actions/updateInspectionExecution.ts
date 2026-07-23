'use server'

import { httpPut } from '@/_lib/server/query-api';
import { pushToast } from '@/_lib/server/pushToast';
import { revalidatePath } from 'next/cache';

export interface InspectionExecutionUpdate {
    inspectionPerformedOn: string | null;
    odo: number | null;
    inspectionVinVerified: boolean;
    inspectionDamageScopeConfirmed: boolean;
    inspectionVehiclePhotosComplete: boolean;
    inspectionDamagePhotosComplete: boolean;
    inspectionVinPhotoComplete: boolean;
    inspectionNotes: string | null;
}

export async function updateInspectionExecution(workId: string, body: InspectionExecutionUpdate) {
    await httpPut({
        url: `work/${workId}/inspection-execution`,
        body,
    });
    pushToast('Oględziny zostały zapisane.');
    revalidatePath(`/home/work/${workId}`);
}
