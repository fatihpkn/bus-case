import API from '@/api'
import type { AgenciesParams } from '@/api/types/agency'

export const agenciesQueryOptions = (params: AgenciesParams) =>
  API.queryOptions('get', '/collections/agencies', {
    params: {
      query: params,
    },
  })

export const getAgencyBySlugQueryOptions = (slug: string) =>
  API.queryOptions('get', '/collections/agencies', {
    params: {
      query: {
        slug_eq: slug,
        perPage: 1,
      },
    },
  })
