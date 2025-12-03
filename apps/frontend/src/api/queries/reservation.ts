import API from '@/api'

export const getReservationQueryOptions = (id: string) =>
  API.queryOptions(
    'get',
    '/collections/reservations/{id}',
    {
      params: {
        path: { id },
        query: {
          relations: ['passengers', 'contact', 'trip', 'seats'],
        },
      },
    },
    {
      staleTime: 0,
    },
  )
