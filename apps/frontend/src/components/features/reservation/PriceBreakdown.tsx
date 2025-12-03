import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Receipt } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface PriceBreakdownProps {
  totalAmount: number
  seatCount: number
}

function PriceBreakdown({ totalAmount, seatCount }: PriceBreakdownProps) {
  const { t } = useTranslation()

  // TODO: Calculate breakdown based on actual pricing
  // For now, showing placeholder breakdown
  const effectiveSeatCount = seatCount || 1
  const pricePerSeat = effectiveSeatCount > 0 ? Math.round(totalAmount / effectiveSeatCount) || totalAmount : totalAmount
  const subtotal = effectiveSeatCount * pricePerSeat
  const serviceFee = 0
  const total = totalAmount || subtotal + serviceFee

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          {t('reservation.priceBreakdown', 'Fiyat Özeti')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">
            {t('reservation.seatPrice', '{{count}} koltuk × ₺{{price}}', {
              count: seatCount,
              price: pricePerSeat,
            })}
          </span>
          <span>₺{subtotal}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">{t('reservation.serviceFee', 'Hizmet Bedeli')}</span>
          <span>₺{serviceFee}</span>
        </div>

        <div className="border-t pt-3">
          <div className="flex justify-between items-center text-lg font-bold">
            <span>{t('reservation.total', 'Toplam')}</span>
            <span className="text-primary">₺{total}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default PriceBreakdown
