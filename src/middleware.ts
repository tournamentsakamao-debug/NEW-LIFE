import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  // getSession() ki jagah getUser() zyada secure hota hai, 
  // par abhi ke liye session hi rehne dete hain errors avoid karne ke liye
  const { data: { session } } = await supabase.auth.getSession();

  const pathname = req.nextUrl.pathname;

  // Redirect if not logged in for dashboard OR admin
  if (!session && (pathname.startsWith('/dashboard') || pathname.startsWith('/admin'))) {
    // Edge runtime par new URL(req.url) ki jagah req.nextUrl.clone() zyada stable hai
    const url = req.nextUrl.clone();
    url.pathname = '/'; 
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
