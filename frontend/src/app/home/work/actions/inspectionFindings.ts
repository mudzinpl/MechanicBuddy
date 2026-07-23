'use server'

import { httpDelete, httpPost, httpPut } from '@/_lib/server/query-api';
import { pushToast } from '@/_lib/server/pushToast';
import { revalidatePath } from 'next/cache';

export interface InspectionFindingUpdate {
    elementName: string;
    vehicleSide: string;
    damageType: string;
    recommendedAction: string;
    notes: string | null;
}

export async function addInspectionFinding(workId: string, body: InspectionFindingUpdate) {
    await httpPost({ url: `work/${workId}/inspection-findings`, body });
    pushToast('Uszkodzenie zostało dodane.');
    revalidatePath(`/home/work/${workId}`);
}

export async function updateInspectionFinding(workId: string, findingId: string, body: InspectionFindingUpdate) {
    await httpPut({ url: `work/${workId}/inspection-findings/${findingId}`, body });
    pushToast('Ustalenie zostało zaktualizowane.');
    revalidatePath(`/home/work/${workId}`);
}

export async function deleteInspectionFinding(workId: string, findingId: string) {
    await httpDelete({ url: `work/${workId}/inspection-findings/${findingId}` });
    pushToast('Uszkodzenie zostało usunięte.');
    revalidatePath(`/home/work/${workId}`);
}
