import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Clock, MapPin, Building, ChevronDown, ChevronUp, X } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import API from '@/api'
import { Link } from '@tanstack/react-router'

export type Trip = {
  id?: string | null
  departure?: string | null
  arrival?: string | null
  price?: number | null
  company?: {
    id?: string | null
    name?: string | null
    color?: string | null
  }
  fromAgency?: {
    id?: string | null
    name?: string | null
    city?: string | null
  }
  toAgency?: {
    id?: string | null
    name?: string | null
    city?: string | null
  }
}

interface SearchCardProps {
  trip: Trip
}

export function SearchCard({ trip }: SearchCardProps) {
  if (!trip.id) {
    return null
  }

  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [showSeatLimitAlert, setShowSeatLimitAlert] = useState(false)

  const toggleExpand = () => setIsExpanded(!isExpanded)

  // Tek endpoint ile seat-schema ve seats verilerini çek
  const { data } = API.useQuery(
    'get',
    '/collections/seat-schemas',
    {
      params: {
        query: {
          'trip.id_eq': trip.id,
          relations: ['trip', 'seats', 'seatLayouts'],
          perPage: 1,
        },
      },
    },
    {
      enabled: !!trip.id && isExpanded,
    },
  )

  const handleSeatClick = (seatId: string) => {
    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((s) => s !== seatId)
      }

      if (prev.length >= 4) {
        setShowSeatLimitAlert(true)
        return prev
      }

      return [...prev, seatId]
    })
  }

  const seatSchema = data?.data?.[0]

  const layout = seatSchema?.seatLayouts?.[0]
  const grid: string[][] = layout?.cells ? JSON.parse(layout.cells) : []
  const seatsList: any[] = seatSchema?.seats || []

  // React-friendly seatsMap with useMemo
  const seatsMap = useMemo(() => {
    const map = new Map<string, any>()
    seatsList.forEach((seat: any) => {
      map.set(`${seat.row}-${seat.col}`, seat)
    })
    return map
  }, [seatsList])

  return (
    <Card className="hover:shadow-lg transition-shadow overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Building className="h-5 w-5" style={{ color: trip.company?.color || '#6b7280' }} />
            {trip.company?.name}
          </CardTitle>
          <Badge variant="secondary" className="text-lg font-semibold">
            {trip.price?.toFixed(2)}₺
          </Badge>
        </div>
        <CardDescription>
          {t('features.search.results.route')}: {trip.fromAgency?.city} → {trip.toAgency?.city}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{trip.fromAgency?.name}</span>
            <span className="text-muted-foreground">→</span>
            <span className="font-medium">{trip.toAgency?.name}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">
                  {trip.departure
                    ? new Date(trip.departure).toLocaleTimeString('tr-TR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '--:--'}
                </div>
                <div className="text-muted-foreground text-xs">{t('features.search.results.departure')}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">
                  {trip.arrival
                    ? new Date(trip.arrival).toLocaleTimeString('tr-TR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '--:--'}
                </div>
                <div className="text-muted-foreground text-xs">{t('features.search.results.arrival')}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end pt-2">
            <Button size="sm" className="w-full md:w-auto inline-flex items-center gap-2" onClick={toggleExpand}>
              {isExpanded ? t('features.search.results.actions.closeSeats') : t('features.search.results.actions.selectSeats')}
              {isExpanded ? <ChevronUp /> : <ChevronDown />}
            </Button>
          </div>

          {isExpanded && (
            <div className="mt-4 border-t pt-4 animate-in slide-in-from-top-2 duration-200">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 bg-slate-50 p-4 rounded-lg">
                  {showSeatLimitAlert && (
                    <Alert className="mb-4 relative bg-amber-300/5 border border-amber-300 text-amber-500">
                      <AlertTitle>{t('features.search.results.seats.maxSeatsTitle', 'Maksimum 4 koltuk seçebilirsiniz.')}</AlertTitle>
                      <AlertDescription className="text-amber-600/80 dark:text-amber-400/80">
                        {t('features.search.results.seats.maxSeatsDescription', 'Daha fazla koltuk seçmek için mevcut seçimlerden bazılarını kaldırın.')}
                      </AlertDescription>
                      <button
                        type="button"
                        className="absolute right-3 top-3 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                        onClick={() => setShowSeatLimitAlert(false)}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </Alert>
                  )}

                  <div className="flex justify-center mb-4">
                    <div className="flex gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded bg-white border border-gray-300"></div>
                        <span>{t('features.search.results.seats.available')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded bg-gray-300 cursor-not-allowed"></div>
                        <span>{t('features.search.results.seats.taken')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded bg-primary text-primary-foreground"></div>
                        <span>{t('features.search.results.seats.selected')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full overflow-x-auto">
                    <div className="inline-flex flex-col bg-white p-4 rounded-xl shadow-sm border border-slate-200 min-w-max">
                      {grid.length > 0 &&
                        grid[0] &&
                        Array.from({ length: grid[0].length }).map((_, rowIndex) => (
                          <div key={rowIndex} className="flex items-center gap-1 mb-1">
                            {rowIndex === grid[0].length - 1 && (
                              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center mr-2 shrink-0">
                                <span className="text-[8px]"></span>
                              </div>
                            )}
                            {rowIndex !== grid[0].length - 1 && <div className="w-8 h-8 mr-2 shrink-0" />}

                            {grid.map((column: string[], colIndex: number) => {
                              const cellType = column[rowIndex]

                              if (cellType === 'corridor') {
                                return <div key={colIndex} className="w-8 h-2" />
                              }

                              if (cellType === 'door') {
                                return (
                                  <div key={colIndex} className="w-8 h-8 flex items-center justify-center">
                                    <div className="w-6 h-6 rounded flex items-center justify-center">
                                      <span className="text-[8px] text-slate-400">{t('features.search.results.seats.door')}</span>
                                    </div>
                                  </div>
                                )
                              }

                              const seat = seatsMap.get(`${rowIndex + 1}-${colIndex + 1}`)

                              if (!seat) {
                                return <div key={colIndex} className="w-8 h-8" />
                              }

                              return (
                                <SeatButton
                                  key={seat.id}
                                  number={seat.seatNo}
                                  status={seat.status}
                                  isSelected={selectedSeats.includes(seat.id)}
                                  onClick={handleSeatClick}
                                  seatId={seat.id}
                                />
                              )
                            })}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Sağ Taraf: Özet */}
                <div className="w-full md:w-72 space-y-4">
                  <div className="bg-slate-50 p-4 rounded-lg space-y-4">
                    <h4 className="font-semibold">{t('features.search.results.summary.selectedSeats')}</h4>
                    {selectedSeats.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedSeats
                          .map((seatId) => {
                            // Find seat object by ID to get seat number
                            const seat = seatsList.find((s: any) => s.id === seatId)
                            return seat ? { id: seatId, number: seat.seatNo } : null
                          })
                          .filter(Boolean)
                          .sort((a, b) => (a?.number || 0) - (b?.number || 0))
                          .map((seat) => (
                            <Badge key={seat?.id} variant="default" className="text-sm">
                              {t('features.search.results.summary.seatLabel', { number: seat?.number })}
                            </Badge>
                          ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">{t('features.search.results.summary.noneSelected')}</p>
                    )}

                    <div className="border-t pt-4 mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{t('features.search.results.summary.count')}</span>
                        <span>{selectedSeats.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>{t('features.search.results.summary.unitPrice')}</span>
                        <span>{trip.price?.toFixed(2)}₺</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg pt-2 border-t">
                        <span>{t('features.search.results.summary.total')}</span>
                        <span>{((trip.price || 0) * selectedSeats.length).toFixed(2)}₺</span>
                      </div>
                    </div>

                    <Button asChild className="w-full" disabled={selectedSeats.length === 0}>
                      <Link to="/reservation" preload={false} search={{ tripId: trip.id, seatIds: selectedSeats }}>
                        {t('features.search.results.actions.continue')}
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface SeatButtonProps {
  number: number
  status: string
  isSelected: boolean
  onClick: (seatId: string) => void
  seatId: string
}

function SeatButton({ number, status, isSelected, onClick, seatId }: SeatButtonProps) {
  const isTaken = status === 'taken'

  return (
    <button
      type="button"
      disabled={isTaken}
      onClick={() => onClick(seatId)}
      className={cn(
        'w-8 h-8 rounded-md flex items-center justify-center text-xs font-medium transition-colors',
        isTaken
          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
          : isSelected
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'bg-white border border-slate-300 hover:border-primary hover:text-primary',
      )}
    >
      {number}
    </button>
  )
}
