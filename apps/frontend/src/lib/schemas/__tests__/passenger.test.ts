import { describe, it, expect } from 'vitest'

import { passengerSchema, passengerInfoSchema } from '@/lib/schemas/passenger'

const validPassenger = {
  firstName: 'Ahmet',
  lastName: 'Yilmaz',
  idNumber: '12345678901',
  gender: 'male' as const,
}

const validContact = {
  email: 'test@example.com',
  phone: '5555555555',
}

describe('passengerSchema', () => {
  it('firstName ve lastName için min/max kısıtlarını uygular', () => {
    const tooShort = { ...validPassenger, firstName: 'A' }
    const tooLong = { ...validPassenger, lastName: 'x'.repeat(51) }

    const resultShort = passengerSchema.safeParse(tooShort)
    const resultLong = passengerSchema.safeParse(tooLong)

    expect(resultShort.success).toBe(false)
    expect(resultLong.success).toBe(false)
  })

  it('idNumber için 11 haneli numeric regex kısıtını uygular', () => {
    const invalidLength = { ...validPassenger, idNumber: '123' }
    const invalidChars = { ...validPassenger, idNumber: 'abcdefghijk' }
    const valid = { ...validPassenger, idNumber: '98765432109' }

    const resultInvalidLength = passengerSchema.safeParse(invalidLength)
    const resultInvalidChars = passengerSchema.safeParse(invalidChars)
    const resultValid = passengerSchema.safeParse(valid)

    expect(resultInvalidLength.success).toBe(false)
    expect(resultInvalidChars.success).toBe(false)
    expect(resultValid.success).toBe(true)
  })

  it('gender alanının zorunlu olmasını sağlar', () => {
    const { gender, ...withoutGender } = validPassenger as any

    const result = passengerSchema.safeParse(withoutGender)

    expect(result.success).toBe(false)
  })
})

describe('passengerInfoSchema', () => {
  it('en az 1 en fazla 5 yolcuya izin verir', () => {
    const zeroPassengers = {
      passengers: [],
      contact: validContact,
    }

    const sixPassengers = {
      passengers: Array.from({ length: 6 }, () => validPassenger),
      contact: validContact,
    }

    const onePassenger = {
      passengers: [validPassenger],
      contact: validContact,
    }

    const resultZero = passengerInfoSchema.safeParse(zeroPassengers)
    const resultSix = passengerInfoSchema.safeParse(sixPassengers)
    const resultOne = passengerInfoSchema.safeParse(onePassenger)

    expect(resultZero.success).toBe(false)
    expect(resultSix.success).toBe(false)
    expect(resultOne.success).toBe(true)
  })

  it('geçerli passenger ve contact ile başarılı parse eder', () => {
    const data = {
      passengers: [validPassenger],
      contact: validContact,
    }

    const result = passengerInfoSchema.safeParse(data)

    expect(result.success).toBe(true)
  })
})
