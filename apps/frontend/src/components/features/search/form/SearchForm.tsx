import { FormProvider, useForm, type FieldError } from 'react-hook-form'
import { dynamicKey } from '@/i18n'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { format, isBefore, startOfDay } from 'date-fns'
import { useNavigate } from '@tanstack/react-router'
import type { SortParam } from '../SearchSort'

import { Button } from '@/components/ui/button'

import { Autocomplete } from './Autocomplete'
import { Datepicker } from './Datepicker'

const today = startOfDay(new Date())
const MIN_SEARCH_CHARS = 3

export type LocationOption = z.infer<typeof locationSchema>

const ERROR_KEYS = {
  locationRequired: dynamicKey('features.search.form.errors.locationRequired', 'Lütfen nereden gideceğinizi seçin'),
  fromRequired: dynamicKey('features.search.form.errors.fromRequired', 'Lütfen nereden gideceğinizi seçin'),
  toRequired: dynamicKey('features.search.form.errors.toRequired', 'Lütfen nereye gideceğinizi seçin'),
  sameRoute: dynamicKey('features.search.form.errors.sameRoute', 'Kalkış ve varış şehirleri aynı olamaz'),
  dateInvalid: dynamicKey('features.search.form.errors.dateInvalid', 'Lütfen geçerli bir tarih girin'),
}

const locationSchema = z.object(
  {
    id: z.string(),
    city: z.string(),
    name: z.string(),
    slug: z.string(),
  },
  { error: ERROR_KEYS.locationRequired },
)

const baseSearchSchema = z.object({
  departure: z.coerce
    .date()
    .default(() => today)
    .refine((date) => !Number.isNaN(date.getTime()), {
      message: ERROR_KEYS.dateInvalid,
    })
    .refine((date) => !isBefore(startOfDay(date), today), {
      message: ERROR_KEYS.dateInvalid,
    }),
  from: locationSchema.optional(),
  to: locationSchema.optional(),
})

const searchSchema = baseSearchSchema
  .superRefine((values, ctx) => {
    if (!values.from) {
      ctx.addIssue({
        code: 'custom',
        path: ['from'],
        message: ERROR_KEYS.fromRequired,
      })
    }
    if (!values.to) {
      ctx.addIssue({
        code: 'custom',
        path: ['to'],
        message: ERROR_KEYS.toRequired,
      })
    }
    if (values.from && values.to && (values.from.id === values.to.id || values.from.city === values.to.city)) {
      ctx.addIssue({
        code: 'custom',
        path: ['to'],
        message: ERROR_KEYS.sameRoute,
      })
    }
  })
  .transform((values) => ({
    ...values,
    from: values.from!,
    fromSlug: values.from!.slug!,
    to: values.to!,
    toSlug: values.to!.slug!,
  }))

export type SearchFormValues = z.infer<typeof baseSearchSchema>
export type SearchFormFormValues = z.input<typeof searchSchema>

const requiredErrorMap = {
  from: ERROR_KEYS.fromRequired,
  to: ERROR_KEYS.toRequired,
  departure: ERROR_KEYS.dateInvalid,
} as const

interface SearchFormProps {
  onSubmit?: (data: SearchFormValues) => void | Promise<void>
  initialSort?: SortParam
}

export const SearchForm = ({ onSubmit, defaultValues, initialSort = 'priceAsc' }: SearchFormProps & { defaultValues?: Partial<SearchFormFormValues> }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const form = useForm<SearchFormFormValues, unknown, SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      departure: today,
      ...defaultValues,
    },
  })

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form

  const getFieldErrorMessage = (field: keyof typeof requiredErrorMap) => {
    const error = errors[field] as FieldError | undefined
    if (!error) return undefined

    if (typeof error.message === 'string') {
      return t(error.message as any) as string
    }
  }

  const fromErrorMessage = getFieldErrorMessage('from')
  const toErrorMessage = getFieldErrorMessage('to')
  const departureErrorMessage = getFieldErrorMessage('departure')

  const handleFormSubmit = handleSubmit(async (data) => {
    await onSubmit?.(data)

    await navigate({
      to: '/search',
      search: {
        departure: format(data.departure, 'yyyy-MM-dd'),
        from: data.from!.slug,
        to: data.to!.slug,
        sort: initialSort,
      },
    })
  })

  return (
    <FormProvider {...form}>
      <form onSubmit={handleFormSubmit} className="w-full rounded-2xl border border-border bg-card p-6 shadow-lg space-y-8">
        <header className="space-y-2">
          <p className="text-sm font-medium text-primary tracking-wide uppercase">{t('features.search.form.title')}</p>
          <p className="text-muted-foreground text-sm md:text-base">{t('features.search.form.description')}</p>
        </header>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
          <div className="flex-1">
            <Autocomplete
              name="from"
              placeholder={t('features.search.form.from.placeholder')}
              emptyText={t('features.search.form.from.empty')}
              minCharsMessage={t('features.search.form.notifications.minSearch', { count: MIN_SEARCH_CHARS })}
              minChars={MIN_SEARCH_CHARS}
              errorMessage={fromErrorMessage}
            />
          </div>
          <div className="flex-1">
            <Autocomplete
              name="to"
              placeholder={t('features.search.form.to.placeholder')}
              emptyText={t('features.search.form.to.empty')}
              minCharsMessage={t('features.search.form.notifications.minSearch', { count: MIN_SEARCH_CHARS })}
              minChars={MIN_SEARCH_CHARS}
              errorMessage={toErrorMessage}
            />
          </div>
          <div className="lg:w-48">
            <Datepicker name="departure" placeholder={t('features.search.form.date.placeholder')} errorMessage={departureErrorMessage} />
          </div>
          <div className="lg:w-auto">
            <Button type="submit" size="lg" className="h-14 px-8 text-base font-semibold w-full md:w-auto" disabled={isSubmitting}>
              {t('features.search.form.submit')}
            </Button>
          </div>
        </div>

        {(fromErrorMessage || toErrorMessage || departureErrorMessage) && (
          <div className="text-sm text-destructive text-center">{fromErrorMessage || toErrorMessage || departureErrorMessage}</div>
        )}
      </form>
    </FormProvider>
  )
}
