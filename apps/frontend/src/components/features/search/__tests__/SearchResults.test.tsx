import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

import { SearchResults } from '@/components/features/search/SearchResults'

vi.mock('../SearchCard', () => ({
  SearchCard: ({ trip }: any) => <div data-testid="search-card">{trip.id}</div>,
}))

describe('SearchResults', () => {
  it('trips boşken noResults mesajını gösterir', () => {
    render(<SearchResults trips={[]} />)

    const message = screen.getByText('features.search.results.noResults')
    expect(message).toBeTruthy()
  })

  it('trips doluyken her trip için bir SearchCard render eder', () => {
    const trips = [{ id: '1' }, { id: '2' }] as any

    render(<SearchResults trips={trips} />)

    const cards = screen.getAllByTestId('search-card')
    expect(cards.length).toBe(2)
  })
})
