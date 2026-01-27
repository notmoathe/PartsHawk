'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'

export function Navbar() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    useEffect(() => {
        // Check active session
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user)
            setLoading(false)
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [])

    return (
        <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl">
            <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                <Link href="/" className="text-2xl font-black tracking-tighter uppercase italic">
                    Trace<span className="text-red-600">Motorsports</span>
                </Link>
                <div className="flex items-center gap-4">
                    <Link href={user ? "/dashboard" : "/login"}>
                        <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-white/5">
                            {loading ? '...' : (user ? "Dashboard" : "Log In")}
                        </Button>
                    </Link>
                    <Link href={user ? "/dashboard" : "/login"}>
                        <Button className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wide skew-x-[-10deg]">
                            <span className="skew-x-[10deg]">
                                {loading ? '...' : (user ? "Open Command Center" : "Get Access")}
                            </span>
                        </Button>
                    </Link>
                </div>
            </div>
        </nav>
    )
}
