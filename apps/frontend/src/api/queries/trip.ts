import API from '@/api'

const today = new Date()

export const getTripQueryOptions = (id: string) =>
  API.queryOptions('get', '/collections/trips/{id}', {
    params: {
      path: { id },
      query: {
        relations: ['company', 'fromAgency', 'toAgency', 'seats', 'reservations', 'seatSchemas'],
      },
    },
  })

export const getPopularTrips = () =>
  API.queryOptions('get', '/collections/trips', {
    params: {
      query: {
        departure_gt: today.toISOString(),
        relations: ['fromAgency', 'toAgency', 'company'],
        order: 'ASC',
        orderBy: 'departure',
      },
    },
  })
