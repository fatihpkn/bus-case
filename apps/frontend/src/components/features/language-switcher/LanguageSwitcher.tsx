import { useTranslation } from 'react-i18next'
import type i18n from '@/i18n'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const languagesIcons: Record<typeof i18n.language, React.ReactNode> = {
  tr: <img src="/flags/tr.svg" alt="tr" />,
  en: <img src="/flags/us.svg" alt="us" />,
}

export const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation()

  return (
    <Select defaultValue={i18n.language} onValueChange={(value) => i18n.changeLanguage(value)}>
      <SelectTrigger>
        <SelectValue placeholder="Select a language">
          <span className="w-6">{languagesIcons[i18n.language]}</span>
          <span className="text-sm">{t('common.language')}</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">
          <span className="w-4">{languagesIcons.en}</span>
          English
        </SelectItem>
        <SelectItem value="tr">
          <span className="w-4">{languagesIcons.tr}</span>
          Türkçe
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
