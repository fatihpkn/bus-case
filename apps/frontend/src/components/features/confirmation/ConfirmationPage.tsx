import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { TripSummary, SeatSelection, PriceBreakdown } from '@/components/features/reservation'
import type { Trip } from '@/api/types/trip'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Mail, Phone } from 'lucide-react'
import BookingDetails from './BookingDetails'

interface ConfirmationPageProps {
  reservation: any
  payment?: any
}

function ConfirmationPage({ reservation, payment }: ConfirmationPageProps) {
  const { t } = useTranslation()

  const trip = (reservation?.trip ?? null) as Trip | null
  const seats = reservation?.seats ?? []
  const seatCount = seats.length || 1
  const passengers = reservation?.passengers ?? []
  const contact = reservation?.contact
  const pnr = reservation?.pnr as string | undefined

  const totalAmount: number = reservation?.totalAmount ?? (trip && typeof trip.price === 'number' ? trip.price * seatCount : 0)

  return (
    <div key={payment?.id} className="container mx-auto max-w-5xl py-10 px-4">
      <div className="flex flex-col items-center text-center mb-10 space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">{t('confirmation.title', 'Rezervasyonunuz Tamamlandı')}</h1>
          <p className="text-muted-foreground max-w-xl">
            {t('confirmation.subtitle', 'Bilet bilgileriniz aşağıda yer alıyor. Ayrıca e-posta ve SMS ile de sizinle paylaşacağız.')}
          </p>
        </div>
        {pnr && (
          <Badge variant="secondary" className="font-mono text-xs px-3 py-1">
            {t('confirmation.pnrLabel', 'PNR Kodunuz')}: {pnr}
          </Badge>
        )}
      </div>

      <div className="space-y-6">
        {trip && <TripSummary trip={trip} />}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <BookingDetails reservation={reservation} />

            <Card>
              <CardContent className="py-4 grid gap-4 md:grid-cols-2 text-sm">
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t('confirmation.passengers.title', 'Yolcular')}</p>
                  {passengers.length ? (
                    <ul className="space-y-1">
                      {passengers.map((p: any, index: number) => (
                        <li key={p.id ?? index} className="flex items-center justify-between">
                          <span className="font-medium">
                            {index + 1}. {p.firstName} {p.lastName}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">{t('confirmation.passengers.empty', 'Yolcu bilgisi bulunamadı.')}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t('confirmation.contact.title', 'İletişim Bilgileri')}</p>
                  {contact ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{contact.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{contact.phone}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">{t('confirmation.contact.empty', 'İletişim bilgisi bulunamadı.')}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button variant="default" asChild>
                <Link to={`/payment/print/$id`} target="_blank" params={{ id: payment.id }}>
                  {t('confirmation.actions.download', 'Bileti İndir')}
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/">{t('confirmation.actions.newSearch', 'Yeni Bilet Ara')}</Link>
              </Button>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-4">
            <SeatSelection seats={seats} />
            <PriceBreakdown totalAmount={totalAmount} seatCount={seatCount} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationPage
