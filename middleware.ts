import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })

    const {
        data: { session },
    } = await supabase.auth.getSession()

    // Protect dashboard route
    if (req.nextUrl.pathname.startsWith('/dashboard')) {
        if (!session) {
            return NextResponse.redirect(new URL('/login', req.url))
        }
    }

    // Redirect logged in users away from login
    if (req.nextUrl.pathname.startsWith('/login')) {
        if (session) {
            return NextResponse.redirect(new URL('/dashboard', req.url))
        }
    }

    return res
}

export const config = {
    matcher: ['/dashboard/:path*', '/login'],
}
