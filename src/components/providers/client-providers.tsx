'use client';

import { ReactNode, Suspense } from 'react';
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
