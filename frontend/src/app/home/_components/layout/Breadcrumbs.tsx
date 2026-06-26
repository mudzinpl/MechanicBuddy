'use client'

import Link from 'next/link'
import { ChevronRightIcon } from '@heroicons/react/20/solid'
import { usePathname, useSearchParams } from 'next/navigation'

const segmentLabels: Record<string, string> = {
  work: 'Zlecenia',
  calendar: 'Terminy',
  clients: 'Klienci',
  vehicles: 'Pojazdy',
  inventory: 'Części i zamówienia',
  settings: 'Ustawienia',
  profile: 'Profil',
  new: 'Nowy',
  edit: 'Edycja',
  branding: 'Branding',
  users: 'Użytkownicy',
  landing: 'Strona publiczna',
  visibility: 'Widoczność',
  'audit-logs': 'Dziennik zdarzeń',
}

const querySectionLabels: Record<string, string> = {
  documents: 'Dokumenty',
  communication: 'Komunikacja',
  tasks: 'Zadania',
  settlements: 'Rozliczenia',
}

function getEntityLabel(segment: string, previousSegment?: string) {
  if (segmentLabels[segment]) return segmentLabels[segment]

  if (previousSegment === 'work') return `Zlecenie ${segment}`
  if (previousSegment === 'clients') return `Klient ${segment}`
  if (previousSegment === 'vehicles') return `Pojazd ${segment}`
  if (previousSegment === 'inventory') return `Część ${segment}`

  return segment
}

export default function Breadcrumbs() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (!pathname?.startsWith('/home')) return null

  const segments = pathname.split('/').filter(Boolean).slice(1)
  const crumbs: { label: string; href: string }[] = [{ label: 'Dashboard', href: '/home' }]
  let href = '/home'

  segments.forEach((segment, index) => {
    href += `/${segment}`
    crumbs.push({ label: getEntityLabel(segment, segments[index - 1]), href })
  })

  const currentSectionKey = searchParams.get('module')
  if (currentSectionKey && querySectionLabels[currentSectionKey]) {
    crumbs.push({ label: querySectionLabels[currentSectionKey], href: `${pathname}?module=${currentSectionKey}` })
  }

  const replacement = searchParams.get('replacement')
  if (replacement === 'true') {
    crumbs.push({ label: 'Pojazdy zastępcze', href: `${pathname}?replacement=true` })
  }

  if (crumbs.length <= 1) return null

  return (
    <nav aria-label="Okruszki" className="border-b border-gray-200 bg-white/80 px-4 py-3 text-sm backdrop-blur sm:px-6 lg:pl-68 lg:pr-8">
      <ol className="flex flex-wrap items-center gap-1 text-gray-500">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1
          return (
            <li key={`${crumb.href}-${index}`} className="flex items-center gap-1">
              {index > 0 && <ChevronRightIcon className="size-4 text-gray-400" aria-hidden="true" />}
              {isLast ? (
                <span className="font-medium text-gray-900">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="hover:text-gray-900">
                  {crumb.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
