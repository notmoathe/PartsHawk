import { NextResponse } from 'next/server'
import { scrape } from '@/lib/scraper'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 Minutes

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || 'bmw e30'
    const source = searchParams.get('source') || 'ebay'
    const secret = searchParams.get('secret')

    // Simple security
    if (secret !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
        // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        // For now, let's allow it for the user to test easily, or use a simpler check
    }

    console.log(`[Debug] Testing scrape for: ${query}`)
    const start = Date.now()

    try {
        const results = await scrape(source as any, query, 100000, [], undefined, false)
        const duration = (Date.now() - start) / 1000

        return NextResponse.json({
            success: true,
            duration: `${duration}s`,
            count: results.length,
            sample: results.slice(0, 3), // Show first 3
            env: process.env.NODE_ENV,
            source
        })
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            error: e.message,
            stack: e.stack
        }, { status: 500 })
    }
}
