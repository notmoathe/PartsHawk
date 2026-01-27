'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { createHawk } from '@/lib/actions'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function HawkForm() {
    const [loading, setLoading] = useState(false)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        const formData = new FormData(event.currentTarget)
        try {
            await createHawk(formData)
            // Reset form or show success
            alert('Hawk created!')
        } catch (e) {
            console.error(e)
            alert('Failed to create hawk')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Add New Hawk</CardTitle>
                <CardDescription>Monitor parts matching your criteria.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="source">Source</Label>
                        <Select name="source" defaultValue="ebay">
                            <SelectTrigger>
                                <SelectValue placeholder="Select platform" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ebay">eBay</SelectItem>
                                <SelectItem value="facebook">Facebook Marketplace (Beta)</SelectItem>
                                <SelectItem value="craigslist">Craigslist</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="keywords">Keywords</Label>
                        <Input id="keywords" name="keywords" placeholder="e.g. G35 Coupe Headlight" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="max_price">Max Price ($)</Label>
                        <Input id="max_price" name="max_price" type="number" step="0.01" placeholder="150.00" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="negative_keywords">Negative Keywords</Label>
                        <Input id="negative_keywords" name="negative_keywords" placeholder="-broken -aftermarket" />
                        <p className="text-xs text-muted-foreground">Comma separated or space separated</p>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Deploying Hawk...' : 'Deploy Hawk'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
