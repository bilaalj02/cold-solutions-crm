import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Cold Solutions CRM | Lead Management Dashboard',
  description: 'Advanced CRM dashboard for Cold Solutions AI automation business',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?display=swap&family=Inter:wght@400;500;700;900&family=Noto+Sans:wght@400;500;700;900" rel="stylesheet" />
        <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
        <style dangerouslySetInnerHTML={{
          __html: `
            .material-symbols-outlined {
              font-family: 'Material Symbols Outlined';
              font-weight: normal;
              font-style: normal;
              font-size: 24px;
              line-height: 1;
              letter-spacing: normal;
              text-transform: none;
              display: inline-block;
              white-space: nowrap;
              word-wrap: normal;
              direction: ltr;
              -webkit-font-feature-settings: 'liga';
              -webkit-font-smoothing: antialiased;
            }
          `
        }} />
      </head>
      <body className="bg-white text-gray-900 antialiased" style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}