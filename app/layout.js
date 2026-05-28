import { Inter } from 'next/font/google';
import Script from 'next/script';
import StyledComponentsRegistry from '../lib/registry';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: 'ESG Compliance Agent — Pilotaż dla MŚP | Pilot for SMEs',
  description: 'AI-powered ESG compliance for SMEs. Join the founding pilot — free pre-launch registration unlocks 6 months free at commercial launch on October 1st.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pl" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-RCNDBPD0N8"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-RCNDBPD0N8');
          `}
        </Script>
        <StyledComponentsRegistry>
          {children}
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}

