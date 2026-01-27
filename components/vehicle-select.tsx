'use client'

import { useState } from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { YEARS, MAKES_AND_MODELS, getModels } from '@/lib/vehicle-data'
import { Label } from '@/components/ui/label'

interface VehicleSelectProps {
    onVehicleChange: (info: string) => void
}

export function VehicleSelect({ onVehicleChange }: VehicleSelectProps) {
    const [year, setYear] = useState<string>('')
    const [make, setMake] = useState<string>('')
    const [model, setModel] = useState<string>('')

    const handleYearChange = (val: string) => {
        setYear(val)
        updateParent(val, make, model)
    }

    const handleMakeChange = (val: string) => {
        setMake(val)
        setModel('') // Reset model when make changes
        updateParent(year, val, '')
    }

    const handleModelChange = (val: string) => {
        setModel(val)
        updateParent(year, make, val)
    }

    const updateParent = (y: string, mk: string, md: string) => {
        if (y && mk && md) {
            onVehicleChange(`${y} ${mk} ${md}`)
        } else {
            onVehicleChange('')
        }
    }

    const makes = Object.keys(MAKES_AND_MODELS).sort()
    const models = make ? getModels(make) : []

    return (
        <div className="space-y-4 border border-zinc-900 bg-zinc-900/50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
                <p className="text-zinc-400 font-bold uppercase text-xs tracking-wide">My Garage (Optional)</p>
                <span className="text-[10px] text-red-500 font-mono uppercase bg-red-950/30 px-2 py-0.5 rounded border border-red-900/50">Race Team Exclusive</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
                {/* Year */}
                <div className="space-y-2">
                    <Label className="text-zinc-500 text-[10px] uppercase">Year</Label>
                    <Select onValueChange={handleYearChange}>
                        <SelectTrigger className="bg-black border-zinc-800 text-white h-9 text-xs focus:ring-red-600">
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-950 border-zinc-800 text-white max-h-[200px]">
                            {YEARS.map(y => (
                                <SelectItem key={y} value={y}>{y}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Make */}
                <div className="space-y-2">
                    <Label className="text-zinc-500 text-[10px] uppercase">Make</Label>
                    <Select onValueChange={handleMakeChange} disabled={!year}>
                        <SelectTrigger className="bg-black border-zinc-800 text-white h-9 text-xs focus:ring-red-600">
                            <SelectValue placeholder="Make" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-950 border-zinc-800 text-white max-h-[200px]">
                            {makes.map(m => (
                                <SelectItem key={m} value={m}>{m}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Model */}
                <div className="space-y-2">
                    <Label className="text-zinc-500 text-[10px] uppercase">Model</Label>
                    <Select onValueChange={handleModelChange} disabled={!make}>
                        <SelectTrigger className="bg-black border-zinc-800 text-white h-9 text-xs focus:ring-red-600">
                            <SelectValue placeholder="Model" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-950 border-zinc-800 text-white max-h-[200px]">
                            {models.map(m => (
                                <SelectItem key={m} value={m}>{m}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <input type="hidden" name="vehicle_string" value={year && make && model ? `${year} ${make} ${model}` : ''} />
        </div>
    )
}
