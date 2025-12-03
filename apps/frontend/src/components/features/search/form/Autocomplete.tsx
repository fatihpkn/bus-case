import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'

import API from '@/api'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/useDebounce'
import { Controller, useFormContext } from 'react-hook-form'

import type { LocationOption, SearchFormFormValues } from './SearchForm'

interface AutocompleteProps {
  name: 'from' | 'to'
  placeholder: string
  emptyText: string
  minChars: number
  minCharsMessage: string
  errorMessage?: string
}

export function Autocomplete({ name, placeholder, emptyText, minChars, minCharsMessage, errorMessage }: AutocompleteProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState('')

  const debouncedValue = useDebounce(inputValue, 300)
  const minCharsReached = debouncedValue.length >= minChars

  const { control } = useFormContext<SearchFormFormValues>()

  const { data, isFetching } = API.useQuery(
    'get',
    '/collections/agencies',
    {
      params: {
        query: {
          name_like: `%${debouncedValue}%`,
        },
      },
    },
    { enabled: minCharsReached },
  )

  React.useEffect(() => {
    if (!open) {
      setInputValue('')
    }
  }, [open])

  const agencies = data?.data ?? []
  const fieldId = `${name}-field`
  const errorId = errorMessage ? `${fieldId}-error` : undefined
  const describedBy = errorId || undefined

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const currentValue = (field.value ?? undefined) as LocationOption | undefined
        const selectedLabel = currentValue?.name ?? placeholder
        const commandValue = currentValue?.name ?? ''
        const hasValue = Boolean(currentValue)

        return (
          <div>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  id={fieldId}
                  type="button"
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  aria-invalid={Boolean(errorMessage)}
                  aria-describedby={describedBy}
                  className={cn(
                    'h-14 w-full justify-between rounded-lg border border-input bg-background px-4 text-left font-normal shadow-sm text-base',
                    !hasValue && 'text-muted-foreground',
                    errorMessage && 'border-destructive',
                  )}
                >
                  <span>{selectedLabel}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command value={commandValue ?? ''} shouldFilter={false}>
                  <CommandInput
                    placeholder={placeholder}
                    value={inputValue}
                    onValueChange={(value) => {
                      setInputValue(value.charAt(0).toLocaleUpperCase('tr-TR') + value.slice(1))
                    }}
                    className="h-14 text-base"
                  />
                  <CommandList>
                    <CommandEmpty className="px-4 py-3 text-sm text-muted-foreground">{minCharsReached ? (isFetching ? '...' : emptyText) : minCharsMessage}</CommandEmpty>
                    {minCharsReached && agencies.length > 0 && (
                      <CommandGroup>
                        {agencies.map((agency) => (
                          <CommandItem
                            key={agency.id}
                            value={agency.slug!}
                            onSelect={() => {
                              field.onChange(agency)
                              setOpen(false)
                            }}
                          >
                            {agency.name}
                            <Check className={cn('ml-auto size-4', currentValue?.id === agency.id ? 'opacity-100' : 'opacity-0')} />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        )
      }}
    />
  )
}
