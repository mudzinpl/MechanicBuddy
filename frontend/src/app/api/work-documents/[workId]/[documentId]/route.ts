import { getJwt } from '@/_lib/server/session';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:15567';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workId: string; documentId: string }> },
) {
  const { workId, documentId } = await params;
  const download = request.nextUrl.searchParams.get('download') === '1';
  const headers = new Headers({ Authorization: `Bearer ${await getJwt()}` });

  const hostName = request.headers.get('host')?.split(':')[0];
  const hostParts = hostName?.split('.') || [];
  const tenantId = hostParts.length >= 2 ? hostParts[0] : null;
  if (tenantId && !['www', 'api', 'localhost'].includes(tenantId)) {
    headers.set('X-Tenant-ID', tenantId);
  }

  const response = await fetch(
    `${API_URL}/api/work/${workId}/documents/${documentId}/content?download=${download}`,
    { headers, cache: 'no-store' },
  );

  if (!response.ok) {
    return NextResponse.json(
      { error: 'Nie udało się pobrać dokumentu.' },
      { status: response.status },
    );
  }

  const responseHeaders = new Headers();
  ['content-type', 'content-disposition', 'content-length', 'accept-ranges'].forEach(name => {
    const value = response.headers.get(name);
    if (value) responseHeaders.set(name, value);
  });

  return new NextResponse(await response.arrayBuffer(), { headers: responseHeaders });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ workId: string; documentId: string }> },
) {
  const { workId, documentId } = await params;
  const headers = new Headers({ Authorization: `Bearer ${await getJwt()}` });
  const hostName = request.headers.get('host')?.split(':')[0];
  const hostParts = hostName?.split('.') || [];
  const tenantId = hostParts.length >= 2 ? hostParts[0] : null;
  if (tenantId && !['www', 'api', 'localhost'].includes(tenantId)) {
    headers.set('X-Tenant-ID', tenantId);
  }

  const response = await fetch(
    `${API_URL}/api/work/${workId}/documents/${documentId}`,
    { method: 'DELETE', headers },
  );

  return new NextResponse(null, { status: response.status });
}
