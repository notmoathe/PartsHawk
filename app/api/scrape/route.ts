import { createClient } from '@/lib/supabase-server'
import { scrape } from '@/lib/scraper'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 60 // Allow 60 seconds for scraping

export async function POST(request: Request) {
    // 1. Validate Request
    const body = await request.json()
    const { hawk_id } = body

    if (!hawk_id) {
        return NextResponse.json({ error: 'Missing hawk_id' }, { status: 400 })
    }

    const supabase = await createClient()

    // 2. Fetch Hawk Details
    const { data: hawk, error } = await supabase
        .from('hawks')
        .select('*')
        .eq('id', hawk_id)
        .single()

    if (error || !hawk) {
        return NextResponse.json({ error: 'Hawk not found' }, { status: 404 })
    }

    try {
        // 3. Run Scraper (This can take 10-20s)
        const results = await scrape(
            hawk.source,
            hawk.keywords,
            hawk.max_price || 1000000,
            hawk.negative_keywords ? hawk.negative_keywords.split(',').map((s: string) => s.trim()) : []
        )

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
            if (insertError) throw insertError
        }

        return NextResponse.json({ success: true, count: results.length })

    } catch (e: any) {
        console.error("Scrape API Failed:", e)
        return NextResponse.json({ error: e.message || 'Scrape failed' }, { status: 500 })
    }
}
