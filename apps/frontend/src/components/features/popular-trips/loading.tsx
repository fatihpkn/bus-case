import { Skeleton } from '@/components/ui/skeleton'

export default function PopularTripsLoading() {
  const items = Array.from({ length: 8 })

  return (
    <div className="flex flex-col items-center mt-12">
      <Skeleton className="h-9 w-10/12 md:w-2/12 mb-4" />
      <Skeleton className="h-6 w-10/12 md:w-5/12 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        {items.map((_, index) => (
          <Skeleton key={index} className="h-48" />
        ))}
      </div>
    </div>
  )
}
