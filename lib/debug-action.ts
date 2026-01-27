'use server'

import { createClient } from '@/lib/supabase-server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function debugListings() {
    const supabaseUser = await createClient() // User context
    const { data: { user } } = await supabaseUser.auth.getUser()

    // Admin context (bypasses RLS)
    const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Check User Visibility
    const { data: userListings, error: userError } = await supabaseUser
        .from('found_listings')
        .select('*')

    // 2. Check Admin Visibility (for this user's hawks)
    const { data: adminListings, error: adminError } = await supabaseAdmin
        .from('found_listings')
        .select('*, hawks!inner(*)')
        .eq('hawks.user_id', user?.id)

    return {
        userId: user?.id,
        userCount: userListings?.length || 0,
        userError: userError?.message,
        adminCount: adminListings?.length || 0,
        adminError: adminError?.message
    }
}
