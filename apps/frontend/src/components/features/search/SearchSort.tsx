import { useTranslation } from 'react-i18next'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export const SORT_OPTIONS = ['priceAsc', 'priceDesc', 'departureAsc', 'departureDesc'] as const

export type SortParam = (typeof SORT_OPTIONS)[number]

type SortField = 'price' | 'departure'
type SortDirection = 'asc' | 'desc'

interface SearchSortProps {
  value: SortParam
  onChange: (value: SortParam) => void
}

function splitSort(value: SortParam): { field: SortField; direction: SortDirection } {
  const isPrice = value.startsWith('price')
  const isDesc = value.endsWith('Desc')

  return {
    field: isPrice ? 'price' : 'departure',
    direction: isDesc ? 'desc' : 'asc',
  }
}

function combineSort(field: SortField, direction: SortDirection): SortParam {
  if (field === 'price') {
    return direction === 'asc' ? 'priceAsc' : 'priceDesc'
  }

  return direction === 'asc' ? 'departureAsc' : 'departureDesc'
}

export function SearchSort({ value, onChange }: SearchSortProps) {
  const { t } = useTranslation()

  const { field, direction } = splitSort(value)

  const handleFieldChange = (nextField: SortField) => {
    const next = combineSort(nextField, direction)
    if (next === value) return
    onChange(next)
  }

  const handleDirectionChange = (nextDirection: SortDirection) => {
    const next = combineSort(field, nextDirection)
    if (next === value) return
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-2 text-sm md:flex-row md:items-center md:gap-3">
      <span className="text-muted-foreground">{t('features.search.sort.label', 'Sırala')}</span>
      <div className="flex gap-2">
        <Select value={field} onValueChange={(val) => handleFieldChange(val as SortField)}>
          <SelectTrigger className="h-8 w-32">
            <SelectValue placeholder={t('features.search.sort.field.placeholder', 'Alan') as string} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="price">{t('features.search.sort.field.price', 'Fiyat')}</SelectItem>
            <SelectItem value="departure">{t('features.search.sort.field.departure', 'Kalkış Saati')}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={direction} onValueChange={(val) => handleDirectionChange(val as SortDirection)}>
          <SelectTrigger className="h-8 w-32">
            <SelectValue placeholder={t('features.search.sort.direction.placeholder', 'Yön') as string} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">{t('features.search.sort.direction.asc', 'Artan')}</SelectItem>
            <SelectItem value="desc">{t('features.search.sort.direction.desc', 'Azalan')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
