import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Armchair } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface SeatSelectionProps {
  seats: {
    id: string
    seatNo?: number
    row?: number
    col?: number
  }[]
}

function SeatSelection({ seats }: SeatSelectionProps) {
  const { t } = useTranslation()

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Armchair className="h-4 w-4" />
          {t('reservation.seatSelection', 'Seçili Koltuklar')}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
          {seats.map((seat) => (
            <div key={seat.id} className="flex flex-col items-center p-2 border rounded-md bg-primary/5 border-primary/20 text-xs">
              <Armchair className="h-4 w-4 text-primary mb-1" />
              <Badge variant="secondary" className="mb-0.5 text-[10px] px-1 py-0">
                {seat.seatNo}
              </Badge>
              <span className="text-[10px] text-muted-foreground">{t('reservation.seatPosition', 'Sıra {{row}}', { row: seat.row })}</span>
            </div>
          ))}
        </div>

        <div className="mt-3 pt-2 border-t">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{t('reservation.totalSeats', '{{count}} koltuk seçildi', { count: seats.length })}</span>
            <Badge variant="outline">{t('reservation.seatClass', 'Ekonomi')}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default SeatSelection
