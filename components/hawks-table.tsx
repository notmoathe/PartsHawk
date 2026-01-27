'use client'

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Hawk } from "@/lib/types"

interface HawksTableProps {
    hawks: Hawk[]
}

export function HawksTable({ hawks }: HawksTableProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableCaption>A list of your active monitors.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Keywords</TableHead>
                        <TableHead>Max Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Found</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {hawks.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                No hawks active. Create one to start monitoring.
                            </TableCell>
                        </TableRow>
                    ) : (
                        hawks.map((hawk) => (
                            <TableRow key={hawk.id}>
                                <TableCell className="font-medium">{hawk.keywords}</TableCell>
                                <TableCell>${hawk.max_price}</TableCell>
                                <TableCell>
                                    <Badge variant={hawk.status === 'active' ? 'default' : 'secondary'}>
                                        {hawk.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>0 (Mock)</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm">Pause</Button>
                                    <Button variant="ghost" size="sm" className="text-red-500">Delete</Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
