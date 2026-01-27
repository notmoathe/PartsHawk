import { supabase } from './supabase'
import { scrape } from './scraper'
import { Hawk, ScraperResult } from './types'

export async function runMonitor() {
    console.log('Starting monitor run...')

    // 1. Fetch active hawks
    const { data: hawks, error } = await supabase
        .from('hawks')
        .select('*')
        .eq('status', 'active')

    if (error || !hawks) {
        console.error('Error fetching hawks:', error)
        return
    }

    console.log(`Found ${hawks.length} active hawks`)

    for (const hawk of hawks) {
        await processHawk(hawk)
    }
}

async function processHawk(hawk: Hawk) {
    console.log(`Processing hawk: ${hawk.keywords} [${hawk.source}]`)
    const negativeKeywords = hawk.negative_keywords ? hawk.negative_keywords.split(',').map(s => s.trim()) : []

    // 2. Scrape
    // Default to ebay if source is undefined (legacy support)
    const source = hawk.source || 'ebay'
    const results = await scrape(source, hawk.keywords, hawk.max_price, negativeKeywords)
    console.log(`Found ${results.length} results for ${hawk.keywords}`)

    for (const result of results) {
        // 3. Check if exists
        const { data: existing } = await supabase
            .from('found_listings')
            .select('id')
            .eq('hawk_id', hawk.id)
            .eq('listing_id', result.listingId)
            .single()

        if (!existing) {
            // 4. Save and Notify
            await saveAndNotify(hawk, result)
        }
    }
}

async function saveAndNotify(hawk: Hawk, result: ScraperResult) {
    console.log(`New deal found! ${result.title} - $${result.price}`)

    // Save to DB
    const { error } = await supabase
        .from('found_listings')
        .insert({
            hawk_id: hawk.id,
            listing_id: result.listingId,
            title: result.title,
            price: result.price,
            url: result.url,
            image_url: result.imageUrl
        })

    if (error) {
        console.error('Error saving listing:', error)
        return
    }

    // Determine if it's a "STEAL" (Simple logic for now: 50% of max price? Or just notify)
    // For now, just notify
    const message = `🦅 PartHawk Alert: ${result.title} found for $${result.price}. ${result.url}`

    // Log notification (In real app, call Twilio here)
    await supabase.from('notifications').insert({
        user_id: hawk.user_id,
        hawk_id: hawk.id,
        listing_id: result.listingId,
        message: message
    })

    // TODO: Integrate Twilio/Resend here
    console.log(`[MOCK SMS] To User ${hawk.user_id}: ${message}`)
}
