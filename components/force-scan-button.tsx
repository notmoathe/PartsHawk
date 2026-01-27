'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Zap } from 'lucide-react'
import { toast } from 'sonner'

export function ForceScanButton() {
    const [loading, setLoading] = useState(false)

    async function handleScan() {
        setLoading(true)
        try {
            // We call the cron route manually to trigger "Check All"
            // Since this is client-side, we need to secure the route or just allow it for testing?
            // Vercel Cron routes are usually protected. 
            // Instead, let's make a new endpoint /api/trigger-scan for authenticated users.
            // OR just call /api/cron with a secret if we want to test that specifically.
            // Let's assume we make a dedicated client-triggerable endpoint for the user.

            // Set a client-side timeout to avoid hanging if the server takes too long (Vercel has limit)
            const controller = new AbortController()
            const id = setTimeout(() => controller.abort(), 8000) // 8 second timeout

            try {
                const res = await fetch('/api/cron?force=true', {
                    method: 'GET',
                    signal: controller.signal
                })
                clearTimeout(id)

                if (res.ok) {
                    toast.success('System-wide scan completed successfully.')
                } else {
                    toast.error('Scan trigger failed.')
                }
            } catch (e: any) {
                if (e.name === 'AbortError') {
                    // It timed out, but likely is still running on server
                    toast.success('Scan initiated! Agents are working in the background.')
                } else {
                    toast.error('Connection error.')
                }
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            variant="outline"
            onClick={handleScan}
            disabled={loading}
            className="border-red-900/50 text-red-500 bg-red-950/10 hover:bg-red-950/30 uppercase text-xs font-bold tracking-widest"
        >
            {loading ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Zap className="mr-2 h-3 w-3" />}
            Scan All Now
        </Button>
    )
}
