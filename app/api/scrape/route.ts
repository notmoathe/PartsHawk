import { createClient } from '@/lib/supabase-server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { scrape } from '@/lib/scraper'
import { sendNotificationEmail } from '@/lib/email'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 Minutes for Pro

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

    // Create Admin Client for bypassing RLS during insert
    // This is required because the scraper is a "system" process adding data
    const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )

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
            hawk.negative_keywords ? hawk.negative_keywords.split(',').map((s: string) => s.trim()) : [],
            hawk.vehicle_string || undefined,
            hawk.exact_match || false
        )

        console.log(`[Scrape API] Scraper returned ${results.length} items`)

        // 4. Filter Duplicates (Prevent Spam)
        // We only want to notify about *new* listings we haven't seen for this hawk
        const { data: existingListings } = await supabaseAdmin
            .from('found_listings')
            .select('url')
            .eq('hawk_id', hawk.id)
            .in('url', results.map(r => r.url))

        const existingUrls = new Set(existingListings?.map(x => x.url) || [])
        const newItems = results.filter(r => !existingUrls.has(r.url))

        console.log(`[Scrape API] Found ${results.length} total, ${newItems.length} are new.`)

        if (newItems.length > 0) {
            const insertData = newItems.map(r => ({
                hawk_id: hawk.id,
                title: r.title,
                price: r.price,
                url: r.url,
                image_url: r.imageUrl,
                source: hawk.source
            }))

            // Use Admin Client to Insert
            const { error: insertError } = await supabaseAdmin.from('found_listings').insert(insertData)
            if (insertError) {
                console.error('[Scrape API] Insert failed:', insertError)
                throw insertError
            }

            // 5. Notifications
            // Fetch fresh details with user data using Admin client just to be sure
            const { data: freshHawk } = await supabaseAdmin
                .from('hawks')
                .select('*, users:user_id ( email ), webhook_url, vehicle_string')
                .eq('id', hawk.id)
                .single() as any

            // Send Email
            if (freshHawk?.users?.email) {
                await sendNotificationEmail(freshHawk.users.email, freshHawk.keywords, insertData)
            }

            // Send Webhook (Discord/Slack)
            if (freshHawk?.webhook_url) {
                try {
                    await fetch(freshHawk.webhook_url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            content: `🦅 **PartHawk Alert**\nFound ${newItems.length} new items for **${freshHawk.keywords}**\n${freshHawk.vehicle_string ? `*Vehicle: ${freshHawk.vehicle_string}*\n` : ''}`,
                            embeds: newItems.slice(0, 10).map((r: any) => ({
                                title: r.title,
                                url: r.url,
                                description: `Price: $${r.price}\nSource: ${freshHawk.source}`,
                                thumbnail: { url: r.imageUrl },
                                color: 14548992 // Red
                            }))
                        })
                    })
                } catch (webhookErr) {
                    console.error('[Scrape API] Webhook failed:', webhookErr)
                }
            }
        }

        return NextResponse.json({ success: true, count: newItems.length })

    } catch (e: unknown) {
        console.error("Scrape API Failed:", e)
        const message = e instanceof Error ? e.message : 'Scrape failed'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
