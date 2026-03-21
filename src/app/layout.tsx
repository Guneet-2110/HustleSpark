
"use client";

import { useEffect, useState } from 'react';
import './globals.css';
import { AuthProvider } from '@/context/auth-provider';
import { Header } from '@/components/header';
import { Toaster } from '@/components/ui/toaster';
import { PaymentModal } from '@/components/payment-modal';
import { PayPalClientProvider } from '@/components/providers/paypal-client-provider';
import { FirebaseClientProvider } from '@/firebase/client-provider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Hydration guard to prevent "Cannot read properties of undefined (reading 'call')"
    // This ensures no Firebase or Interactive components run until the client is ready.
    setMounted(true);
  }, []);

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        ></link>
      </head>
      <body className="antialiased font-body" suppressHydrationWarning>
        {mounted ? (
          <FirebaseClientProvider>
            <PayPalClientProvider>
              <AuthProvider>
                <div className="relative flex min-h-screen flex-col">
                  <Header />
                  <main className="flex-1">{children}</main>
                </div>
                <Toaster />
                <PaymentModal />
              </AuthProvider>
            </PayPalClientProvider>
          </FirebaseClientProvider>
        ) : (
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        )}
      </body>
    </html>
  );
}
