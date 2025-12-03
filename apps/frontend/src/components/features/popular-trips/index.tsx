import { getPopularTrips } from '@/api/queries/trip'
import { Card, CardContent } from '@/components/ui/card'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ArrowRight, MapPin } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { Trip } from '@/api/types/trip'
import { format } from 'date-fns'

function getCitySeed(cityName: string): number {
  let hash = 0
  for (let i = 0; i < cityName.length; i++) {
    const char = cityName.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return (Math.abs(hash) % 1000) + 1
}

function getUniqueRoutes(trips: Trip[]) {
  const routes = new Map<string, { from: Trip['fromAgency']; to: Trip['toAgency']; price: Trip['price']; departure: Trip['departure'] }>()

  trips.forEach((trip) => {
    if (!trip.fromAgency?.city || !trip.toAgency?.city) return

    const routeKey = `${trip.fromAgency.city}-${trip.toAgency.city}`
    if (!routes.has(routeKey)) {
      routes.set(routeKey, {
        from: trip.fromAgency,
        to: trip.toAgency,
        price: trip.price,
        departure: trip.departure,
      })
    }
  })

  return Array.from(routes.values()).slice(0, 8)
}

export default function PopularTrips() {
  const { t } = useTranslation()
  const { data } = useSuspenseQuery(getPopularTrips())

  const uniqueRoutes = useMemo(() => getUniqueRoutes(data?.data || []), [data?.data])

  return (
    <div className="mt-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-center mb-2">{t('features.popularTrips.title', 'Popüler Seferler')}</h2>
        <p className="text-muted-foreground text-center">{t('features.popularTrips.subtitle', 'En çok tercih edilen şehirlerarası seferleri keşfedin')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {uniqueRoutes.map((route) => {
          if (!route.from || !route.to) return null

          const toSeed = getCitySeed(route.to?.city || '')

          return (
            <Card key={`${route.from.city}-${route.to.city}`} className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="relative h-48 overflow-hidden">
                {/* Sadece gidiş şehrinin fotoğrafı */}
                <img
                  src={`https://static.photos/cityscape/320x240/${toSeed}`}
                  alt={t('features.popularTrips.imageAlt', { city: route.from.city })}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />

                {/* Şehir isimleri overlay */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <div>
                      <div className="font-semibold text-lg">{route.from.city}</div>
                      <div className="text-sm opacity-90">{route.from.district}</div>
                    </div>
                  </div>

                  <ArrowRight className="h-5 w-5 text-white/80" />

                  <div className="flex items-center gap-2 text-right">
                    <div>
                      <div className="font-semibold text-lg">{route.to.city}</div>
                      <div className="text-sm opacity-90">{route.to.district}</div>
                    </div>
                    <MapPin className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="flex items-center  mb-3">
                  <div>
                    <div className="text-lg font-bold text-primary">{route?.price?.toFixed(0)}₺</div>
                    <div className="text-xs text-muted-foreground">{t('features.popularTrips.price.from', 'dan başlayan fiyatlar')}</div>
                  </div>
                </div>

                <Link
                  to="/search"
                  search={{
                    from: route.from.slug!,
                    to: route.to.slug!,
                    departure: format(route.departure!, 'yyyy-MM-dd'),
                  }}
                  className="block w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-center font-medium transition-colors"
                >
                  {t('features.popularTrips.cta', 'Seferleri Görüntüle')}
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {uniqueRoutes.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{t('features.popularTrips.empty', 'Henüz sefer bulunmamaktadır.')}</p>
        </div>
      )}
    </div>
  )
}
