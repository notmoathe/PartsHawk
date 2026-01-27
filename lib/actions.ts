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
    // "Setup Supabase Client (I will provide API keys later)."
    // I can't really test this without the keys. 

    const { error } = await supabase.from('hawks').insert({
        user_id: user.id,
        keywords,
        max_price: maxPrice,
        condition,
        negative_keywords: negativeKeywords,
        source,
        status: 'active',
    })

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/dashboard')
    redirect('/dashboard')
}
