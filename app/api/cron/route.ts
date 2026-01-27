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
        .select('*, users:user_id ( email ), webhook_url, vehicle_string') // Join user to get email
        .eq('status', 'active')

    if (error || !hawks) {
        console.error('[Cron] Failed to fetch hawks', error)
        return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    console.log(`[Cron] Found ${hawks.length} active hawks. Checking schedules...`)

    const now = new Date()
    const promises = hawks.map(async (hawk: { id: string, user_id: string, last_scanned_at: string | null, scan_interval: number | null, keywords: string, source: any, max_price: number | null, negative_keywords: string | null, users: { email: string } | null, webhook_url: string | null, vehicle_string: string | null, exact_match: boolean | null }) => {
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
            // 1. Fetch User Email Securely (Bypass Public/Auth Schema Join issues)
            const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(hawk.user_id)
            const userEmail = userData?.user?.email

            if (userError || !userEmail) {
                console.warn(`[Cron] Could not find user email for hawk ${hawk.id}`, userError)
            }

            // Perform Scrape
            const results = await scrape(
                hawk.source,
                hawk.keywords,
                hawk.max_price || 1000000,
                hawk.negative_keywords ? hawk.negative_keywords.split(',').map((s: string) => s.trim()) : [],
                hawk.vehicle_string || undefined,
                hawk.exact_match || false
            )

            // Filter Duplicates
            const { data: existingListings } = await supabaseAdmin
                .from('found_listings')
                .select('url')
                .eq('hawk_id', hawk.id)
                .in('url', results.map(r => r.url))

            const existingUrls = new Set(existingListings?.map(x => x.url) || [])
            const newItems = results.filter(r => !existingUrls.has(r.url))

            console.log(`[Cron] ${hawk.id}: Found ${results.length} total, ${newItems.length} are new.`)

            // Save Results
            if (newItems.length > 0) {
                const insertData = newItems.map(r => ({
                    hawk_id: hawk.id,
                    user_id: hawk.user_id, // Direct ownership
                    title: r.title,
                    price: r.price,
                    url: r.url,
                    image_url: r.imageUrl,
                    source: hawk.source
                }))

                const { error: insertError } = await supabaseAdmin.from('found_listings').insert(insertData)
                if (insertError) console.error('[Cron] Insert Failed:', insertError)

                // Send Email
                if (userEmail) {
                    await sendNotificationEmail(userEmail, hawk.keywords, insertData)
                }

                // Send Webhook (Discord/Slack)
                if (hawk.webhook_url) {
                    try {
                        await fetch(hawk.webhook_url, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                content: `🦅 **PartHawk Alert**\nFound ${newItems.length} new items for **${hawk.keywords}**\n${hawk.vehicle_string ? `*Vehicle: ${hawk.vehicle_string}*\n` : ''}`,
                                embeds: newItems.slice(0, 10).map(r => ({
                                    title: r.title,
                                    url: r.url,
                                    description: `Price: $${r.price}\nSource: ${hawk.source}`,
                                    thumbnail: { url: r.imageUrl },
                                    color: 14548992 // Red
                                }))
                            })
                        })
                    } catch (webhookErr) {
                        console.error('[Cron] Webhook failed:', webhookErr)
                    }
                }
            }

            // Update last_scanned_at
            await supabaseAdmin.from('hawks').update({ last_scanned_at: new Date().toISOString() }).eq('id', hawk.id)

            return { id: hawk.id, status: 'scanned', items: newItems.length }

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

} catch (criticalError: any) {
    console.error('[Cron] Critical Failure:', criticalError)
    // Return 200 even on critical failure so cron-job.org doesn't disable the job
    // But log the error in the body
    return NextResponse.json({
        success: false,
        error: criticalError.message || 'Unknown critical error'
    }, { status: 200 })
}
}
