import * as React from 'react'
import { CalendarIcon } from 'lucide-react'
import { format, isBefore, startOfDay } from 'date-fns'
import { Controller, useFormContext } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

import type { SearchFormFormValues, SearchFormValues } from './SearchForm'

interface DatepickerProps {
  name: 'departure'
  placeholder: string
  errorMessage?: string
}

const today = startOfDay(new Date())

export function Datepicker({ name, placeholder, errorMessage }: DatepickerProps) {
  const [open, setOpen] = React.useState(false)
  const { control } = useFormContext<SearchFormValues>()

  const fieldId = `${name}-field`
  const errorId = errorMessage ? `${fieldId}-error` : undefined
  const describedBy = errorId || undefined

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                id={fieldId}
                type="button"
                variant="outline"
                aria-haspopup="dialog"
                aria-expanded={open}
                aria-invalid={Boolean(errorMessage)}
                aria-describedby={describedBy}
                className={cn(
                  'h-14 w-full justify-between rounded-lg border border-input bg-background px-4 font-normal shadow-sm text-base',
                  errorMessage && 'border-destructive',
                )}
              >
                {field.value ? format(field.value, 'dd MMM yyyy') : placeholder}
                <CalendarIcon className="ml-2 size-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={(day) => {
                  field.onChange(day ?? undefined)
                  if (day) {
                    setOpen(false)
                  }
                }}
                disabled={(date) => isBefore(startOfDay(date), today)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    />
  )
}
