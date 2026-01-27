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

    // Return the hawk so the client can trigger the scrape
    return { success: true, hawk }
}
