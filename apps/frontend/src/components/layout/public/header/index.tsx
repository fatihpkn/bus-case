import { LanguageSwitcher } from '@/components/features/language-switcher/LanguageSwitcher'
import { cn } from '@/lib/utils'
import { Link } from '@tanstack/react-router'

export const Header = () => {
  const classes = cn('p-2 px-1', 'mt-1', 'flex justify-between items-center')

  return (
    <header className={classes}>
      <Link to="/">
        <h1 className="text-3xl font-bold">Bus'n Bus</h1>
      </Link>
      <LanguageSwitcher />
    </header>
  )
}
