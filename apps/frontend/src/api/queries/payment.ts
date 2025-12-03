import API from '@/api'
import type { QueryClient } from '@tanstack/react-query'
import { getReservationQueryOptions } from './reservation'
import { getTripQueryOptions } from './trip'

export const getPaymentQueryOptions = (id: string) =>
  API.queryOptions(
    'get',
    '/collections/payments/{id}',
    {
      params: {
        path: { id },
        query: {
          relations: ['reservation'],
        },
      },
    },
    {
      staleTime: 0,
    },
  )

export const getPaymentDetailsQueryOptions = async (id: string, queryClient: QueryClient) => {
  const payment = await queryClient.fetchQuery(getPaymentQueryOptions(id))

  if (!payment?.reservation?.id) {
    throw new Error('Reservation not found')
  }

  const reservation = await queryClient.fetchQuery(getReservationQueryOptions(payment.reservation.id))

  if (!reservation.trip?.id) {
    throw new Error('Trip not found')
  }

  const trip = queryClient.ensureQueryData(getTripQueryOptions(reservation.trip.id))

  return new Promise((resolve) => {
    resolve({ payment, reservation: { ...reservation, trip } })
  })
}
