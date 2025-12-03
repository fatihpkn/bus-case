import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Phone } from 'lucide-react'
import type { FieldErrors } from 'react-hook-form'
import type { ContactFormData } from '@/lib/schemas/passenger'

interface ContactFormProps {
  contact: ContactFormData
  onChange: (contact: ContactFormData) => void
  errors?: FieldErrors<ContactFormData>
}

function ContactForm({ contact, onChange, errors }: ContactFormProps) {
  const { t } = useTranslation()

  const updateContact = (field: keyof ContactFormData, value: string) => {
    onChange({ ...contact, [field]: value })
  }

  const getErrorMessage = (message?: string) => (message ? (t(message as any) as string) : undefined)

  const emailErrorMessage = getErrorMessage(errors?.email?.message as string | undefined)
  const phoneErrorMessage = getErrorMessage(errors?.phone?.message as string | undefined)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          {t('contactForm.title', 'İletişim Bilgileri')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t('contactForm.email', 'E-posta Adresi')} *</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={contact.email}
              onChange={(e) => updateContact('email', e.target.value)}
              placeholder={t('contactForm.emailPlaceholder', 'ornek@email.com')}
              className={`pl-10 ${emailErrorMessage ? 'border-destructive' : ''}`}
            />
          </div>
          {emailErrorMessage && <p className="text-xs text-destructive">{emailErrorMessage}</p>}
          <p className="text-xs text-muted-foreground">{t('contactForm.emailNote', 'Rezervasyon onayınız bu adrese gönderilecektir.')}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">{t('contactForm.phone', 'Telefon Numarası')} *</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              value={contact.phone}
              onChange={(e) => updateContact('phone', e.target.value)}
              placeholder={t('contactForm.phonePlaceholder', '+90 555 123 45 67')}
              className={`pl-10 ${phoneErrorMessage ? 'border-destructive' : ''}`}
            />
          </div>
          {phoneErrorMessage && <p className="text-xs text-destructive">{phoneErrorMessage}</p>}
          <p className="text-xs text-muted-foreground">{t('contactForm.phoneNote', 'Önemli güncellemeler için kullanılacaktır.')}</p>
        </div>

        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">{t('contactForm.privacy.title', 'Gizlilik ve Güvenlik')}</h4>
          <p className="text-xs text-muted-foreground">
            {t('contactForm.privacy.note', 'Verdiğiniz bilgiler sadece bu rezervasyon için kullanılacak ve güvenli bir şekilde saklanacaktır.')}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default ContactForm
