import { createFileRoute } from '@tanstack/react-router'

import { getPaymentQueryOptions } from '@/api/queries/payment'
import { getReservationQueryOptions } from '@/api/queries/reservation'
import { getTripQueryOptions } from '@/api/queries/trip'
import type { Trip } from '@/api/types/trip'
import { Skeleton } from '@/components/ui/skeleton'
import { Printer } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/payment/print/$id')({
  pendingComponent: () => (
    <div className="min-h-screen bg-white text-black flex justify-center py-8 print:py-4">
      <div className="w-full max-w-5xl px-6 print:px-0 text-sm space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  ),
  loader: async ({ context: { queryClient }, params: { id } }) => {
    if (!id) throw new Error('Payment ID is required')

    const payment = await queryClient.fetchQuery(getPaymentQueryOptions(id))

    if (!payment?.reservation?.id) {
      throw new Error('Reservation not found')
    }

    const reservation = await queryClient.fetchQuery(getReservationQueryOptions(payment.reservation.id))

    if (!reservation.trip?.id) {
      throw new Error('Trip not found')
    }

    const trip = await queryClient.fetchQuery(getTripQueryOptions(reservation.trip.id))

    return { payment, reservation: { ...reservation, trip } }
  },
  component: PaymentPrintRoute,
})

function PaymentPrintRoute() {
  const { reservation, payment } = Route.useLoaderData()

  return <PaymentPrintPage reservation={reservation} payment={payment} />
}

function formatTime(value?: string | null) {
  if (!value) return '--:--'
  const date = new Date(value)
  return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(value?: string | null) {
  if (!value) return '-'
  const date = new Date(value)
  return date.toLocaleDateString('tr-TR')
}

function PaymentPrintPage({ reservation }: { reservation: any; payment: any }) {
  const trip = (reservation?.trip ?? null) as Trip | null
  const seats = reservation?.seats ?? []
  const passengers = reservation?.passengers ?? []
  const contact = reservation?.contact
  const pnr = reservation?.pnr as string | undefined
  const seatCount = seats.length || 1

  const { t } = useTranslation()

  const basePrice = typeof trip?.price === 'number' ? trip.price : 0
  const totalAmount: number = reservation?.totalAmount ?? basePrice * seatCount

  const handlePressPrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  return (
    <>
      <button
        className="inline-flex print:hidden items-center gap-2 fixed top-4 left-1/2 transform -translate-x-1/2 z-50 border px-4 py-1 rounded-full shadow-md shadow-accent hover:shadow-lg hover:bg-accent-foreground/5 transition-all text-sm cursor-pointer"
        onClick={handlePressPrint}
      >
        <Printer className="w-4 h-4" />
        {t('confirmation.actions.print', 'Yazdır')}
      </button>
      <div className="min-h-screen bg-white text-black flex justify-center py-8 print:py-4">
        <div className="w-full max-w-5xl px-6 print:px-0 text-sm space-y-6">
          {/* Header */}
          <header className="border-b pb-4 mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Bus Ticket</h1>
              {trip?.company?.name && <p className="text-sm text-gray-600 mt-1">{trip.company.name}</p>}
            </div>
            <div className="text-right">
              {pnr && <div className="text-xs font-mono font-semibold border px-2 py-1 rounded">PNR: {pnr}</div>}
              <div className="text-xs text-gray-500 mt-1">Printed: {new Date().toLocaleString('tr-TR')}</div>
            </div>
          </header>

          {/* Trip info */}
          {trip && (
            <section className="border rounded-md p-4 space-y-2">
              <h2 className="text-sm font-semibold mb-1">Trip</h2>
              <div className="flex justify-between">
                <div>
                  <div className="font-medium">
                    {trip.fromAgency?.city} → {trip.toAgency?.city}
                  </div>
                  <div className="text-xs text-gray-600">
                    {trip.fromAgency?.name} → {trip.toAgency?.name}
                  </div>
                </div>
                <div className="text-right text-xs text-gray-700 space-y-1">
                  <div>
                    <span className="font-medium">Departure: </span>
                    {formatDate(trip.departure)} {formatTime(trip.departure)}
                  </div>
                  <div>
                    <span className="font-medium">Arrival: </span>
                    {formatDate(trip.arrival)} {formatTime(trip.arrival)}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Passengers & seats */}
          <section className="border rounded-md p-4 space-y-2">
            <h2 className="text-sm font-semibold mb-1">Passengers</h2>
            {passengers.length ? (
              <table className="w-full text-xs border-t">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-1 px-1 font-medium">#</th>
                    <th className="text-left py-1 px-1 font-medium">Name</th>
                    <th className="text-left py-1 px-1 font-medium">Seat</th>
                  </tr>
                </thead>
                <tbody>
                  {passengers.map((p: any, index: number) => {
                    const seat = seats[index]
                    return (
                      <tr key={p.id ?? index} className="border-b last:border-b-0">
                        <td className="py-1 px-1 align-top">{index + 1}</td>
                        <td className="py-1 px-1 align-top">
                          {p.firstName} {p.lastName}
                        </td>
                        <td className="py-1 px-1 align-top">{seat?.seatNo ?? '-'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : (
              <p className="text-xs text-gray-600">No passenger information.</p>
            )}
          </section>

          {/* Contact */}
          <section className="border rounded-md p-4 space-y-1">
            <h2 className="text-sm font-semibold mb-1">Contact</h2>
            {contact ? (
              <div className="text-xs text-gray-700 space-y-1">
                <div>Email: {contact.email}</div>
                <div>Phone: {contact.phone}</div>
              </div>
            ) : (
              <p className="text-xs text-gray-600">No contact information.</p>
            )}
          </section>

          {/* Payment summary */}
          <section className="border rounded-md p-4 space-y-2">
            <h2 className="text-sm font-semibold mb-1">Summary</h2>
            <div className="flex justify-between text-xs text-gray-700">
              <span>Seat count</span>
              <span>{seatCount}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-700">
              <span>Price per seat</span>
              <span>{basePrice.toFixed(2)}₺</span>
            </div>
            <div className="flex justify-between text-sm font-semibold border-t pt-2 mt-1">
              <span>Total</span>
              <span>{totalAmount.toFixed(2)}₺</span>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
