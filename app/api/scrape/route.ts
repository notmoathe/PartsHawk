import { createClient } from '@/lib/supabase-server'
import { scrape } from '@/lib/scraper'
import { sendNotificationEmail } from '@/lib/email'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 60 // Allow 60 seconds for scraping

export async function POST(request: Request) {
    // 1. Validate Request
    const body = await request.json()
    const { hawk_id } = body

    console.log(`[Scrape API] Triggered for Hawk ID: ${hawk_id}`)

    if (!hawk_id) {
        return NextResponse.json({ error: 'Missing hawk_id' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 2. Fetch Hawk Details
    const { data: hawk, error } = await supabase
        .from('hawks')
        .select('*')
        .eq('id', hawk_id)
        .single()

    if (error || !hawk) {
        console.error(`[Scrape API] Hawk not found:`, error)
        return NextResponse.json({ error: 'Hawk not found' }, { status: 404 })
    }

    console.log(`[Scrape API] Found Hawk: ${hawk.keywords} (${hawk.source})`)

    try {
        // 3. Run Scraper (This can take 10-20s)
        console.log(`[Scrape API] Starting cleanup/scrape...`)
        const results = await scrape(
            hawk.source,
            hawk.keywords,
            hawk.max_price || 1000000,
            hawk.negative_keywords ? hawk.negative_keywords.split(',').map((s: string) => s.trim()) : []
        )

        console.log(`[Scrape API] Scraper returned ${results.length} items`)

        // 4. Save Results
        if (results.length > 0) {
            const insertData = results.map(r => ({
                hawk_id: hawk.id,
                title: r.title,
                price: r.price,
                url: r.url,
                image_url: r.imageUrl,
                source: hawk.source
            }))

            const { error: insertError } = await supabase.from('found_listings').insert(insertData)
            if (insertError) {
                console.error('[Scrape API] Insert failed:', insertError)
                throw insertError
            }

            // 5. Send Email Notification
            // Need user email.
            // If the user triggered this from client, we have their session maybe?
            // NOTE: This API is "public" triggered by client fetch, so we should check auth policies.
            // But we already fetched the hawk.
            // We need the USER'S email.

            // Fetch user email if not in session
            // The 'user_id' is on the hawk.
            // But auth.users table is private.
            // We can send to the logged-in user if the session is valid.
            // If this is a CRON job later, we need specific admin rights.

            if (user && user.email) {
                await sendNotificationEmail(user.email, hawk.keywords, insertData)
            } else {
                console.log('[Scrape API] No user email found in session to send notification.')
            }
        }

        return NextResponse.json({ success: true, count: results.length })

    } catch (e: any) {
        console.error("Scrape API Failed:", e)
        return NextResponse.json({ error: e.message || 'Scrape failed' }, { status: 500 })
    }
}
