import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // 1. Session check
  const { data: { session } } = await supabase.auth.getSession()

  // 2. System Settings load karo (Maintenance check ke liye)
  const { data: settings } = await supabase
    .from('system_settings')
    .select('maintenance_mode')
    .eq('id', '1')
    .single()

  // 3. User Profile load karo (Role aur Ban status ke liye)
  let profile = null
  if (session) {
    const { data } = await supabase
      .from('profiles')
      .select('role, is_banned')
      .eq('id', session.user.id)
      .single()
    profile = data
  }

  const isAdmin = profile?.role === 'admin'
  const isMaintenance = settings?.maintenance_mode

  // --- LOGIC 1: BANNED USER CHECK ---
  if (profile?.is_banned && !req.nextUrl.pathname.startsWith('/banned')) {
    return NextResponse.redirect(new URL('/banned', req.url))
  }

  // --- LOGIC 2: ADMIN PANEL PROTECTION ---
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session || !isAdmin) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  // --- LOGIC 3: MAINTENANCE BYPASS (Important!) ---
  // Agar maintenance ON hai, user ADMIN nahi hai, aur wo login/admin page par nahi hai
  const isAuthPage = req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/register')
  const isAdminPage = req.nextUrl.pathname.startsWith('/admin')
  
  if (isMaintenance && !isAdmin && !isAuthPage && !isAdminPage && req.nextUrl.pathname !== '/maintenance') {
    return NextResponse.redirect(new URL('/maintenance', req.url))
  }

  return res
}

export const config = {
  matcher: [
    '/admin/:path*', 
    '/wallet/:path*', 
    '/profile/:path*', 
    '/tournaments/:path*',
    '/' // Root page par bhi maintenance check chalega
  ],
}
