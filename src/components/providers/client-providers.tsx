
'use client';

import { useEffect, useState, ReactNode } from 'react';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { PayPalClientProvider } from '@/components/providers/paypal-client-provider';
import { AuthProvider } from '@/context/auth-provider';
import { Header } from '@/components/header';
import { Toaster } from '@/components/ui/toaster';
import { PaymentModal } from '@/components/payment-modal';

interface ClientProvidersProps {
  children: ReactNode;
}

/**
 * A client-side wrapper that handles hydration safety and initializes all context providers.
 * This prevents Next.js hydration mismatches by ensuring client-only code runs after mount.
 */
export function ClientProviders({ children }: ClientProvidersProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#1A1A2E] flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#9D4EDD] border-t-transparent"></div>
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
              {children}
            </main>
          </div>
          <Toaster />
          <PaymentModal />
        </AuthProvider>
      </PayPalClientProvider>
    </FirebaseClientProvider>
  );
}
