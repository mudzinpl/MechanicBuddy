'use server'

import { httpDelete, httpPost } from "@/_lib/server/query-api";
import { pushToast } from "@/_lib/server/pushToast";
import { revalidatePath } from "next/cache";

export async function addCommunicationEntry(formData: FormData) {
    const workId = formData.get('workId')?.toString() ?? '';
    const occurredOnValue = formData.get('occurredOn')?.toString();
    const documentId = formData.get('documentId')?.toString();

    const body = {
        category: formData.get('category')?.toString(),
        subject: formData.get('subject')?.toString(),
        note: formData.get('note')?.toString(),
        status: formData.get('status')?.toString() || 'information',
        documentId: documentId || null,
        occurredOn: occurredOnValue ? new Date(occurredOnValue).toISOString() : null,
    };

    const response = await httpPost({ url: `work/${workId}/communication`, body });
    await response.text();

    pushToast('Wpis komunikacji został dodany.');
    revalidatePath(`/home/work/${workId}`);
}

export async function deleteCommunicationEntry(workId: string, entryId: string) {
    await httpDelete({ url: `work/${workId}/communication/${entryId}` });
    pushToast('Wpis komunikacji został usunięty.');
    revalidatePath(`/home/work/${workId}`);
}
