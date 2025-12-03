import { getPopularTrips } from '@/api/queries/trip'
import PopularTrips from '@/components/features/popular-trips/index'
import { SearchForm } from '@/components/features/search/form/SearchForm'
import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'
import PopularTripsSkeleton from '@/components/features/popular-trips/loading'

export const Route = createFileRoute('/')({
  component: RouteComponent,
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(getPopularTrips())
  },
})

function RouteComponent() {
  return (
    <>
      <div className="flex">
        <div className="w-full">
          <SearchForm />
        </div>
      </div>
      <div className="mt-5 w-full">
        <Suspense fallback={<PopularTripsSkeleton />}>
          <PopularTrips />
        </Suspense>
      </div>
    </>
  )
}
