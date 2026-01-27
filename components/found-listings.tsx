import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface Finding {
    id: string
    title: string
    price: number
    url: string
    image_url: string | null
    source: string
    created_at: string
}

export function FoundListings({ listings }: { listings: Finding[] }) {
    if (listings.length === 0) {
        return (
            <Card className="bg-zinc-950 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-white text-xl font-bold uppercase tracking-wide">Recent Discoveries</CardTitle>
                </CardHeader>
                <CardContent className="text-center py-12">
                    <div className="text-4xl mb-4 grayscale opacity-30">🕸️</div>
                    <p className="text-zinc-500 font-bold uppercase tracking-wide">No Items Captured Yet</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="bg-zinc-950 border-zinc-800">
            <CardHeader className="border-b border-zinc-900 pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-xl font-bold uppercase tracking-wide">Live Feed</CardTitle>
                    <Badge variant="outline" className="border-red-900 text-red-500 bg-red-950/10">
                        {listings.length} RECENT
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-zinc-900">
                    {listings.map((item) => (
                        <div key={item.id} className="p-4 flex gap-4 hover:bg-zinc-900/50 transition-colors group">
                            {/* Image */}
                            <div className="relative w-24 h-24 shrink-0 bg-zinc-900 rounded-sm overflow-hidden border border-zinc-800">
                                {item.image_url ? (
                                    <img
                                        src={item.image_url}
                                        alt={item.title}
                                        className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-700 font-mono text-xs">
                                        NO IMG
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-start justify-between gap-2">
                                        <h4 className="text-white font-bold text-sm line-clamp-2 leading-tight group-hover:text-red-500 transition-colors uppercase">
                                            {item.title}
                                        </h4>
                                        <span className="text-emerald-500 font-mono font-bold whitespace-nowrap">
                                            ${item.price.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="secondary" className="bg-zinc-800 text-zinc-400 rounded-sm text-[10px] uppercase font-bold tracking-wider">
                                            {item.source}
                                        </Badge>
                                        <span className="text-zinc-600 text-xs font-mono">
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-end mt-2">
                                    <Button asChild size="sm" className="h-7 bg-white text-black hover:bg-zinc-200 font-bold uppercase text-[10px] tracking-widest rounded-sm">
                                        <Link href={item.url} target="_blank" rel="noopener noreferrer">
                                            View Listing <ExternalLink className="w-3 h-3 ml-1" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
