import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { HawkForm } from '@/components/hawk-form'
import { HawksTable } from '@/components/hawks-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getUserTier, getTierLimits } from '@/lib/subscription'
import { Lock } from 'lucide-react'
import { ForceScanButton } from '@/components/force-scan-button'

import { FoundListings } from '@/components/found-listings'

export const dynamic = 'force-dynamic'
export const revalidate = 0 // Force fresh data on every load

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch Hawks
    const { data: hawks } = await supabase
        .from('hawks')
        .select('*')
        .neq('status', 'archived') // Hide archived/deleted agents
        .order('created_at', { ascending: false })

    // Fetch Recent Finds (Limit 20 for feed)
    const { data: recentFinds } = await supabase
        .from('found_listings')
        .select('*, hawks ( max_price, keywords )')
        .eq('is_dismissed', false) // Hide soft-deleted items
        .order('created_at', { ascending: false })
        .limit(100)

    const activeHawks = hawks?.filter(h => h.status === 'active').length || 0
    const totalFinds = recentFinds?.length || 0

    console.log('[Dashboard Debug] User:', user?.email)
    console.log('[Dashboard Debug] Hawks Found:', hawks?.length)
    console.log('[Dashboard Debug] Recent Finds Found (User Context):', recentFinds?.length)
    if (recentFinds?.length === 0) {
        console.log('[Dashboard Debug] Recent Finds is EMPTY. RLS or Data issue.')
    }

    // Subscription Logic
    const tier = getUserTier(user?.email)
    const limits = getTierLimits(tier)
    const usagePercent = Math.min(100, (activeHawks / limits.maxHawks) * 100)
    const isFree = tier === 'street'

    return (
        <div className="min-h-screen bg-black selection:bg-red-600/30">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/dashboard" className="text-2xl font-black tracking-tighter text-white uppercase italic">
                        Trace<span className="text-red-600">Motorsports</span>
                        {/* Tier Badge */}
                        {tier === 'owner' ? (
                            <span className="ml-2 text-xs font-black italic text-black bg-white px-2 py-0.5 skew-x-[-10deg] inline-block">OWNER</span>
                        ) : tier === 'club' ? (
                            <span className="ml-2 text-xs font-black italic text-white bg-red-600 px-2 py-0.5 skew-x-[-10deg] inline-block">CLUB SPEC</span>
                        ) : (
                            <span className="ml-2 text-xs font-normal not-italic text-zinc-500 tracking-normal border border-zinc-800 px-2 py-0.5 rounded-full">STREET CLASS</span>
                        )}
                    </Link>
                    <div className="flex items-center gap-6">
                        <span className="text-zinc-500 text-xs font-mono hidden md:block uppercase tracking-widest">{user?.email}</span>
                        <form action="/auth/signout" method="post">
                            <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-red-600 hover:border-red-600 border border-zinc-800 rounded-none h-8 text-xs font-bold uppercase tracking-wider transition-all">
                                Sign Out
                            </Button>
                        </form>
                    </div>
                </div>
            </nav>

            <div className="container mx-auto px-6 py-10">
                {/* Header */}
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-1">Command Center</h1>
                        <p className="text-zinc-500 font-medium">Manage your automated search agents.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <ForceScanButton />
                        {isFree ? (
                            <Button
                                className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-bold uppercase tracking-wide border-0 shadow-[0_0_20px_-5px_rgba(220,38,38,0.5)] animate-pulse"
                            // formAction is for forms, this is a button. We need client interaction, but this is a server component.
                            // We should probably make a client component wrapper or just link to home for now.
                            >
                                <Link href="/#pricing">Upgrade to Club Spec</Link>
                            </Button>
                        ) : (
                            <Button variant="outline" className="border-zinc-800 bg-zinc-950 text-zinc-400 font-bold uppercase tracking-wide hover:bg-zinc-900 hover:text-white pointer-events-none opacity-50">
                                {tier === 'owner' ? 'System Override Active' : 'Club Spec Active'}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <Card className="bg-zinc-950 border-zinc-800 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-red-600/10 rounded-bl-full pointer-events-none"></div>
                        <CardHeader className="pb-2">
                            <CardDescription className="text-zinc-500 font-bold uppercase text-xs tracking-widest">Active Agents</CardDescription>
                            <CardTitle className="text-5xl font-black text-white italic">
                                {activeHawks} <span className="text-2xl text-zinc-600 not-italic">/ {tier === 'owner' ? '∞' : limits.maxHawks}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-1 w-full bg-zinc-900 mt-2 overflow-hidden">
                                <div
                                    className={`h-full ${usagePercent >= 100 ? 'bg-red-600' : 'bg-white'} transition-all duration-500`}
                                    style={{ width: `${tier === 'owner' ? 0 : usagePercent}%` }}
                                ></div>
                            </div>
                            <p className="text-zinc-600 text-xs mt-2 font-mono uppercase">
                                {tier === 'owner' ? 'UNLIMITED ACCESS' : `${limits.maxHawks - activeHawks} SLOTS REMAINING`}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-zinc-950 border-zinc-800 relative overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-zinc-500 font-bold uppercase text-xs tracking-widest">Total Finds</CardDescription>
                            <CardTitle className="text-5xl font-black text-white italic">{totalFinds}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-zinc-600 text-xs uppercase font-bold">In the last 30 days</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-zinc-950 border-zinc-800 relative overflow-hidden">
                        <div className="absolute inset-0 bg-green-500/5 animate-pulse"></div>
                        <CardHeader className="pb-2 relative z-10">
                            <CardDescription className="text-zinc-500 font-bold uppercase text-xs tracking-widest">System Status</CardDescription>
                            <CardTitle className="text-5xl font-black text-green-500 italic">ONLINE</CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <p className="text-green-900 text-xs uppercase font-bold bg-green-500/10 inline-block px-2 py-1">
                                Scanning every {isFree ? '1440' : tier === 'owner' ? '1' : tier === 'club' ? '5' : '60'}m
                            </p>
                        </CardContent>
                    </Card>
                </div>



                {/* Webhook Status (for Owner/Club) */}
                {(tier === 'owner' || tier === 'club') && (
                    <div className="mb-8">
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-zinc-400 font-bold uppercase text-xs tracking-wide">Race Team Uplink Active</span>
                            </div>
                            <span className="text-[10px] text-zinc-600 font-mono">DISCORD / SLACK READY</span>
                        </div>
                    </div>
                )}

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Hawks Table & Results */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* 1. Results Feed */}
                        <FoundListings listings={recentFinds || []} />

                        {/* 2. Agents List */}
                        <Card className="bg-zinc-950 border-zinc-800">
                            <CardHeader className="border-b border-zinc-900 pb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-white text-xl font-bold uppercase tracking-wide">Your Agents</CardTitle>
                                    </div>
                                    <Badge variant="outline" className={`border-red-900 bg-red-950/20 ${activeHawks >= limits.maxHawks ? 'text-red-500' : 'text-zinc-500'}`}>
                                        {tier === 'owner' ? 'UNLIMITED' : `${activeHawks} / ${limits.maxHawks} USED`}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <HawksTable hawks={hawks || []} />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Add Hawk Form */}
                    <div className="lg:col-span-1">
                        <Card className={`bg-zinc-950 border-zinc-800 sticky top-24 border-t-4 ${activeHawks >= limits.maxHawks && tier !== 'owner' ? 'border-t-zinc-800 opacity-50 pointer-events-none' : 'border-t-red-600'} shadow-xl transition-all`}>
                            <CardHeader>
                                <CardTitle className="text-white text-xl font-bold uppercase tracking-wide outline-none">Deploy Agent</CardTitle>
                                <CardDescription className="text-zinc-500">
                                    Configure new search parameters
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="relative">
                                <HawkForm />

                                {/* Lock Overlay for Free Tier limit */}
                                {activeHawks >= limits.maxHawks && tier !== 'owner' && (
                                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto">
                                        <div className="text-center p-6">
                                            <Lock className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
                                            <h3 className="text-white font-bold uppercase mb-2">Agent Limit Reached</h3>
                                            <p className="text-zinc-400 text-sm mb-4">Upgrade to Club Spec to deploy up to 10 agents.</p>
                                            <Button asChild className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase w-full">
                                                <Link href="/#pricing">Upgrade Now</Link>
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
