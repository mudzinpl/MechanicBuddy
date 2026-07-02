import { type Metadata } from 'next'
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
config.autoAddCss = false

import '@/_styles/tailwind.css'

const siteName = 'APPRA'
const siteDescription = 'APPRA Serwis w Gdyni zapewnia kompleksową obsługę szkód komunikacyjnych, napraw powypadkowych, formalności z ubezpieczycielem i samochodów zastępczych.'
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://appra.eu'
const siteImage = '/assets/images/hero-damaged-car.jpg'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: `%s | ${siteName}`,
    default: `${siteName} Serwis - naprawy powypadkowe i likwidacja szkód Gdynia`,
  },
  description: siteDescription,
  keywords: [
    'APPRA Serwis',
    'APPRA Gdynia',
    'likwidacja szkód Gdynia',
    'naprawy powypadkowe Gdynia',
    'bezgotówkowa likwidacja szkody',
    'obsługa szkody komunikacyjnej',
    'naprawa z OC',
    'naprawa z AC',
    'samochód zastępczy Gdynia',
    'blacharstwo lakiernictwo Gdynia',
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
    title: `${siteName} Serwis - naprawy powypadkowe i likwidacja szkód Gdynia`,
    description: siteDescription,
    images: [
      {
        url: siteImage,
        width: 1200,
        height: 630,
        alt: 'APPRA Serwis - naprawy powypadkowe i likwidacja szkód',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteName} Serwis - naprawy powypadkowe i likwidacja szkód Gdynia`,
    description: siteDescription,
    images: [siteImage],
  },
  icons: {
    icon: '/icon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.webmanifest',
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
  category: 'automotive',
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
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body className=" h-full ">
     
        {children}
      </body>
    </html>
  )
}

 
