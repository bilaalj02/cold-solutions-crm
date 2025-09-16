import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Cold Caller Dashboard',
  description: 'Cold calling management system for sales teams',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
