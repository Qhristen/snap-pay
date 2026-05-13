import type { Metadata } from 'next';
import { Sora, DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'sonner';
import { AppProviders } from '@/components/app-providers';

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'SnapPay – Send Money at the Speed of a Snap',
  description: 'The smarter wallet for modern Africans — instant transfers, real-time balance, zero stress.',
  openGraph: {
    title: 'SnapPay — The Smart African Wallet',
    description: 'Deposit, withdraw, and transfer money instantly.',
    url: 'https://snappay.io',
    siteName: 'SnapPay',
    locale: 'en_NG',
    type: 'website',
  },

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sora.variable} ${dmSans.variable} ${jetBrainsMono.variable} antialiased font-dm-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AppProviders>
            {children}
            <Toaster position="top-center" richColors />
          </AppProviders>
        </ThemeProvider>
      </body> 
    </html>
  );
}
