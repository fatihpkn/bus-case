import { useTranslation } from 'react-i18next'

import { SearchCard, type Trip } from './SearchCard'

interface SearchResultsProps {
  trips?: Trip[]
}

export function SearchResults({ trips }: SearchResultsProps) {
  const { t } = useTranslation()

  if (!trips || trips.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground text-lg">{t('features.search.results.noResults')}</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {trips.map((trip) => (
        <SearchCard key={trip.id} trip={trip} />
      ))}
    </div>
  )
}
