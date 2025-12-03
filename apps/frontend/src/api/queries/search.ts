import API from '@/api'
import type { SearchParams } from '@/api/types/search'

export const searchTripQueryOptions = (params: SearchParams) =>
  API.queryOptions(
    'get',
    '/collections/trips',
    {
      params: {
        query: params,
      },
    },
    { staleTime: 5000 },
  )
