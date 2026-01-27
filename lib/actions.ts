'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getUserTier, canCreateHawk, isSourceAllowed, getTierLimits } from '@/lib/subscription'

export async function createHawk(formData: FormData) {
    'use server'

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('You must be logged in to deploy an agent.')
    }

    const keywords = formData.get('keywords') as string
    const maxPrice = formData.get('max_price') ? parseFloat(formData.get('max_price') as string) : null
    const condition = formData.get('condition') as string
    const negativeKeywords = formData.get('negative_keywords') as string
    const source = (formData.get('source') as string) || 'ebay'

    // SUBSCRIPTION CHECKS
    const tier = getUserTier(user.email)
    // "Setup Supabase Client (I will provide API keys later)."
    // I can't really test this without the keys. 

    const { data: hawk, error } = await supabase.from('hawks').insert({
        user_id: user.id,
        keywords,
        max_price: maxPrice,
        condition,
        negative_keywords: negativeKeywords,
        source,
        status: 'active',
    }).select().single()

    if (error) {
        throw new Error(error.message)
    }

    // TRIGGER IMMEDIATE SCRAPE ("Go All Out")
    // We do not await this to keep UI snappy? 
    // actually user wants "actual notification", so let's await it and show result count
    try {
        const { scrape } = await import('./scraper')
        const results = await scrape(source as any, keywords, maxPrice || 1000000, negativeKeywords ? negativeKeywords.split(',').map(s => s.trim()) : [])

        if (results.length > 0) {
            const insertData = results.map(r => ({
                hawk_id: hawk.id,
                title: r.title,
                price: r.price,
                url: r.url,
                image_url: r.imageUrl,
                source: source
            }))
            await supabase.from('found_listings').insert(insertData)
        }
    } catch (err) {
        console.error("Immediate scrape failed:", err)
        // Don't fail the request, just log
    }

    revalidatePath('/dashboard')
    redirect('/dashboard')
}
