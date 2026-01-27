import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { getUserTier, getTierLimits } from '@/lib/subscription'
import { redirect } from 'next/navigation'

export async function createHawk(formData: FormData) {
    'use server'

    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { success: false, error: 'You must be logged in to deploy an agent.' }
        }

        const keywords = formData.get('keywords') as string
        const maxPrice = formData.get('max_price') ? parseFloat(formData.get('max_price') as string) : null
        const condition = formData.get('condition') as string
        const negativeKeywords = formData.get('negative_keywords') as string
        const source = (formData.get('source') as string) || 'ebay'
        const scanInterval = parseInt(formData.get('scan_interval') as string) || 60

        // Validate Interval based on Tier
        const tier = getUserTier(user.email)
        const limits = getTierLimits(tier)
        if (scanInterval < limits.scanIntervalMinutes) {
            return { success: false, error: `Your plan limits scanning to every ${limits.scanIntervalMinutes} minutes.` }
        }

        const { data: hawk, error } = await supabase.from('hawks').insert({
            user_id: user.id,
            keywords,
            max_price: maxPrice,
            condition,
            negative_keywords: negativeKeywords,
            source,
            status: 'active',
            scan_interval: scanInterval
        }).select().single()

        if (error) {
            console.error('Database Error:', error)
            return { success: false, error: error.message || 'Database insert failed' }
        }

        // Return valid JSON-serializable data only
        const plainHawk = {
            id: hawk.id,
            keywords: hawk.keywords,
            source: hawk.source
        }

        return { success: true, hawk: plainHawk }

    } catch (e: any) {
        console.error('Server Action Error:', e)
        return { success: false, error: e.message || 'Unknown server error' }
    }
}

export async function deleteHawk(id: string) {
    'use server'

    const supabase = await createClient()
    const { error } = await supabase.from('hawks').delete().eq('id', id)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard')
    return { success: true }
}

export async function updateHawk(id: string, formData: FormData) {
    'use server'

    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { success: false, error: 'Unauthorized' }
        }

        const keywords = formData.get('keywords') as string
        const maxPrice = formData.get('max_price') ? parseFloat(formData.get('max_price') as string) : null
        const scanInterval = formData.get('scan_interval') ? parseInt(formData.get('scan_interval') as string) : undefined

        const tier = getUserTier(user.email)
        const limits = getTierLimits(tier)

        if (scanInterval && scanInterval < limits.scanIntervalMinutes) {
            return { success: false, error: `Your plan limits scanning to every ${limits.scanIntervalMinutes} minutes.` }
        }

        // Only update editable fields
        const updateData: any = {
            keywords,
            max_price: maxPrice,
        }
        if (scanInterval) updateData.scan_interval = scanInterval

        const { error } = await supabase
            .from('hawks')
            .update(updateData)
            .eq('id', id)
            .eq('user_id', user.id) // Security check

        if (error) throw error

        revalidatePath('/dashboard')
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}
