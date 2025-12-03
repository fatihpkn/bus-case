import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Ticket, User2 } from 'lucide-react'

interface BookingDetailsProps {
  reservation: any
}

function BookingDetails({ reservation }: BookingDetailsProps) {
  const { t } = useTranslation()

  const pnr = reservation?.pnr as string | undefined
  const status = (reservation?.status as string | undefined) ?? 'confirmed'
  const passengers = reservation?.passengers ?? []
  const seats = reservation?.seats ?? []
  const seatCount = seats.length || passengers.length || 1
  const totalAmount: number = reservation?.totalAmount ?? 0

  const statusLabelKey = status === 'confirmed' ? 'confirmation.status.confirmed' : status === 'pending' ? 'confirmation.status.pending' : 'confirmation.status.cancelled'

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Ticket className="h-5 w-5 text-primary" />
          <CardTitle>{t('confirmation.booking.title', 'Rezervasyon Özeti')}</CardTitle>
        </div>
        {pnr && (
          <Badge variant="secondary" className="text-xs font-mono">
            {t('confirmation.booking.pnr', 'PNR')}: {pnr}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-3 text-sm">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">{t('confirmation.booking.statusLabel', 'Durum')}</p>
          <Badge variant={status === 'confirmed' ? 'default' : status === 'pending' ? 'secondary' : 'destructive'} className="text-xs">
            {t(statusLabelKey)}
          </Badge>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">{t('confirmation.booking.passengersLabel', 'Yolcu Sayısı')}</p>
          <div className="flex items-center gap-1">
            <User2 className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{passengers.length}</span>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">{t('confirmation.booking.amountLabel', 'Toplam Tutar')}</p>
          <p className="font-semibold text-primary">₺{totalAmount}</p>
          <p className="text-[10px] text-muted-foreground">{t('confirmation.booking.seatCount', { count: seatCount })}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default BookingDetails
