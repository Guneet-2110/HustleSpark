
'use client';

import { ReferralTracker } from '@/components/referral-tracker';
import { ReactNode, Suspense, useState, useEffect } from 'react';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { PayPalClientProvider } from '@/components/providers/paypal-client-provider';
import { AuthProvider } from '@/context/auth-provider';
import { Header } from '@/components/header';
import { Toaster } from '@/components/ui/toaster';
import { PaymentModal } from '@/components/payment-modal';
import { Loader2 } from 'lucide-react';

interface ClientProvidersProps {
  children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use a mounting guard to ensure stable hydration across all providers
  if (!mounted) {
    return (
      <div className="relative flex min-h-screen flex-col bg-background">
        <div className="h-14 border-b bg-background/95" />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary/20" />
        </main>
      </div>
    );
  }

  return (
    <FirebaseClientProvider>
      <PayPalClientProvider>
        <AuthProvider>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
            <Suspense fallback={
                <div className="container py-20 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                </div>
              }>
                <ReferralTracker />
                {children}
              </Suspense>
            </main>
          </div>
          <Toaster />
          <PaymentModal />
        </AuthProvider>
      </PayPalClientProvider>
    </FirebaseClientProvider>
  );
}
