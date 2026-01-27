import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { HawkForm } from '@/components/hawk-form'
import { HawksTable } from '@/components/hawks-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: hawks } = await supabase
        .from('hawks')
        .select('*')
        .order('created_at', { ascending: false })

    const { data: recentFinds } = await supabase
        .from('found_listings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

    const activeHawks = hawks?.filter(h => h.status === 'active').length || 0
    const totalFinds = recentFinds?.length || 0

    return (
        <div className="min-h-screen bg-black selection:bg-red-600/30">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/dashboard" className="text-2xl font-black tracking-tighter text-white uppercase italic">
                        Trace<span className="text-red-600">Motorsports</span>
                        <span className="ml-2 text-xs font-normal not-italic text-zinc-500 tracking-normal border border-zinc-800 px-2 py-0.5 rounded-full">BETA</span>
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
                    <Button className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-bold uppercase tracking-wide border-0 shadow-[0_0_20px_-5px_rgba(220,38,38,0.5)]">
                        Upgrade Membership
                    </Button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <Card className="bg-zinc-950 border-zinc-800 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-red-600/10 rounded-bl-full pointer-events-none"></div>
                        <CardHeader className="pb-2">
                            <CardDescription className="text-zinc-500 font-bold uppercase text-xs tracking-widest">Active Agents</CardDescription>
                            <CardTitle className="text-5xl font-black text-white italic">{activeHawks}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-1 w-full bg-zinc-900 mt-2">
                                <div className="h-full bg-red-600 w-[20%]"></div>
                            </div>
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
                            <p className="text-green-900 text-xs uppercase font-bold bg-green-500/10 inline-block px-2 py-1">Scraping Active</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Hawks Table */}
                    <div className="lg:col-span-2">
                        <Card className="bg-zinc-950 border-zinc-800">
                            <CardHeader className="border-b border-zinc-900 pb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-white text-xl font-bold uppercase tracking-wide">Your Agents</CardTitle>
                                    </div>
                                    <Badge variant="outline" className="text-red-500 border-red-900 bg-red-950/20">
                                        {activeHawks} / 10 USED
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
                        <Card className="bg-zinc-950 border-zinc-800 sticky top-24 border-t-4 border-t-red-600 shadow-xl">
                            <CardHeader>
                                <CardTitle className="text-white text-xl font-bold uppercase tracking-wide">Deploy Agent</CardTitle>
                                <CardDescription className="text-zinc-500">
                                    Configure new search parameters
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <HawkForm />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
