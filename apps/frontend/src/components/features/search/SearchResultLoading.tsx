import { Skeleton } from '@/components/ui/skeleton'

export default function SearchResultsLoading() {
  const items = Array.from({ length: 5 })

  return (
    <div className="space-y-4">
      {items.map((_, index) => (
        <Skeleton key={index} className="h-48 w-full" />
      ))}
    </div>
  )
}
