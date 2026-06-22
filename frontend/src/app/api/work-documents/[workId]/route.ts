import { getJwt } from '@/_lib/server/session';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:15567';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workId: string }> },
) {
  const { workId } = await params;
  const headers = new Headers({ Authorization: `Bearer ${await getJwt()}` });
  const hostName = request.headers.get('host')?.split(':')[0];
  const hostParts = hostName?.split('.') || [];
  const tenantId = hostParts.length >= 2 ? hostParts[0] : null;
  if (tenantId && !['www', 'api', 'localhost'].includes(tenantId)) {
    headers.set('X-Tenant-ID', tenantId);
  }

  const response = await fetch(`${API_URL}/api/work/${workId}/documents`, {
    method: 'POST',
    headers,
    body: await request.formData(),
  });

  return new NextResponse(await response.arrayBuffer(), {
    status: response.status,
    headers: { 'Content-Type': response.headers.get('content-type') || 'text/plain; charset=utf-8' },
  });
}
