'use client'

import { Button } from '@/components/ui/button'
import { deleteHawk } from '@/lib/actions'
import { toast } from 'sonner'
import { useState } from 'react'
import { Trash2 } from 'lucide-react'

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function DeleteHawkButton({ id }: { id: string }) {
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)

    const handleDelete = async () => {
        setLoading(true)
        try {
            await deleteHawk(id)
            toast.success('Agent eliminated.')
            setOpen(false)
        } catch (e) {
            toast.error('Failed to delete agent.')
            setLoading(false)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-zinc-500 hover:text-red-500 hover:bg-red-950/10 border border-transparent hover:border-red-900/30 h-8 text-xs font-bold uppercase transition-colors"
                >
                    Kill
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-zinc-950 border-zinc-800">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-white uppercase italic">Terminate Agent?</AlertDialogTitle>
                    <AlertDialogDescription className="text-zinc-400">
                        This action cannot be undone. This will permanently delete the agent and all its found listings.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="bg-black text-white border-zinc-800 hover:bg-zinc-900 hover:text-white uppercase font-bold tracking-wider text-xs">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e: React.MouseEvent) => {
                            e.preventDefault()
                            handleDelete()
                        }}
                        disabled={loading}
                        className="bg-red-600 text-white hover:bg-red-700 uppercase font-bold tracking-wider text-xs"
                    >
                        {loading ? 'Terminating...' : 'Terminate'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
