import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Session check karo
  const { data: { session } } = await supabase.auth.getSession()

  // Agar user /admin par jane ki koshish kare
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      // Login nahi hai toh login page par bhejo
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Database se user ka role check karo (Security Layer)
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single()

    if (!profile?.is_admin) {
      // Admin nahi hai toh home par fek do
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // Maintenance Mode Logic (Optional)
  // Agar aapne DB mein maintenance ON kiya hai toh yahan se block kar sakte hain

  return res
}

// Sirf in paths par middleware chalega
export const config = {
  matcher: ['/admin/:path*', '/wallet/:path*', '/profile/:path*'],
}

