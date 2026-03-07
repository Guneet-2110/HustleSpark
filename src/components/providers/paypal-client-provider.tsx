'use client';

import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { ReactNode } from "react";

/**
 * Client-side wrapper for the PayPal Script Provider.
 * This ensures the client-id is loaded from environment variables.
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
