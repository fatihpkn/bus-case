import { z } from 'zod'

export const paymentSchema = z.object({
  cardNumber: z
    .string()
    .min(13, 'Kart numarası çok kısa')
    .max(19, 'Kart numarası çok uzun')
    .regex(/^\d{13,19}$/, 'Geçerli bir kart numarası girin'),

  expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, 'Geçerli bir ay girin (01-12)'),

  expiryYear: z
    .string()
    .regex(/^\d{2}$/, 'Geçerli bir yıl girin (YY formatında)')
    .refine((year) => {
      const currentYear = new Date().getFullYear() % 100
      const expiryYear = parseInt(year)
      return expiryYear >= currentYear
    }, 'Kartınızın süresi dolmuş'),

  cvv: z.string().regex(/^\d{3,4}$/, 'CVV 3-4 haneli olmalıdır'),

  cardholderName: z
    .string()
    .min(2, 'Kart sahibi adı en az 2 karakter olmalı')
    .max(50, 'Kart sahibi adı çok uzun')
    .regex(/^[a-zA-Z\s]+$/, 'Sadece harf ve boşluk kullanın'),

  acceptTerms: z.boolean().refine((val) => val === true, 'Şartları kabul etmelisiniz'),
})

export type PaymentFormData = z.infer<typeof paymentSchema>
