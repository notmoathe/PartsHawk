import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Hawk {
    id: string
    keywords: string
    max_price: number
    source?: string
    status: string
}

export function HawksTable({ hawks }: { hawks: Hawk[] }) {
    if (hawks.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-4xl mb-4">🦅</div>
                <p className="text-zinc-500 mb-2">No hawks yet</p>
                <p className="text-zinc-600 text-sm">Create your first hawk to start monitoring</p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {hawks.map((hawk) => (
                <div
                    key={hawk.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600/50 transition-colors"
                >
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <p className="text-white font-medium">{hawk.keywords}</p>
                            <Badge
                                variant="secondary"
                                className={hawk.status === 'active'
                                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                    : 'bg-zinc-700/50 text-zinc-400'
                                }
                            >
                                {hawk.status}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-zinc-500">
                            <span>Max: ${hawk.max_price}</span>
                            <span className="capitalize">{hawk.source || 'ebay'}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-zinc-700">
                            Pause
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                            Delete
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    )
}
