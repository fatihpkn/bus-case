import { createFileRoute, isRedirect, redirect } from '@tanstack/react-router'
import { z } from 'zod'
import API from '@/api'
import { sleep } from '@/lib/sleep'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const reservationSchema = z.object({
  tripId: z.string(),
  seatIds: z.array(z.string()),
})

function ReservationPending() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center max-w-md">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{t('features.reservation.pending.title', 'Rezervasyonunuz oluşturuluyor')}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('features.reservation.pending.description', 'Lütfen bekleyin, koltuklarınız ayrılıyor ve detay sayfasına yönlendiriliyorsunuz.')}
          </p>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/reservation/')({
  component: () => <ReservationPending />,
  pendingComponent: () => <ReservationPending />,
  pendingMs: 0,
  validateSearch: reservationSchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ context: { queryClient }, deps }) => {
    try {
      // Simulate API call for showing loading state
      await sleep(300)

      const reservation = await queryClient.fetchQuery(
        API.queryOptions('post', '/collections/reservations', {
          body: {
            tripId: deps.tripId,
            seatIds: deps.seatIds,
            status: 'pending',
          },
        }),
      )

      if (reservation.id) {
        throw redirect({
          to: '/reservation/$id',
          params: {
            id: reservation.id,
          },
        })
      }
    } catch (error) {
      if (isRedirect(error)) {
        throw error
      }

      console.error('Failed to create reservation:', error)
      throw error instanceof Error ? error : new Error('Rezervasyon oluşturulamadı')
    }
  },
})
