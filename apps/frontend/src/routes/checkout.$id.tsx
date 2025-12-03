import { createFileRoute } from '@tanstack/react-router'
import CheckoutPage from '@/components/features/checkout/CheckoutPage'
import { getReservationQueryOptions } from '@/api/queries/reservation'
import { getTripQueryOptions } from '@/api/queries/trip'

export const Route = createFileRoute('/checkout/$id')({
  component: CheckoutRoute,
  gcTime: 5_000,
  loader: async ({ context: { queryClient }, params }) => {
    if (!params.id) throw new Error('Reservation ID is required')

    const reservation = await queryClient.fetchQuery(getReservationQueryOptions(params.id))

    if (!reservation?.trip?.id) {
      throw new Error('Trip not found')
    }

    const trip = await queryClient.fetchQuery(getTripQueryOptions(reservation.trip.id))

    return { reservation: { ...reservation, trip } }
  },
})

function CheckoutRoute() {
  const { reservation } = Route.useLoaderData()
  return <CheckoutPage reservation={reservation} />
}
