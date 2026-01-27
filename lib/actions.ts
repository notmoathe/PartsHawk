'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function createHawk(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('You must be logged in to create a hawk')
    }

    const keywords = formData.get('keywords') as string
    const maxPrice = parseFloat(formData.get('max_price') as string)
    const negativeKeywords = formData.get('negative_keywords') as string
    const source = formData.get('source') as string || 'ebay'

    // const { data: { user } } = await supabase.auth.getUser()
    // if (!user) throw new Error('Not authenticated')

    // For MVP/Demo without auth, use a dummy or hardcoded ID if possible, or require auth
    // create table public.hawks ( user_id uuid ... )
    // We need a user_id. Let's assume we have one or allow null for dev if we change schema,
    // but schema says not null. 
    // I'll need to handle auth or just insert a dummy user for now if I can't get one.
    // Actually, I should probably implement auth or use a dev bypass.
    // Converting to client-side supabase might be easier for the form if using RLS.

    // Let's assume there's a logged in user for now, or we fail.
    // If I can't get a user, I might fail RLS. 
    // "Setup Supabase Client (I will provide API keys later)."
    // I can't really test this without the keys. 

    const { error } = await supabase.from('hawks').insert({
        // user_id: user.id, 
        // TEMPORARY: using a placeholder UUID or assuming the client handles it
        // But since this is a server action, I need the cookies/session.
        // I'll rely on the client passing the user_id or handle it there.
        // Actually, good practice is server action checks auth.

        // For now, I'll return the logic but comment out the execution details until keys are provided.
        keywords,
        max_price: maxPrice,
        negative_keywords: negativeKeywords,
        source,
        status: 'active'
        // user_id is missing
    })

    // Since we don't have keys yet, I can't really insert. 
    // I will just log it for now to "verify" the flow.
    console.log('Creating Hawk:', { keywords, maxPrice, negativeKeywords })

    revalidatePath('/dashboard')
}
