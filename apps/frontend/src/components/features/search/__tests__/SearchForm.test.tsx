import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'

import { SearchForm, type SearchFormFormValues } from '@/components/features/search/form/SearchForm'

describe('SearchForm', () => {
  it('gerekli alanlar boşken submit edildiğinde hata mesajını gösterir', async () => {
    const user = userEvent.setup()

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })

    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <SearchForm />
      </QueryClientProvider>,
    )

    const form = container.querySelector('form') as HTMLFormElement
    const submitButton = within(form).getByRole('button', {
      name: 'features.search.form.submit',
    })

    await user.click(submitButton)

    const error = await screen.findByText('features.search.form.errors.fromRequired')

    expect(error).toBeTruthy()
  })

  it('sadece from doluyken toRequired hatasını gösterir', async () => {
    const user = userEvent.setup()

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })

    const defaultValues: Partial<SearchFormFormValues> = {
      from: {
        id: '1',
        city: 'City A',
        name: 'From',
        slug: 'from',
      },
    }

    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <SearchForm defaultValues={defaultValues} />
      </QueryClientProvider>,
    )

    const form = container.querySelector('form') as HTMLFormElement
    const submitButton = within(form).getByRole('button', {
      name: 'features.search.form.submit',
    })

    await user.click(submitButton)

    const error = await screen.findByText('features.search.form.errors.toRequired')
    expect(error).toBeTruthy()
  })

  it('aynı güzergah seçildiğinde sameRoute hatasını gösterir', async () => {
    const user = userEvent.setup()

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })

    const sameLocation = {
      id: '1',
      city: 'City A',
      name: 'Terminal A',
      slug: 'terminal-a',
    }

    const defaultValues: Partial<SearchFormFormValues> = {
      from: sameLocation,
      to: sameLocation,
    }

    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <SearchForm defaultValues={defaultValues} />
      </QueryClientProvider>,
    )

    const form = container.querySelector('form') as HTMLFormElement
    const submitButton = within(form).getByRole('button', {
      name: 'features.search.form.submit',
    })

    await user.click(submitButton)

    const error = await screen.findByText('features.search.form.errors.sameRoute')
    expect(error).toBeTruthy()
  })

  it('geçmiş tarih seçildiğinde dateInvalid hatasını gösterir', async () => {
    const user = userEvent.setup()

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })

    const defaultValues: Partial<SearchFormFormValues> = {
      departure: new Date('2000-01-01'),
      from: {
        id: '1',
        city: 'City A',
        name: 'From',
        slug: 'from',
      },
      to: {
        id: '2',
        city: 'City B',
        name: 'To',
        slug: 'to',
      },
    }

    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <SearchForm defaultValues={defaultValues} />
      </QueryClientProvider>,
    )

    const form = container.querySelector('form') as HTMLFormElement
    const submitButton = within(form).getByRole('button', {
      name: 'features.search.form.submit',
    })

    await user.click(submitButton)

    const error = await screen.findByText('features.search.form.errors.dateInvalid')
    expect(error).toBeTruthy()
  })
})
