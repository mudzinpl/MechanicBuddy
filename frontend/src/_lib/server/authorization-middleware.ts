
import { NextResponse, NextRequest } from 'next/server'
import { deleteSession, getJwt, getMustChangePassword } from '@/_lib/server/session'

const protectedRoutePrefixes = [
  '/home',
  '/dashboard',
  '/sprawy',
  '/klienci',
  '/pojazdy',
  '/magazyn',
  '/ustawienia',
  '/print',
  '/backend-api',
  '/api',
]

export default async function authorizationMiddleware(request: NextRequest,response: NextResponse) {

   // 2. Check if the current route is protected or public
   const path = request.nextUrl.pathname
   const isProtectedRoute = protectedRoutePrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
   const isApiRoute = path.startsWith('/api') || path.startsWith('/backend-api');
   const isChangePasswordRoute = path === '/auth/change-password';
    // 3. Decrypt the session from the cookie

   // logout if /home/logout is called and redirect to login page
  if (path.includes("/home/logout")) {
    await deleteSession();
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  const jwt = await getJwt();
  // 4. Redirect to /login if the user is not authenticated
  if (isProtectedRoute && !jwt) {
    if (isApiRoute) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/auth/login', request.nextUrl))
  }

  // Check if user must change password
  const mustChangePassword = await getMustChangePassword();

  // If user must change password and is not on the change password page
  if (jwt && mustChangePassword && !isChangePasswordRoute) {
    return NextResponse.redirect(new URL('/auth/change-password', request.nextUrl))
  }

  // If user doesn't need to change password but is on the change password page, redirect to dashboard
  if (jwt && !mustChangePassword && isChangePasswordRoute) {
    return NextResponse.redirect(new URL('/home', request.nextUrl))
  }

  // 5. Redirect authenticated users away from the login page.
  const isAuthRoute = path.startsWith('/auth/login');
  if (isAuthRoute && jwt && !mustChangePassword) {
    return NextResponse.redirect(new URL('/home', request.nextUrl))
  }

  return response
}
 
