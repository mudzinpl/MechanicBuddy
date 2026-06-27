import { type Metadata } from 'next'
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
config.autoAddCss = false

import '@/_styles/tailwind.css'

const siteName = 'APPRA'
const siteDescription = 'APPRA to system zarządzania warsztatem, zleceniami, klientami, pojazdami, magazynem i rozliczeniami.'
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3025'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: `%s | ${siteName}`,
    default: `${siteName} - zarządzanie warsztatem`,
  },
  description: siteDescription,
  keywords: [
    'workshop management',
    'auto repair software',
    'mechanic software',
    'garage management',
    'work order tracking',
    'vehicle service',
    'invoicing software',
    'inventory management',
    'APPRA',
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  formatDetection: {
    telephone: true,
    address: true,
  },
  openGraph: {
    type: 'website',
    locale: 'pl_PL',
    url: siteUrl,
    siteName: siteName,
    title: `${siteName} - zarządzanie warsztatem`,
    description: siteDescription,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteName} - zarządzanie warsztatem`,
    description: siteDescription,
  },
  icons: {
    icon: '/icon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  category: 'software',
}

const fontVariables = {
  '--font-inter': 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  '--font-lexend': 'Lexend, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
} as React.CSSProperties

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode
}) {
 
  return (
    <html className="h-full xl:bg-gray-50" style={fontVariables}>
      <head>
        <link rel="icon" href="/icon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className=" h-full ">
     
        {children}
      </body>
    </html>
  )
}

 