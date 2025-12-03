import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Clock, Bus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Trip } from '@/api/types/trip'
import { format, intervalToDuration, formatDuration } from 'date-fns'

interface TripSummaryProps {
  trip: Trip
}

function TripSummary({ trip }: TripSummaryProps) {
  const { t } = useTranslation()

  if (!trip) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bus className="h-5 w-5" />
            {t('reservation.tripSummary', 'Sefer Bilgileri')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">{t('reservation.tripSummary.empty', 'Sefer bilgisi bulunamadı')}</div>
        </CardContent>
      </Card>
    )
  }

  const departure = trip.departure ? new Date(trip.departure) : null
  const arrival = trip.arrival ? new Date(trip.arrival) : null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bus className="h-5 w-5" />
          {t('reservation.tripSummary', 'Sefer Bilgileri')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{trip.company?.code}</Badge>
            <span className="font-medium">{trip.company?.name}</span>
          </div>
          {departure && <span className="text-sm text-muted-foreground md:text-right">{format(departure, 'EEEE, d MMMM yyyy')}</span>}
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{trip.fromAgency?.name}</span>
            </div>
            <div className="text-sm text-muted-foreground ml-6">{trip.fromAgency?.city}</div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <Clock className="h-4 w-4 text-muted-foreground" />
            {departure && arrival && (
              <span className="text-sm font-medium mt-1">
                {formatDuration(
                  intervalToDuration({
                    start: departure,
                    end: arrival,
                  }),
                  { format: ['hours', 'minutes'] },
                )}
              </span>
            )}
          </div>

          <div className="flex-1 text-left md:text-right">
            <div className="flex items-center gap-2 mb-1 md:justify-end">
              <span className="font-medium">{trip.toAgency?.name}</span>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-sm text-muted-foreground md:mr-6">{trip.toAgency?.city}</div>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2 border-t md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-muted-foreground">
            <Clock className="h-4 w-4 inline mr-1" />
            {departure && arrival && (
              <>
                {format(departure, 'HH:mm')} - {format(arrival, 'HH:mm')}
              </>
            )}
          </div>
          <div className="text-lg font-bold text-primary md:text-right">₺{trip.price}</div>
        </div>
      </CardContent>
    </Card>
  )
}

export default TripSummary
