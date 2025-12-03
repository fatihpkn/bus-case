import { getPaymentQueryOptions } from '@/api/queries/payment'
import { getReservationQueryOptions } from '@/api/queries/reservation'
import { getTripQueryOptions } from '@/api/queries/trip'
import ConfirmationPage from '@/components/features/confirmation/ConfirmationPage'
import { Skeleton } from '@/components/ui/skeleton'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/payment/$id')({
  component: ConfirmationRoute,
  pendingComponent: () => (
    <>
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-44 w-full" />
      <Skeleton className="h-40 w-full" />
    </>
  ),
  loader: async ({ context: { queryClient }, params: { id } }) => {
    if (!id) throw new Error('Payment ID is required')

    const payment = await queryClient.fetchQuery(getPaymentQueryOptions(id))

    if (!payment?.reservation?.id) {
      throw new Error('Reservation not found')
    }

    const reservation = await queryClient.fetchQuery(getReservationQueryOptions(payment.reservation.id))

    if (!reservation.trip?.id) {
      throw new Error('Trip not found')
    }

    const trip = await queryClient.fetchQuery(getTripQueryOptions(reservation.trip.id))

    return { payment, reservation: { ...reservation, trip } }
  },
})

function ConfirmationRoute() {
  const { reservation, payment } = Route.useLoaderData()

  return (
    <>
      <ConfirmationPage key={payment?.id} reservation={reservation} payment={payment} />
    </>
  )
}
