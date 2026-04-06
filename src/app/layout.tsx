
import { Inter } from 'next/font/google';
import './globals.css';
import { ClientProviders } from '@/components/providers/client-providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'HustleSpark | Launch Your Next Side Hustle',
  description: 'AI-powered launchpad for creators to build, track, and sell ventures.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased font-body bg-background text-foreground`} suppressHydrationWarning>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
