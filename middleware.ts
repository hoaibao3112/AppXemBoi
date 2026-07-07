import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is missing');
}
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

const PROTECTED_PATHS = ['/api/tarot', '/api/user'];

export async function middleware(req: NextRequest) {
  const isProtected = PROTECTED_PATHS.some(p => req.nextUrl.pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized. Token required.' }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.id;
    if (typeof userId !== 'string') {
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 401 });
    }
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id', userId);
    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }
}

export const config = {
  matcher: ['/api/tarot/:path*', '/api/user/:path*'],
};

