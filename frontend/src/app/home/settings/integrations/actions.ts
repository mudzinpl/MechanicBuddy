'use server'

import { httpPost, httpPut } from "@/_lib/server/query-api";
import { pushToast } from "@/_lib/server/pushToast";
import { redirect } from "next/navigation";

export async function saveIntegrationConfiguration(formData: FormData) {
    const integrationType = formData.get('integrationType')?.toString() ?? '';
    const body = {
        displayName: formData.get('displayName')?.toString(),
        description: formData.get('description')?.toString(),
        baseUrl: formData.get('baseUrl')?.toString(),
        secretPlaceholder: formData.get('secretPlaceholder')?.toString(),
        loginEmail: formData.get('loginEmail')?.toString(),
        status: formData.get('status')?.toString(),
        enabled: formData.get('enabled') === 'on',
        notes: formData.get('notes')?.toString(),
    };

    const response = await httpPut({ url: `integrations/${integrationType}`, body });
    await response.text();

    pushToast('Konfiguracja integracji została zapisana.');
    redirect('/home/settings/integrations');
}

export async function testIntegrationConnection(formData: FormData) {
    const integrationType = formData.get('integrationType')?.toString() ?? '';
    const response = await httpPost({ url: `integrations/${integrationType}/test`, body: {} });
    const result = await response.json() as { message?: string };

    pushToast(result.message ?? 'Test połączenia nie jest jeszcze zaimplementowany');
    redirect('/home/settings/integrations');
}
