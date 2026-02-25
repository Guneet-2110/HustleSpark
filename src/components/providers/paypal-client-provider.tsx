'use client';

import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { ReactNode } from "react";

/**
 * Client-side wrapper for the PayPal Script Provider.
 * This prevents "createContext is not a function" errors in Server Components like layout.tsx.
 */
const paypalInitialOptions = {
  "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test",
  currency: "USD",
  intent: "capture",
};

export function PayPalClientProvider({ children }: { children: ReactNode }) {
  return (
    <PayPalScriptProvider options={paypalInitialOptions}>
      {children}
    </PayPalScriptProvider>
  );
}
