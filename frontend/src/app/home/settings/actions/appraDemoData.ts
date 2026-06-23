'use server'

import { getJwt } from '@/_lib/server/session';
import { headers } from 'next/headers';
import { pushToast } from '@/_lib/server/pushToast';
import { redirect } from 'next/navigation';

const API_URL = process.env.API_URL || 'http://localhost:15567';

export interface AppraDemoDataStatus {
  allowed: boolean;
  exists: boolean;
  workCount: number;
  message: string;
}

export async function getAppraDemoDataStatus(): Promise<AppraDemoDataStatus | null> {
  try {
    const jwt = await getJwt();
    if (typeof jwt !== 'string' || !jwt) return null;

    const response = await fetch(`${API_URL}/api/demo/appra-data`, {
      method: 'GET',
      headers: await createDemoApiHeaders(jwt),
    });

    if (!response.ok) return null;
    return await response.json() as AppraDemoDataStatus;
  } catch {
    return null;
  }
}

export async function createAppraDemoData(formData: FormData) {
  const reset = formData.get('reset') === 'true';
  const jwt = await getJwt();

  if (typeof jwt !== 'string' || !jwt) {
    pushToast('Sesja wygasła. Zaloguj się ponownie i spróbuj utworzyć dane demonstracyjne APPRA.', true);
    redirect('/home/settings');
  }

  const response = await fetch(`${API_URL}/api/demo/appra-data`, {
    method: 'POST',
    headers: await createDemoApiHeaders(jwt),
    body: JSON.stringify({ reset }),
  });

  const responseText = await response.text();
  const result = parseJson(responseText) as { message?: string; workCount?: number } | null;

  pushToast(
    result?.message || responseText || 'Operacja danych demonstracyjnych APPRA została wykonana.',
    !response.ok,
  );
  redirect('/home/settings');
}

async function createDemoApiHeaders(jwt: string): Promise<Record<string, string>> {
  const requestHeaders = await headers();
  const host = requestHeaders.get('host');
  const apiHeaders: Record<string, string> = {
    'Authorization': `Bearer ${jwt}`,
    'Content-Type': 'application/json',
  };

  if (host) {
    apiHeaders['Host'] = host;
    apiHeaders['X-App-Frontend-Host'] = host;
  }

  return apiHeaders;
}

function parseJson(value: string): unknown | null {
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
