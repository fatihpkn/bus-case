import API from '@/api'
import { getPaymentQueryOptions } from '@/api/queries/payment'
import { getReservationQueryOptions } from '@/api/queries/reservation'
import { PriceBreakdown, SeatSelection, TripSummary } from '@/components/features/reservation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { dynamicKey } from '@/i18n'

const PAYMENT_ERROR_KEYS = {
  cardNameMin: dynamicKey('validation.payment.cardName.min', 'Kart üzerindeki isim çok kısa.'),
  cardNumberInvalid: dynamicKey('validation.payment.cardNumber.invalid', 'Lütfen geçerli bir kart numarası girin.'),
  cardNumberMinLength: dynamicKey('validation.payment.cardNumber.minLength', 'Kart numarası çok kısa.'),
  expiryInvalid: dynamicKey('validation.payment.expiry.invalid', 'Lütfen geçerli bir son kullanma tarihi girin.'),
  cvcInvalid: dynamicKey('validation.payment.cvc.invalid', 'Lütfen geçerli bir CVC girin.'),
  cvcMinLength: dynamicKey('validation.payment.cvc.minLength', 'CVC çok kısa.'),
  cvcMaxLength: dynamicKey('validation.payment.cvc.maxLength', 'CVC çok uzun.'),
  acceptTermsRequired: dynamicKey('validation.payment.acceptTerms.required', 'Şartları kabul etmelisiniz.'),
} as const

const paymentSchema = z.object({
  cardName: z.string().min(3, PAYMENT_ERROR_KEYS.cardNameMin),
  cardNumber: z
    .string()
    .regex(/^[0-9\s]+$/, PAYMENT_ERROR_KEYS.cardNumberInvalid)
    .min(16, PAYMENT_ERROR_KEYS.cardNumberMinLength),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/[0-9]{2}$/, PAYMENT_ERROR_KEYS.expiryInvalid),
  cvc: z.string().regex(/^\d+$/, PAYMENT_ERROR_KEYS.cvcInvalid).min(3, PAYMENT_ERROR_KEYS.cvcMinLength).max(4, PAYMENT_ERROR_KEYS.cvcMaxLength),
  acceptTerms: z.boolean().refine((val) => val === true, PAYMENT_ERROR_KEYS.acceptTermsRequired),
})

type PaymentFormData = z.infer<typeof paymentSchema>

interface CheckoutPageProps {
  reservation: any
}

