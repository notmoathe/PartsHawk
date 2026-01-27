import { NextResponse } from 'next/server'
import { sendNotificationEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const to = searchParams.get('to')

    if (!to) {
        return NextResponse.json({ error: 'Missing "to" query parameter. Usage: /api/debug-email?to=you@example.com' }, { status: 400 })
    }

    try {
        console.log(`[Debug] Sending test email to: ${to}`)

        // Mock items
        const mockItems = [
            {
                title: '[TEST] 2010 Infiniti EX35 Driver Side Mirror (Debug Item)',
                price: 125.00,
                url: 'https://tracemotorsports.com',
                imageUrl: 'https://placehold.co/600x400/red/white?text=Test+Item'
            }
        ]

        await sendNotificationEmail(to, 'DEBUG_TEST_AGENT', mockItems)

        return NextResponse.json({
            success: true,
            message: `Test email dispatched to ${to}`,
            timestamp: new Date().toISOString()
        })
    } catch (e: any) {
        console.error('[Debug] Email failed:', e)
        return NextResponse.json({ success: false, error: e.message }, { status: 500 })
    }
}
