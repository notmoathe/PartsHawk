import { createClient } from '@supabase/supabase-js'
import { scrape } from '@/lib/scraper'
import { sendNotificationEmail } from '@/lib/email'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
// Vercel Cron max duration: 60s (Pro is higher)
export const maxDuration = 60

export async function GET(request: Request) {
    // Check for Vercel Cron Signature to secure it (Optional for now)
    // or just check for query param ?force=true for manual testing
    const { searchParams } = new URL(request.url)
    const force = searchParams.get('force') === 'true'

    console.log('[Cron] Starting Scan Cycle...')

    // Init Admin Client
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // 1. Fetch ALL Active Hawks
    // In a real production app with thousands of users, we would paginate or use a queue.
    // For now, fetching all active hawks is fine.
    const { data: hawks, error } = await supabaseAdmin
        .from('hawks')
        .select('*, users:user_id ( email )') // Join user to get email
        .eq('status', 'active')

    if (error || !hawks) {
        console.error('[Cron] Failed to fetch hawks', error)
        return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    console.log(`[Cron] Found ${hawks.length} active hawks. Checking schedules...`)

    const now = new Date()
    const promises = hawks.map(async (hawk: any) => {
        // Check Interval
        const lastScanned = hawk.last_scanned_at ? new Date(hawk.last_scanned_at) : new Date(0)
        const intervalMinutes = hawk.scan_interval || 60
        const nextScanTime = new Date(lastScanned.getTime() + intervalMinutes * 60000)

        if (!force && now < nextScanTime) {
            // Not time yet
            return { id: hawk.id, status: 'skipped', reason: 'Too early' }
        }

        console.log(`[Cron] Scanning Hawk: ${hawk.id} (${hawk.keywords})`)

        try {
            // Perform Scrape
            const results = await scrape(
                hawk.source,
                hawk.keywords,
                hawk.max_price || 1000000,
                hawk.negative_keywords ? hawk.negative_keywords.split(',').map((s: string) => s.trim()) : []
            )

            // Save Results
            if (results.length > 0) {
                const insertData = results.map(r => ({
                    hawk_id: hawk.id,
                    title: r.title,
                    price: r.price,
                    url: r.url,
                    image_url: r.imageUrl,
                    source: hawk.source
                }))

                const { error: insertError } = await supabaseAdmin.from('found_listings').insert(insertData)
                if (insertError) console.error('[Cron] Insert Failed:', insertError)

                // Send Email
                if (hawk.users?.email) {
                    await sendNotificationEmail(hawk.users.email, hawk.keywords, insertData)
                }
            }

            // Update last_scanned_at
            await supabaseAdmin.from('hawks').update({ last_scanned_at: new Date().toISOString() }).eq('id', hawk.id)

            return { id: hawk.id, status: 'scanned', items: results.length }

        } catch (e) {
            console.error(`[Cron] Failed to process hawk ${hawk.id}`, e)
            return { id: hawk.id, status: 'failed' }
        }
    })

    const results = await Promise.all(promises)
    const scannedCount = results.filter(r => r.status === 'scanned').length

    return NextResponse.json({
        success: true,
        scanned: scannedCount,
        skipped: results.length - scannedCount
    })
}
