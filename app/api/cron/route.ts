import { createClient } from '@supabase/supabase-js'
import { scrape, getBrowser } from '@/lib/scraper'
import { sendNotificationEmail } from '@/lib/email'
import { NextResponse } from 'next/server'
import type { Browser } from 'puppeteer-core'

export const runtime = 'nodejs'
export const maxDuration = 300

// ============================================================================
// TYPES
// ============================================================================
interface Hawk {
    id: string
    user_id: string
    keywords: string
    source: 'ebay' | 'facebook' | 'craigslist'
    max_price?: number
    negative_keywords?: string
    vehicle_string?: string
    exact_match?: boolean
    scan_interval?: number
    last_scanned_at?: string
    status: string
    webhook_url?: string
}

interface ScanResult {
    id: string
    status: 'scanned' | 'skipped' | 'failed'
    items?: number
    reason?: string
    error?: string
}

// ============================================================================
// MAIN CRON HANDLER
// ============================================================================
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const force = searchParams.get('force') === 'true'

    const results: ScanResult[] = []
    let browser: Browser | undefined

    try {
        console.log('[Cron] Starting Scan Cycle...')

        // Init Supabase Admin Client
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { autoRefreshToken: false, persistSession: false } }
        )

        // Fetch Active Hawks
        const { data: hawks, error } = await supabaseAdmin
            .from('hawks')
            .select('*')
            .eq('status', 'active')

        if (error || !hawks) {
            console.error('[Cron] Failed to fetch hawks:', error)
            return NextResponse.json({ error: 'Database error' }, { status: 500 })
        }

        console.log(`[Cron] Found ${hawks.length} active hawks. Checking schedules...`)

        if (hawks.length === 0) {
            return NextResponse.json({ success: true, scanned: 0, skipped: 0 })
        }

        // Pre-launch browser ONCE for all hawks
        try {
            browser = await getBrowser()
            console.log('[Cron] Browser launched successfully')
        } catch (e: any) {
            console.error('[Cron] Failed to launch browser:', e.message)
            return NextResponse.json({
                success: false,
                error: 'Browser launch failed'
            }, { status: 200 })
        }

        const now = new Date()

        // Process hawks sequentially (memory constraints)
        for (const hawk of hawks as Hawk[]) {
            try {
                // Check if it's time to scan
                const lastScanned = hawk.last_scanned_at
                    ? new Date(hawk.last_scanned_at)
                    : new Date(0)
                const intervalMinutes = hawk.scan_interval || 60
                const nextScanTime = new Date(lastScanned.getTime() + intervalMinutes * 60000)

                if (!force && now < nextScanTime) {
                    results.push({
                        id: hawk.id,
                        status: 'skipped',
                        reason: `Next scan at ${nextScanTime.toISOString()}`
                    })
                    continue
                }

                console.log(`[Cron] Scanning: ${hawk.id} (${hawk.keywords})`)

                // Get user email
                const { data: userData } = await supabaseAdmin.auth.admin.getUserById(hawk.user_id)
                const userEmail = userData?.user?.email

                // Parse negative keywords
                const negativeKeywords = hawk.negative_keywords
                    ? hawk.negative_keywords.split(',').map(s => s.trim()).filter(Boolean)
                    : []

                // Scrape
                const scrapeResults = await scrape(
                    hawk.source,
                    hawk.keywords,
                    hawk.max_price || 1000000,
                    negativeKeywords,
                    hawk.vehicle_string,
                    hawk.exact_match,
                    browser
                )

                // Get existing listings to filter duplicates
                const { data: existingListings } = await supabaseAdmin
                    .from('found_listings')
                    .select('url')
                    .eq('hawk_id', hawk.id)

                const existingIds = new Set(
                    existingListings?.map(x => {
                        const match = x.url.match(/\/itm\/(\d+)/)
                        return match ? match[1] : x.url
                    }) || []
                )

                const newItems = scrapeResults.filter(r => !existingIds.has(r.listingId))

                console.log(`[Cron] ${hawk.id}: ${scrapeResults.length} total, ${newItems.length} new`)

                // Save new items
                if (newItems.length > 0) {
                    const insertData = newItems.map(r => ({
                        hawk_id: hawk.id,
                        user_id: hawk.user_id,
                        title: r.title,
                        price: r.price,
                        url: r.url,
                        image_url: r.imageUrl,
                        source: hawk.source
                    }))

                    const { error: insertError } = await supabaseAdmin
                        .from('found_listings')
                        .insert(insertData)

                    if (insertError) {
                        console.error('[Cron] Insert failed:', insertError)
                    }

                    // Send email notification
                    if (userEmail) {
                        try {
                            await sendNotificationEmail(userEmail, hawk.keywords, insertData)
                        } catch (emailErr) {
                            console.error('[Cron] Email failed:', emailErr)
                        }
                    }

                    // Send webhook (Discord/Slack)
                    if (hawk.webhook_url) {
                        await sendWebhook(hawk, newItems)
                    }
                }

                // Update last_scanned_at
                await supabaseAdmin
                    .from('hawks')
                    .update({ last_scanned_at: new Date().toISOString() })
                    .eq('id', hawk.id)

                results.push({ id: hawk.id, status: 'scanned', items: newItems.length })

            } catch (hawkError: any) {
                console.error(`[Cron] Hawk ${hawk.id} failed:`, hawkError.message)
                results.push({
                    id: hawk.id,
                    status: 'failed',
                    error: hawkError.message
                })
            }
        }

        const scanned = results.filter(r => r.status === 'scanned').length
        const skipped = results.filter(r => r.status === 'skipped').length
        const failed = results.filter(r => r.status === 'failed').length

        console.log(`[Cron] Complete: ${scanned} scanned, ${skipped} skipped, ${failed} failed`)

        return NextResponse.json({
            success: true,
            scanned,
            skipped,
            failed,
            results
        })

    } catch (criticalError: any) {
        console.error('[Cron] Critical failure:', criticalError)
        return NextResponse.json({
            success: false,
            error: criticalError.message || 'Unknown error',
            results
        }, { status: 200 }) // Return 200 so cron services don't disable

    } finally {
        // ALWAYS close browser
        if (browser) {
            try {
                await browser.close()
                console.log('[Cron] Browser closed')
            } catch (e) {
                console.error('[Cron] Browser close error:', e)
            }
        }
    }
}

// ============================================================================
// WEBHOOK HELPER
// ============================================================================
async function sendWebhook(hawk: Hawk, newItems: any[]) {
    if (!hawk.webhook_url) return

    try {
        const payload = {
            content: `🦅 **PartHawk Alert**\nFound ${newItems.length} new item${newItems.length > 1 ? 's' : ''} for **${hawk.keywords}**${hawk.vehicle_string ? `\n*Vehicle: ${hawk.vehicle_string}*` : ''}`,
            embeds: newItems.slice(0, 10).map(r => ({
                title: r.title?.substring(0, 256) || 'Item',
                url: r.url,
                description: `💰 $${r.price}\n📍 ${hawk.source}`,
                thumbnail: r.imageUrl ? { url: r.imageUrl } : undefined,
                color: 0xDE4A3C // PartHawk red
            }))
        }

        const response = await fetch(hawk.webhook_url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })

        if (!response.ok) {
            console.warn(`[Cron] Webhook returned ${response.status}`)
        }
    } catch (err) {
        console.error('[Cron] Webhook error:', err)
    }
}