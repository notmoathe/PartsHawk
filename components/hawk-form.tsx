'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createHawk } from '@/lib/actions'
import { toast } from 'sonner'

export function HawkForm() {
    const [loading, setLoading] = useState(false)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        const formData = new FormData(event.currentTarget)

        // 1. Create the Hawk (Fast)
        const promise = createHawk(formData).then(async (result) => {
            if (!result.success) {
                throw new Error(result.error)
            }

            // 2. Trigger the Scraper (Background - via Client Fetch)
            // We do this here so it runs separately from the Server Action transaction
            if (result?.hawk) {
                // Trigger API but don't wait for it to finish blocking the UI "success" state?
                // User wants "actual notification". 
                // If we wait, we might timeout Vercel Function if the CLIENT connection drops? 
                // No, fetch calls from client have longer timeouts usually.

                // Let's await it to tell the user the count!
                try {
                    const res = await fetch('/api/scrape', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ hawk_id: result.hawk.id })
                    })
                    const data = await res.json()
                    if (data.count > 0) {
                        return `Agent deployed! Found ${data.count} items instantly.`
                    }
                } catch (e) {
                    console.error("Client trigger failed", e)
                }
            }
            return 'Agent deployed successfully! Scanning in background.'
        })

        toast.promise(promise, {
            loading: 'Deploying & Initializing Scan...',
            success: (msg) => {
                (event.target as HTMLFormElement).reset()
                // Force refresh to show new hawk in list
                window.location.href = '/dashboard'
                return msg
            },
            error: (err) => err.message || 'Failed to deploy agent'
        })

        try {
            await promise
        } catch (e) {
            // handled by toast
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
                <Label htmlFor="source" className="text-zinc-400 font-bold uppercase text-xs tracking-wide">Marketplace</Label>
                <Select name="source" defaultValue="ebay">
                    <SelectTrigger className="bg-black border-zinc-800 text-white h-11 focus:ring-red-600 ring-offset-black">
                        <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                        <SelectItem value="ebay" className="focus:bg-red-600 focus:text-white cursor-pointer">eBay Motors</SelectItem>
                        <SelectItem value="facebook" className="focus:bg-red-600 focus:text-white cursor-pointer">Facebook Marketplace</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="keywords" className="text-zinc-400 font-bold uppercase text-xs tracking-wide">Part Name / Keywords</Label>
                <Input
                    id="keywords"
                    name="keywords"
                    placeholder="e.g. R34 GTR V-Spec Diffuser"
                    required
                    className="bg-black border-zinc-800 text-white placeholder:text-zinc-700 h-11 focus-visible:ring-red-600 ring-offset-black uppercase placeholder:normal-case"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="max_price" className="text-zinc-400 font-bold uppercase text-xs tracking-wide">Max Price</Label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                        <Input
                            id="max_price"
                            name="max_price"
                            type="number"
                            placeholder="500"
                            required
                            className="bg-black border-zinc-800 text-white placeholder:text-zinc-700 h-11 pl-7 focus-visible:ring-red-600 ring-offset-black"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="condition" className="text-zinc-400 font-bold uppercase text-xs tracking-wide">Condition</Label>
                    <Select name="condition" defaultValue="any">
                        <SelectTrigger className="bg-black border-zinc-800 text-white h-11 focus:ring-red-600 ring-offset-black">
                            <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                            <SelectItem value="any" className="focus:bg-red-600">Any</SelectItem>
                            <SelectItem value="used" className="focus:bg-red-600">Used</SelectItem>
                            <SelectItem value="new" className="focus:bg-red-600">New</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2 pb-2">
                <Label htmlFor="negative_keywords" className="text-zinc-400 font-bold uppercase text-xs tracking-wide">Exclude Keywords</Label>
                <Input
                    id="negative_keywords"
                    name="negative_keywords"
                    placeholder="replica, damaged, style"
                    className="bg-black border-zinc-800 text-white placeholder:text-zinc-700 h-11 focus-visible:ring-red-600 ring-offset-black"
                />
            </div>

            <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-black h-12 rounded-none uppercase tracking-widest transition-all"
                disabled={loading}
            >
                {loading ? 'DEPLOYING...' : 'INITIALIZE AGENT'}
            </Button>
        </form>
    )
}
