import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Users } from 'lucide-react'
import type { FieldErrors } from 'react-hook-form'
import type { PassengerFormData } from '@/lib/schemas/passenger'

interface PassengerFormProps {
  passengers: PassengerFormData[]
  onChange: (passengers: PassengerFormData[]) => void
  errors?: FieldErrors<PassengerFormData>[]
}

function PassengerForm({ passengers, onChange, errors }: PassengerFormProps) {
  const { t } = useTranslation()

  const updatePassenger = (index: number, field: keyof PassengerFormData, value: string) => {
    const newPassengers = passengers.map((passenger, i) => (i === index ? { ...passenger, [field]: value } : passenger))
    onChange(newPassengers)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {t('passengerForm.title', 'Yolcu Bilgileri')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {passengers.map((passenger, index) => {
          const passengerError = errors?.[index]

          const getErrorMessage = (message?: string) => (message ? (t(message as any) as string) : undefined)

          const firstNameErrorMessage = getErrorMessage(passengerError?.firstName?.message as string | undefined)
          const lastNameErrorMessage = getErrorMessage(passengerError?.lastName?.message as string | undefined)
          const genderErrorMessage = getErrorMessage(passengerError?.gender?.message as string | undefined)
          const idNumberErrorMessage = getErrorMessage(passengerError?.idNumber?.message as string | undefined)

          return (
            <div key={index} className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{t('passengerForm.passengerNumber', '{{number}}. Yolcu', { number: index + 1 })}</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`firstName-${index}`}>{t('passengerForm.firstName', 'Ad')} *</Label>
                  <Input
                    id={`firstName-${index}`}
                    value={passenger.firstName}
                    onChange={(e) => updatePassenger(index, 'firstName', e.target.value)}
                    placeholder={t('passengerForm.firstNamePlaceholder', 'örn. Ahmet')}
                    className={firstNameErrorMessage ? 'border-destructive' : ''}
                  />
                  {firstNameErrorMessage && <p className="text-xs text-destructive">{firstNameErrorMessage}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`lastName-${index}`}>{t('passengerForm.lastName', 'Soyad')} *</Label>
                  <Input
                    id={`lastName-${index}`}
                    value={passenger.lastName}
                    onChange={(e) => updatePassenger(index, 'lastName', e.target.value)}
                    placeholder={t('passengerForm.lastNamePlaceholder', 'örn. Yılmaz')}
                    className={lastNameErrorMessage ? 'border-destructive' : ''}
                  />
                  {lastNameErrorMessage && <p className="text-xs text-destructive">{lastNameErrorMessage}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`idNumber-${index}`}>{t('passengerForm.idNumber', 'T.C. Kimlik Numarası')} *</Label>
                <Input
                  id={`idNumber-${index}`}
                  value={passenger.idNumber}
                  onChange={(e) => updatePassenger(index, 'idNumber', e.target.value)}
                  placeholder={t('passengerForm.idNumberPlaceholder', '11111111111')}
                  className={idNumberErrorMessage ? 'border-destructive' : ''}
                />
                {idNumberErrorMessage && <p className="text-xs text-destructive">{idNumberErrorMessage}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`gender-${index}`}>{t('passengerForm.gender', 'Cinsiyet')} *</Label>
                <Select value={passenger.gender} onValueChange={(value: 'male' | 'female') => updatePassenger(index, 'gender', value)}>
                  <SelectTrigger id={`gender-${index}`} className={genderErrorMessage ? 'border-destructive' : ''}>
                    <SelectValue placeholder={t('passengerForm.selectGender', 'Cinsiyet seçin')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{t('passengerForm.male', 'Erkek')}</SelectItem>
                    <SelectItem value="female">{t('passengerForm.female', 'Kadın')}</SelectItem>
                  </SelectContent>
                </Select>
                {genderErrorMessage && <p className="text-xs text-destructive">{genderErrorMessage}</p>}
              </div>
            </div>
          )
        })}

        <div className="text-sm text-muted-foreground">{t('passengerForm.note', '* işaretli alanlar zorunludur. Koltuk sayısı kadar yolcu bilgisi girilmelidir.')}</div>
      </CardContent>
    </Card>
  )
}

export default PassengerForm
