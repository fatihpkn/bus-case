import API from '@/api'
import { getReservationQueryOptions } from '@/api/queries/reservation'
import { getTripQueryOptions } from '@/api/queries/trip'
import { TripSummary } from '@/components/features/reservation'
import ReservationForm from '@/components/features/reservation/ReservationForm'
import { Skeleton } from '@/components/ui/skeleton'
import { Await, createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/reservation/$id')({
  component: ReservationPage,
  loader: async ({ context: { queryClient }, params }) => {
    const reservation = await queryClient.ensureQueryData(getReservationQueryOptions(params.id))

    if (!reservation?.trip?.id) throw new Error('Trip not found')

    const trip = queryClient.fetchQuery(getTripQueryOptions(reservation?.trip?.id))

    return { reservation, trip }
  },
})

function ReservationPage() {
  const { reservation, trip } = Route.useLoaderData()

  const { t } = useTranslation()

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('features.reservation.title', 'Rezervasyon')}</h1>
        <p className="text-muted-foreground">{t('features.reservation.description', 'Rezervasyon detayları')}</p>
      </div>

      <div className="mb-6">
        <Suspense fallback={<Skeleton className="h-60" />}>
          <Await promise={trip}>{(_trip) => <TripSummary trip={_trip} />}</Await>
        </Suspense>
      </div>

      <ReservationForm reservation={reservation} />
    </>
  )
}
