import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DateRange {
    from: Date | undefined
    to: Date | undefined
}

interface DateRangePickerProps {
    startDate?: Date
    endDate?: Date
    onChange: (startDate?: Date, endDate?: Date) => void
    label?: string
}

const formatRange = (from?: Date, to?: Date) => {
    if (!from && !to) return ""
    if (from && !to) return from.toLocaleDateString()
    if (!from && to) return to.toLocaleDateString()
    return `${from?.toLocaleDateString()} - ${to?.toLocaleDateString()}`
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ startDate, endDate, onChange, label }) => {
    const [open, setOpen] = React.useState(false)
    const range: DateRange = { from: startDate, to: endDate }

    return (
        <div className="flex flex-col gap-3">
            {label && <Label className="px-1">{label}</Label>}
            <div className="relative flex gap-2">
                <Input
                    readOnly
                    value={formatRange(startDate, endDate)}
                    placeholder="Datum wählen"
                    className="bg-background pr-10"
                    onClick={() => setOpen(true)}
                />
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                        >
                            <CalendarIcon className="size-3.5" />
                            <span className="sr-only">Select date range</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto overflow-hidden p-0" align="end" alignOffset={-8} sideOffset={10}>
                        <Calendar
                            mode="range"
                            selected={range}
                            onSelect={(range) => {
                                onChange(range?.from, range?.to)
                                setOpen(false)
                            }}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    )
}

export default DateRangePicker