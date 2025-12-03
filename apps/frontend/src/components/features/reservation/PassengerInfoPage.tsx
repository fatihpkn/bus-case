import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Route } from '@/routes/reservation/$id'
import { getReservationQueryOptions } from '@/api/queries/reservation'
import PassengerForm from './PassengerForm'
import ContactForm from './ContactForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Users, Mail, Phone, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { passengerInfoSchema } from '@/lib/schemas/passenger'
import type { PassengerInfoFormData } from '@/lib/schemas/passenger'
import API from '@/api'

function PassengerInfoPage() {
  const { t } = useTranslation()
  const { pnr } = Route.useLoaderData()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: reservation, isLoading, error } = useQuery(getReservationQueryOptions(pnr))

  const [formData, setFormData] = useState<Partial<PassengerInfoFormData>>({
    passengers: [{ firstName: '', lastName: '', gender: undefined }],
    contact: { email: '', phone: '' },
  })

  // Mutations for creating contact and passengers
  const createContactMutation = API.useMutation('post', '/collections/contacts')
  const createPassengerMutation = API.useMutation('post', '/collections/passengers')

  // Mutation for submitting passenger and contact data
  const submitMutation = useMutation({
    mutationFn: async (data: PassengerInfoFormData) => {
      // First validate the data
      const validatedData = passengerInfoSchema.parse(data)

      const contactResponse = await createContactMutation.mutateAsync({
        body: validatedData.contact,
      })

      if (!contactResponse.id) {
        throw new Error('Contact creation failed')
      }

      // Create passengers with the contact ID and actual seat IDs from reservation
      const passengerRequests = validatedData.passengers.map((passenger, index) => {
        const seatId = reservation?.seats?.[index]?.id
        if (!seatId) {
          throw new Error(`Seat ${index + 1} not found in reservation`)
        }

        return {
          reservationId: pnr || '',
          contactId: contactResponse.id || '',
          seatId: seatId,
          firstName: passenger.firstName,
          lastName: passenger.lastName,
          idNumber: passenger.idNumber,
          gender: passenger.gender!,
        }
      })

      // Create passengers one by one
      const passengerPromises = passengerRequests.map((passenger) =>
        createPassengerMutation.mutateAsync({
          body: passenger,
        }),
      )

      const passengerResponses = await Promise.all(passengerPromises)

      return {
        contact: contactResponse,
        passengers: passengerResponses.map((res) => res).filter(Boolean),
      }
    },
    onSuccess: () => {
      // Navigate to checkout page
      navigate({ to: '/checkout/$id', params: { id: pnr } })
    },
    onError: (error) => {
      console.error('Failed to submit passenger data:', error)
      // Error will be shown by the mutation state
    },
  })

  const handleFormChange = (data: Partial<PassengerInfoFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const handleContinue = () => {
    if (formData.passengers && formData.contact) {
      submitMutation.mutate({
        passengers: formData.passengers,
        contact: formData.contact,
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="text-center">Loading reservation details...</div>
      </div>
    )
  }

  if (error || !reservation) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="text-center text-destructive">Error loading reservation: {error?.message || 'Reservation not found'}</div>
        <div className="mt-4 text-center">
          <Button onClick={() => navigate({ to: '/' })}>{t('common.backToHome', 'Ana Sayfaya Dön')}</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              navigate({
                to: '/search',
                search: {
                  from: '',
                  to: '',
                },
              })
            }
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back', 'Geri')}
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t('passengerInfo.title', 'Yolcu Bilgileri')}</h1>
            <p className="text-muted-foreground">{t('passengerInfo.subtitle', 'Lütfen yolcu bilgilerini doldurun')}</p>
          </div>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            PNR: {pnr}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Reservation Summary */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('reservation.summary', 'Rezervasyon Özeti')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('reservation.totalAmount', 'Toplam Tutar')}:</span>
                  <span className="font-medium">₺{reservation.totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('reservation.status', 'Durum')}:</span>
                  <Badge variant={reservation.status === 'pending' ? 'secondary' : 'default'}>
                    {reservation.status === 'pending' ? 'Bekliyor' : reservation.status === 'confirmed' ? 'Onaylandı' : 'İptal'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Forms */}
        <div className="lg:col-span-2 space-y-6">
          <PassengerForm passengers={formData.passengers || []} onChange={(passengers) => handleFormChange({ passengers })} />

          <ContactForm contact={formData.contact || { email: '', phone: '' }} onChange={(contact) => handleFormChange({ contact })} />

          <div className="flex justify-end pt-6 border-t">
            {submitMutation.error && (
              <div className="flex-1 text-sm text-destructive mr-4">
                {t('passengerInfo.submitError', 'Bilgiler kaydedilirken hata oluştu: {{error}}', {
                  error: submitMutation.error.message,
                })}
              </div>
            )}
            <Button onClick={handleContinue} size="lg" disabled={submitMutation.isPending}>
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('passengerInfo.saving', 'Kaydediliyor...')}
                </>
              ) : (
                t('passengerInfo.continue', 'Devam Et')
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PassengerInfoPage
