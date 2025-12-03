import { getAgencyBySlugQueryOptions } from '@/api/queries/agencies'
import { searchTripQueryOptions } from '@/api/queries/search'
import { SearchForm, type LocationOption, type SearchFormValues } from '@/components/features/search/form/SearchForm'
import { SearchSort, type SortParam } from '@/components/features/search/SearchSort'
import SearchResultsLoading from '@/components/features/search/SearchResultLoading'
import { SearchResults } from '@/components/features/search/SearchResults'
import { Await, createFileRoute, useNavigate } from '@tanstack/react-router'
import { endOfDay, startOfDay } from 'date-fns'
import { MoveRight } from 'lucide-react'
import { Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

const searchSchema = z.object({
  departure: z.string().default(new Date().toISOString().split('T')[0]),
  from: z.string(),
  to: z.string(),
  sort: z.enum(['priceAsc', 'priceDesc', 'departureAsc', 'departureDesc']).default('priceAsc'),
})

const SORT_MAPPING: Record<SortParam, { order: 'ASC' | 'DESC'; orderBy: 'price' | 'departure' }> = {
  priceAsc: { order: 'ASC', orderBy: 'price' },
  priceDesc: { order: 'DESC', orderBy: 'price' },
  departureAsc: { order: 'ASC', orderBy: 'departure' },
  departureDesc: { order: 'DESC', orderBy: 'departure' },
}

export const Route = createFileRoute('/search')({
  component: SearchPage,
  validateSearch: searchSchema,
  staleTime: 15_000,
  loaderDeps: ({ search }) => search,
  loader: async ({ context: { queryClient }, deps }) => {
    const departureDate = startOfDay(new Date(deps.departure))
    const departureEndDate = endOfDay(new Date(deps.departure))

    const sortKey = (deps.sort ?? 'priceAsc') as SortParam
    const { order, orderBy } = SORT_MAPPING[sortKey]

    const data = queryClient.fetchQuery(
      searchTripQueryOptions({
        departure_gte: departureDate.toISOString(),
        departure_lte: departureEndDate.toISOString(),
        'fromAgency.slug_eq': deps.from,
        'toAgency.slug_eq': deps.to,
        relations: ['company', 'fromAgency', 'toAgency'],
        order,
        orderBy,
      }),
    )

    const fromAgency = await queryClient.fetchQuery(getAgencyBySlugQueryOptions(deps.from))
    const toAgency = await queryClient.fetchQuery(getAgencyBySlugQueryOptions(deps.to))

    return { data, fromAgency, toAgency }
  },
})

function SearchPage() {
  const { data, fromAgency, toAgency } = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const { t } = useTranslation()

  const from = fromAgency.data?.find((a) => a.id !== null && a.city && a.slug === search.from) as LocationOption
  const to = toAgency.data?.find((a) => a.id !== null && a.city && a.slug === search.to) as LocationOption

  const defaultValues: Partial<SearchFormValues> = {
    departure: search.departure ? new Date(search.departure) : undefined,
    from: from || undefined,
    to: to || undefined,
  }

  const currentSort = (search.sort ?? 'priceAsc') as SortParam

  const handleSortChange = (nextSort: SortParam) => {
    if (nextSort === currentSort) return

    void navigate({
      to: Route.fullPath,
      search: (prev) => ({
        ...prev,
        sort: nextSort,
      }),
      replace: true,
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <SearchForm defaultValues={defaultValues} initialSort={currentSort} />
      </div>

      <div>
        <div className="mb-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-4 items-center">
            <h1 className="text-3xl font-bold mb-1">{t('features.search.results.title')}</h1>
            <span className="text-muted-foreground inline-flex items-center space-x-2">
              <span>{fromAgency.data?.at(0)?.name}</span>
              <MoveRight className="w-4 h-4" />
              <span>{toAgency.data?.at(0)?.name}</span>
            </span>
          </div>
          <SearchSort value={currentSort} onChange={handleSortChange} />
        </div>
        <Suspense fallback={<SearchResultsLoading />}>
          <Await promise={data}>
            {(search) => (
              <>
                <p className="text-muted-foreground mb-4">
                  {search.data?.length || 0} {t('features.search.results.title').toLowerCase()}
                </p>
                <SearchResults trips={search.data} />
              </>
            )}
          </Await>
        </Suspense>
      </div>
    </div>
  )
}
