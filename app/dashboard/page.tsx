import { supabase } from '@/lib/supabase'
import { HawkForm } from '@/components/hawk-form'
import { HawksTable } from '@/components/hawks-table'

export default async function DashboardPage() {
    // Fetch hawks from Supabase
    // For MVP/Demo without keys, we might get an error or empty list.
    // We'll handle it gracefully or mock it if needed.
    let hawks: any[] = []

    try {
        const { data, error } = await supabase.from('hawks').select('*').order('created_at', { ascending: false })
        if (data) hawks = data
        if (error) console.error('Supabase error:', error)
    } catch (e) {
        console.error('Failed to fetch hawks', e)
        // Mock data for display if DB fails (since keys might be missing)
        hawks = [
            { id: '1', keywords: 'G35 Headlights', max_price: 150, status: 'active', created_at: new Date().toISOString() },
            { id: '2', keywords: '350z coilovers', max_price: 500, status: 'paused', created_at: new Date().toISOString() },
        ]
    }

    return (
        <div className="container mx-auto py-10 space-y-8">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">PartHawk Dashboard</h1>
                <p className="text-muted-foreground">Manage your monitors and view found parts.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-1 md:col-span-3 lg:col-span-4">
                    <div className="mb-4">
                        <h2 className="text-xl font-semibold mb-2">Active Hawks</h2>
                        <HawksTable hawks={hawks} />
                    </div>
                </div>

                <div className="col-span-1 md:col-span-2 lg:col-span-3">
                    <div className="sticky top-8">
                        <HawkForm />
                    </div>
                </div>
            </div>
        </div>
    )
}
