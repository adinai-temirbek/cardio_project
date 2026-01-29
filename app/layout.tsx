import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Heart Health Screening | Free Cardiovascular Risk Assessment',
  description: 'Check your heart risk in 3 minutes. Free, no registration required.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}