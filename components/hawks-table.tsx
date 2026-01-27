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
            <div className="text-center py-12 border-2 border-dashed border-zinc-900 rounded-lg">
                <div className="text-4xl mb-4 grayscale opacity-50">🏎️</div>
                <p className="text-zinc-400 font-bold uppercase tracking-wide mb-2">No Active Agents</p>
                <p className="text-zinc-600 text-sm">Deploy your first agent to start scanning the market.</p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {hawks.map((hawk) => (
                <div
                    key={hawk.id}
                    className="flex items-center justify-between p-5 rounded-none bg-black border border-zinc-800 hover:border-red-900/50 transition-colors group"
                >
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <p className="text-white font-bold uppercase tracking-wide">{hawk.keywords}</p>
                            <Badge
                                variant="secondary"
                                className={hawk.status === 'active'
                                    ? 'bg-green-950/30 text-green-500 border-green-900/50 rounded-sm uppercase text-[10px] font-bold tracking-wider'
                                    : 'bg-zinc-800 text-zinc-500 rounded-sm'
                                }
                            >
                                {hawk.status === 'active' ? 'SCANNING' : 'PAUSED'}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-mono text-zinc-500 uppercase">
                            <span className="flex items-center gap-1">
                                <span className="text-zinc-600">MAX:</span>
                                <span className="text-zinc-300">${hawk.max_price}</span>
                            </span>
                            <span className="w-px h-3 bg-zinc-800"></span>
                            <span className="flex items-center gap-1">
                                <span className="text-zinc-600">SRC:</span>
                                <span className="text-red-500">{hawk.source || 'ebay'}</span>
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-700 h-8 text-xs font-bold uppercase">
                            Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-red-500 hover:bg-red-950/10 border border-transparent hover:border-red-900/30 h-8 text-xs font-bold uppercase">
                            Kill
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    )
}
