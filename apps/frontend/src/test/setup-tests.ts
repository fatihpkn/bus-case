import { vi } from 'vitest'

// Global react-i18next partial mock
vi.mock('react-i18next', async () => {
  const actual = await vi.importActual<typeof import('react-i18next')>('react-i18next')

  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string) => key,
      i18n: {
        changeLanguage: () => Promise.resolve(),
      },
    }),
  }
})

// Global TanStack Router partial mock
vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual<typeof import('@tanstack/react-router')>('@tanstack/react-router')

  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})
