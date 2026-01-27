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

export function HawkForm() {
    const [loading, setLoading] = useState(false)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        const formData = new FormData(event.currentTarget)
        try {
            await createHawk(formData)
                ; (event.target as HTMLFormElement).reset()
            alert('Hawk created successfully!')
        } catch (e: any) {
            alert(e.message || 'Failed to create hawk')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
                <Label htmlFor="source" className="text-zinc-300">Platform</Label>
                <Select name="source" defaultValue="ebay">
                    <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white h-11">
                        <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                        <SelectItem value="ebay" className="text-white focus:bg-zinc-800">eBay</SelectItem>
                        <SelectItem value="facebook" className="text-white focus:bg-zinc-800">Facebook Marketplace</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="keywords" className="text-zinc-300">Keywords</Label>
                <Input
                    id="keywords"
                    name="keywords"
                    placeholder="e.g. G35 Coupe Headlight"
                    required
                    className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 h-11"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="max_price" className="text-zinc-300">Max Price ($)</Label>
                <Input
                    id="max_price"
                    name="max_price"
                    type="number"
                    placeholder="200"
                    required
                    className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 h-11"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="negative_keywords" className="text-zinc-300">Exclude Words</Label>
                <Input
                    id="negative_keywords"
                    name="negative_keywords"
                    placeholder="broken, damaged, replica"
                    className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 h-11"
                />
                <p className="text-xs text-zinc-600">Comma-separated words to filter out</p>
            </div>

            <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold h-11 rounded-lg"
                disabled={loading}
            >
                {loading ? 'Creating...' : 'Create Hawk'}
            </Button>
        </form>
    )
}
