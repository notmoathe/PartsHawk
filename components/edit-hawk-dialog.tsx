'use plain'
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateHawk } from '@/lib/actions'
import { Pencil, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function EditHawkDialog({ hawk }: { hawk: any }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        const formData = new FormData(event.currentTarget)

        const result = await updateHawk(hawk.id, formData)

        if (result.success) {
            toast.success('Agent updated successfully')
            setOpen(false)
        } else {
            toast.error(result.error || 'Failed to update agent')
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-none">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Agent</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Modify your search criteria.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="keywords" className="text-zinc-400">Keywords</Label>
                        <Input
                            id="keywords"
                            name="keywords"
                            defaultValue={hawk.keywords}
                            className="bg-black border-zinc-800 text-white focus-visible:ring-red-600"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="max_price" className="text-zinc-400">Max Price ($)</Label>
                        <Input
                            id="max_price"
                            name="max_price"
                            type="number"
                            defaultValue={hawk.max_price}
                            className="bg-black border-zinc-800 text-white focus-visible:ring-red-600"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="scan_interval" className="text-zinc-400">Scan Frequency</Label>
                        <select
                            name="scan_interval"
                            defaultValue={hawk.scan_interval || "60"}
                            className="flex h-10 w-full rounded-md border border-zinc-800 bg-black px-3 py-2 text-sm ring-offset-black file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:cursor-not-allowed disabled:opacity-50 text-white"
                        >
                            <option value="60">Every Hour</option>
                            <option value="1440">Every 24 Hours</option>
                            <option value="15">Every 15 Minutes (Club)</option>
                            <option value="5">Every 5 Minutes (Club)</option>
                            <option value="1">Every Minute (Owner)</option>
                        </select>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="bg-white text-black hover:bg-zinc-200">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
