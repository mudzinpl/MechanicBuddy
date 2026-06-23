import { getJwt } from '@/_lib/server/session';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:15567';

export async function POST(request: NextRequest) {
  const redirectUrl = new URL('/home/settings', request.url);

  try {
    const formData = await request.formData();
    const reset = formData.get('reset') === 'true';
    const jwt = await getJwt();

    if (!jwt) {
      return redirectWithToast(redirectUrl, 'Sesja wygasła. Zaloguj się ponownie i spróbuj utworzyć dane demonstracyjne APPRA.', true);
    }

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${jwt}`,
      'Content-Type': 'application/json',
    };

    const tenantId = getTenantIdFromHost(request.nextUrl.hostname);
    if (tenantId) {
      headers['X-Tenant-ID'] = tenantId;
    }

    const response = await fetch(`${API_URL}/api/demo/appra-data`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ reset }),
    });

    const responseText = await response.text();
    const result = parseJson(responseText) as { message?: string; workCount?: number } | null;

    if (!response.ok) {
      return redirectWithToast(
        redirectUrl,
        result?.message || responseText || 'Nie udało się utworzyć danych demonstracyjnych APPRA.',
        true,
      );
    }

    return redirectWithToast(
      redirectUrl,
      result?.message || 'Dane demonstracyjne APPRA zostały utworzone.',
      false,
    );
  } catch (error) {
    console.error('APPRA demo data generation failed:', error);
    return redirectWithToast(redirectUrl, 'Nie udało się uruchomić generatora danych demonstracyjnych APPRA.', true);
  }
}

function getTenantIdFromHost(host: string): string | null {
  const parts = host.split('.');
  if (parts.length < 2) return null;

  const tenantId = parts[0];
  if (!tenantId || tenantId === 'www' || tenantId === 'api' || tenantId === 'localhost') {
    return null;
  }

  return tenantId;
}

function parseJson(value: string): unknown | null {
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function redirectWithToast(url: URL, message: string, isError: boolean) {
  const response = NextResponse.redirect(url);
  response.cookies.set('toast', JSON.stringify({ message, isError }), {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(Date.now() + 30 * 1000),
    sameSite: 'lax',
    path: '/',
  });

  return response;
}
