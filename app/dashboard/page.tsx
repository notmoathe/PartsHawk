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
        <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/dashboard" className="text-2xl font-black tracking-tighter text-white">
                        Part<span className="text-blue-500">Hawk</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <span className="text-zinc-500 text-sm hidden md:block">{user?.email}</span>
                        <form action="/auth/signout" method="post">
                            <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                                Sign Out
                            </Button>
                        </form>
                    </div>
                </div>
            </nav>

            <div className="container mx-auto px-6 py-10">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
                    <p className="text-zinc-500">Monitor your hawks and view recent finds.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <Card className="bg-zinc-900/50 border-zinc-800">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-zinc-500">Active Hawks</CardDescription>
                            <CardTitle className="text-4xl font-bold text-white">{activeHawks}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-zinc-500">Monitoring {activeHawks > 1 ? 'searches' : 'search'}</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-zinc-900/50 border-zinc-800">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-zinc-500">Recent Finds</CardDescription>
                            <CardTitle className="text-4xl font-bold text-white">{totalFinds}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-zinc-500">Matches found</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-zinc-900/50 border-zinc-800">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-zinc-500">Status</CardDescription>
                            <CardTitle className="text-4xl font-bold text-green-500">Live</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-zinc-500">Scanning every 5 minutes</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Hawks Table */}
                    <div className="lg:col-span-2">
                        <Card className="bg-zinc-900/50 border-zinc-800">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-white text-xl">Your Hawks</CardTitle>
                                        <CardDescription className="text-zinc-500">
                                            Active monitors watching for your parts
                                        </CardDescription>
                                    </div>
                                    <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                                        {activeHawks} Active
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <HawksTable hawks={hawks || []} />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Add Hawk Form */}
                    <div className="lg:col-span-1">
                        <Card className="bg-zinc-900/50 border-zinc-800 sticky top-24">
                            <CardHeader>
                                <CardTitle className="text-white text-xl">Add New Hawk</CardTitle>
                                <CardDescription className="text-zinc-500">
                                    Start monitoring for a new part
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <HawkForm />
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Recent Finds Section */}
                {recentFinds && recentFinds.length > 0 && (
                    <div className="mt-10">
                        <Card className="bg-zinc-900/50 border-zinc-800">
                            <CardHeader>
                                <CardTitle className="text-white text-xl">Recent Finds</CardTitle>
                                <CardDescription className="text-zinc-500">
                                    Latest matches from your hawks
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recentFinds.map((find: any) => (
                                        <div key={find.id} className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                                            <div>
                                                <p className="text-white font-medium">{find.title}</p>
                                                <p className="text-zinc-500 text-sm">${find.price}</p>
                                            </div>
                                            <a
                                                href={find.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-400 hover:text-blue-300 text-sm"
                                            >
                                                View →
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}