function CheckoutPage({ reservation }: CheckoutPageProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const router = useRouter()

  const queryClient = useQueryClient()

  const createPaymentMutation = API.useMutation('post', '/collections/payments')

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardName: 'John Doe',
      cardNumber: '1234567890123456',
      expiry: '12/25',
      cvc: '123',
      acceptTerms: false,
    },
    shouldFocusError: true,
  })

  const seats = reservation?.seats ?? []
  const seatCount = seats.length || 1
  const trip = reservation?.trip

  const totalAmount: number = reservation?.totalAmount ?? (trip && typeof trip.price === 'number' ? trip.price * seatCount : 0)

  const getErrorMessage = (message?: string) => (message ? (t(message as any) as string) : undefined)

  const onSubmit = async () => {
    const payment = await createPaymentMutation.mutateAsync({
      body: {
        reservationId: reservation?.id,
        status: 'success',
      },
    })

    if (!payment?.id) throw new Error('Payment cannot be created')

    const reservationQueryKey = getReservationQueryOptions(reservation?.id)
    const paymentQueryKey = getPaymentQueryOptions(payment?.id)

    router.clearCache()
    queryClient.invalidateQueries({ queryKey: [reservationQueryKey.queryKey, paymentQueryKey.queryKey] })

    await router.invalidate({ sync: true })

    navigate({
      to: '/payment/$id',
      params: {
        id: payment?.id ?? '',
      },
    })
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('checkout.title', 'Rezervasyon Özeti')}</h1>
        <p className="text-muted-foreground">{t('checkout.description', 'Rezervasyonunuz başarıyla alındı. Aşağıda özet bilgileri görebilirsiniz.')}</p>
      </div>

      <div className="space-y-6">
        {trip && <TripSummary trip={trip} />}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4 order-2 lg:order-1">
            <Card>
              <CardHeader>
                <CardTitle>{t('checkout.passengers.title', 'Yolcu Bilgileri')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {reservation?.passengers?.length ? (
                  reservation.passengers.map((p: any, index: number) => (
                    <div key={p.id ?? index} className="flex items-center justify-between border-b last:border-0 pb-2 last:pb-0">
                      <span className="font-medium">
                        {index + 1}. {p.firstName} {p.lastName}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {t('checkout.passengers.seatLabel', 'Koltuk')} {p.seatNo ?? seats[index]?.seatNo}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-muted-foreground">{t('checkout.passengers.empty', 'Yolcu bilgisi bulunamadı.')}</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('checkout.contact.title', 'İletişim Bilgileri')}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <div>{reservation?.contact?.email}</div>
                <div>{reservation?.contact?.phone}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('checkout.payment.title', 'Ödeme Bilgileri')}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardName">{t('checkout.payment.cardName', 'Kart Üzerindeki İsim')}</Label>
                    <Input
                      id="cardName"
                      {...register('cardName')}
                      placeholder={t('checkout.payment.cardName.placeholder', 'Ad Soyad')}
                      className={errors.cardName ? 'border-destructive' : ''}
                    />
                    {errors.cardName && <p className="text-xs text-destructive">{getErrorMessage(errors.cardName.message)}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">{t('checkout.payment.cardNumber', 'Kart Numarası')}</Label>
                    <Input
                      id="cardNumber"
                      {...register('cardNumber')}
                      placeholder={t('checkout.payment.cardNumber.placeholder', 'XXXX XXXX XXXX XXXX')}
                      className={errors.cardNumber ? 'border-destructive' : ''}
                    />
                    {errors.cardNumber && <p className="text-xs text-destructive">{getErrorMessage(errors.cardNumber.message)}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">{t('checkout.payment.expiry', 'Son Kullanma')}</Label>
                      <Input
                        id="expiry"
                        {...register('expiry')}
                        placeholder={t('checkout.payment.expiry.placeholder', 'AA/YY')}
                        className={errors.expiry ? 'border-destructive' : ''}
                      />
                      {errors.expiry && <p className="text-xs text-destructive">{getErrorMessage(errors.expiry.message)}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cvc">{t('checkout.payment.cvc', 'CVC')}</Label>
                      <Input id="cvc" {...register('cvc')} placeholder={t('checkout.payment.cvc.placeholder', 'XXX')} className={errors.cvc ? 'border-destructive' : ''} />
                      {errors.cvc && <p className="text-xs text-destructive">{getErrorMessage(errors.cvc.message)}</p>}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Controller
                        name="acceptTerms"
                        control={control}
                        render={({ field }) => (
                          <Checkbox
                            onCheckedChange={field.onChange}
                            checked={field.value}
                            id="acceptTerms"
                            className={`h-4 w-4 rounded border ${errors.acceptTerms ? 'border-destructive' : 'border-input'}`}
                          />
                        )}
                      />
                      <Label htmlFor="acceptTerms" className="text-xs font-normal">
                        {t('checkout.payment.acceptTermsLabel', 'Satış sözleşmesini ve KVKK metnini okudum, kabul ediyorum.')}
                      </Label>
                    </div>
                    {errors.acceptTerms && <p className="text-xs text-destructive">{getErrorMessage(errors.acceptTerms.message)}</p>}
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting || createPaymentMutation.isPending}>
                    {t('checkout.payment.pay', 'Ödemeyi Tamamla')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-4 order-1 lg:order-2">
            <SeatSelection seats={seats} />
            <PriceBreakdown totalAmount={totalAmount} seatCount={seatCount} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
