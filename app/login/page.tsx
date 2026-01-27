'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase-client'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [message, setMessage] = useState<string | null>(null)
    const [isSignUp, setIsSignUp] = useState(false)

    const supabase = createClient()

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setMessage(null)

        if (isSignUp) {
            const { error } = await supabase.auth.signUp({ email, password })
            if (error) {
                setError(error.message)
            } else {
                setMessage('Check your email for the confirmation link!')
            }
        } else {
            const { error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) {
                setError(error.message)
            } else {
                window.location.href = '/dashboard'
            }
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
            {/* Ambient background */}
            <div className="absolute top-[-50%] left-[-20%] w-[80%] h-[80%] bg-red-900/10 blur-[150px] rounded-full pointer-events-none"></div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="text-center mb-10">
                    <Link href="/" className="text-3xl font-black tracking-tighter text-white uppercase italic">
                        Trace<span className="text-red-600">Motorsports</span>
                    </Link>
                    <p className="text-zinc-500 mt-2 font-medium tracking-wide uppercase text-xs">
                        {isSignUp ? 'Join the Team' : 'Member Access'}
                    </p>
                </div>

                {/* Card */}
                <div className="bg-zinc-950 border border-zinc-800 p-8 shadow-2xl">
                    <form onSubmit={handleAuth} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-zinc-300 font-bold uppercase text-xs tracking-wider">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="RACER@EXAMPLE.COM"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-black border-zinc-800 text-white placeholder:text-zinc-700 ring-offset-black focus-visible:ring-red-600 h-12 uppercase"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-zinc-300 font-bold uppercase text-xs tracking-wider">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-black border-zinc-800 text-white placeholder:text-zinc-700 ring-offset-black focus-visible:ring-red-600 h-12"
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-950/30 border border-red-900/50 text-red-500 text-xs font-bold uppercase">
                                {error}
                            </div>
                        )}

                        {message && (
                            <div className="p-3 bg-green-950/30 border border-green-900/50 text-green-500 text-xs font-bold uppercase">
                                {message}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-black h-12 text-sm uppercase tracking-widest rounded-none"
                            disabled={loading}
                        >
                            {loading ? 'PROCESSING...' : isSignUp ? 'CREATE ACCOUNT' : 'ENTER PADDOCK'}
                        </Button>
                    </form>

                    <div className="mt-8 text-center pt-6 border-t border-zinc-900">
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
                        >
                            {isSignUp ? 'Already have an account? Log In' : "No account? Apply for Access"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
