import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getAuthCookie } from './lib/auth';

export const config = {
  matcher: ['/dashboard/:path*'],
};

export function proxy(req: NextRequest) {
  // Get token from cookies
  const token = getAuthCookie(req);

  // If no token, redirect to login
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  // Verify token
  const payload = verifyToken(token);

  // If invalid token, redirect to login
  if (!payload) {
    const url = req.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  // Token is valid, allow request to proceed
  return NextResponse.next();
}
