import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import PassengerForm from './PassengerForm'
import ContactForm from './ContactForm'
import SeatSelection from './SeatSelection'
import PriceBreakdown from './PriceBreakdown'
import API from '@/api'
import { passengerInfoSchema, type PassengerInfoFormData } from '@/lib/schemas/passenger'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

interface ReservationFormProps {
  reservation: any
}

function ReservationForm({ reservation }: ReservationFormProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const seats = useMemo(() => reservation?.seats ?? [], [reservation])
  const seatCount = seats.length || 1
  const totalAmount: number = reservation?.totalAmount ?? 0

  const initialPassengerCount = useMemo(() => Math.min(Math.max(seatCount, 1), 5), [seatCount])

  const defaultPassengers = useMemo(
    () =>
      Array.from({ length: initialPassengerCount }, () => ({
        firstName: '',
        lastName: '',
        gender: 'male' as const,
      })),
    [initialPassengerCount],
  )

  const defaultContact = useMemo(
    () => ({
      email: reservation?.contact?.email ?? '',
      phone: reservation?.contact?.phone ?? '',
    }),
    [reservation],
  )

  const {
    control,
    handleSubmit: rhfHandleSubmit,
    formState: { errors },
  } = useForm<PassengerInfoFormData>({
    defaultValues: {
      passengers: defaultPassengers,
      contact: defaultContact,
    },
    shouldFocusError: true,
    resolver: zodResolver(passengerInfoSchema),
  })

  const createContactMutation = API.useMutation('post', '/collections/contacts')
  const createPassengerMutation = API.useMutation('post', '/collections/passengers')
  const createReservationMutation = API.useMutation('patch', '/collections/reservations/{id}')

  const submitMutation = useMutation({
    mutationFn: async (data: PassengerInfoFormData) => {
      const contactResponse = await createContactMutation.mutateAsync({
        body: data.contact,
      })

      const contactId = contactResponse.id as string | undefined

      if (!contactId) {
        throw new Error('Contact creation failed')
      }

      const passengerRequests = data.passengers.map((passenger, index) => {
        const seat = seats[index]

        if (!seat?.id) {
          throw new Error(`Seat ${index + 1} not found in reservation`)
        }

        return {
          reservationId: reservation?.id ?? '',
          contactId,
          seatId: seat.id,
          firstName: passenger.firstName,
          lastName: passenger.lastName,
          idNumber: passenger.idNumber,
          gender: passenger.gender,
        }
      })

      const passengerIds = await Promise.all(
        passengerRequests.map((payload) =>
          createPassengerMutation.mutateAsync({
            body: {
              ...payload,
              reservationId: reservation?.id,
            },
          }),
        ),
      )

      if (!passengerIds.every((id) => id)) {
        throw new Error('Passenger creation failed')
      }

      await createReservationMutation.mutateAsync({
        body: {
          passengerIds: passengerIds.map((passenger) => passenger.id),
          contactId,
        },
        params: {
          path: { id: reservation.id },
        },
      })
    },
    onSuccess: () => {
      navigate({ to: '/checkout/$id', params: { id: reservation?.id } })
    },
  })
  const onSubmit = (formData: PassengerInfoFormData) => {
    submitMutation.mutate(formData)
  }

  return (
    <form onSubmit={rhfHandleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
        <Controller
          control={control}
          name="passengers"
          render={({ field }) => <PassengerForm passengers={field.value} onChange={field.onChange} errors={errors.passengers as any} />}
        />

        <Controller control={control} name="contact" render={({ field }) => <ContactForm contact={field.value} onChange={field.onChange} errors={errors.contact as any} />} />

        <div className="flex justify-end pt-6 border-t">
          {submitMutation.error && (
            <div className="flex-1 text-sm text-destructive mr-4">
              {t('passengerInfo.submitError', 'Bilgiler kaydedilirken hata oluştu: {{error}}', {
                error: (submitMutation.error as Error).message,
              })}
            </div>
          )}
          <Button type="submit" size="lg" disabled={submitMutation.isPending}>
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

      <div className="lg:col-span-1 space-y-4 order-1 lg:order-2">
        <SeatSelection seats={seats} />
        <PriceBreakdown totalAmount={totalAmount} seatCount={seatCount} />
      </div>
    </form>
  )
}

export default ReservationForm
