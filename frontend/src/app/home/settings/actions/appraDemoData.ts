'use server'

import { httpGet, httpPost } from '@/_lib/server/query-api';
import { pushToast } from '@/_lib/server/pushToast';
import { redirect } from 'next/navigation';

export interface AppraDemoDataStatus {
  allowed: boolean;
  exists: boolean;
  workCount: number;
  message: string;
}

export async function getAppraDemoDataStatus(): Promise<AppraDemoDataStatus | null> {
  try {
    const response = await httpGet('demo/appra-data');
    return await response.json() as AppraDemoDataStatus;
  } catch {
    return null;
  }
}

export async function createAppraDemoData(formData: FormData) {
  const reset = formData.get('reset') === 'true';
  const response = await httpPost({
    url: 'demo/appra-data',
    body: { reset },
  });
  const result = await response.json() as { message?: string; workCount?: number };

  pushToast(result.message || 'Operacja danych demonstracyjnych APPRA została wykonana.');
  redirect('/home/settings');
}
