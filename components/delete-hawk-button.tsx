'use client'

import { Button } from '@/components/ui/button'
import { deleteHawk } from '@/lib/actions'
import { toast } from 'sonner'
import { useState } from 'react'
import { Trash2 } from 'lucide-react'

export function DeleteHawkButton({ id }: { id: string }) {
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to kill this agent?')) return

        setLoading(true)
        try {
            await deleteHawk(id)
            toast.success('Agent eliminated.')
        } catch (e) {
            toast.error('Failed to delete agent.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={loading}
            className="text-zinc-500 hover:text-red-500 hover:bg-red-950/10 border border-transparent hover:border-red-900/30 h-8 text-xs font-bold uppercase transition-colors"
        >
            {loading ? 'Killing...' : 'Kill'}
        </Button>
    )
}
