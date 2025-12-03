import { z } from 'zod'
import { dynamicKey } from '@/i18n'

const PASSENGER_ERROR_KEYS = {
  firstNameMin: dynamicKey('validation.passenger.firstName.min', 'Ad en az 2 karakter olmalıdır.'),
  firstNameMax: dynamicKey('validation.passenger.firstName.max', 'Ad en fazla 50 karakter olabilir.'),
  lastNameMin: dynamicKey('validation.passenger.lastName.min', 'Soyad en az 2 karakter olmalıdır.'),
  lastNameMax: dynamicKey('validation.passenger.lastName.max', 'Soyad en fazla 50 karakter olabilir.'),
  idNumberInvalid: dynamicKey('validation.passenger.idNumber.invalid', 'Lütfen geçerli bir T.C. kimlik numarası girin.'),
  genderRequired: dynamicKey('validation.passenger.gender.required', 'Lütfen cinsiyet seçin.'),
} as const

const CONTACT_ERROR_KEYS = {
  emailInvalid: dynamicKey('validation.contact.email.invalid', 'Lütfen geçerli bir e-posta adresi girin.'),
  phoneInvalid: dynamicKey('validation.contact.phone.invalid', 'Lütfen geçerli bir telefon numarası girin.'),
  phoneMinLength: dynamicKey('validation.contact.phone.minLength', 'Telefon numarası çok kısa.'),
} as const

const PASSENGER_INFO_ERROR_KEYS = {
  passengersMin: dynamicKey('validation.passengerInfo.passengers.min', 'En az bir yolcu girmelisiniz.'),
  passengersMax: dynamicKey('validation.passengerInfo.passengers.max', 'En fazla 5 yolcu girebilirsiniz.'),
} as const

export const passengerSchema = z.object({
  firstName: z.string().min(2, PASSENGER_ERROR_KEYS.firstNameMin).max(50, PASSENGER_ERROR_KEYS.firstNameMax),
  lastName: z.string().min(2, PASSENGER_ERROR_KEYS.lastNameMin).max(50, PASSENGER_ERROR_KEYS.lastNameMax),
  idNumber: z.string().regex(/^[0-9]{11}$/, PASSENGER_ERROR_KEYS.idNumberInvalid),
  gender: z.enum(['male', 'female'], { error: PASSENGER_ERROR_KEYS.genderRequired }),
})

export const contactSchema = z.object({
  email: z.email(CONTACT_ERROR_KEYS.emailInvalid),
  phone: z
    .string()
    .regex(/^[\+]?[0-9\s\-\(\)]+$/, CONTACT_ERROR_KEYS.phoneInvalid)
    .min(10, CONTACT_ERROR_KEYS.phoneMinLength),
})

export const passengerInfoSchema = z.object({
  passengers: z.array(passengerSchema).min(1, PASSENGER_INFO_ERROR_KEYS.passengersMin).max(5, PASSENGER_INFO_ERROR_KEYS.passengersMax),
  contact: contactSchema,
})

export type PassengerFormData = z.infer<typeof passengerSchema>
export type ContactFormData = z.infer<typeof contactSchema>
export type PassengerInfoFormData = z.infer<typeof passengerInfoSchema>
