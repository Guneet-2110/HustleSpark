"use client";

import { PayPalButtons } from "@paypal/react-paypal-js";
import { useToast } from "@/hooks/use-toast";
import { Lock, ShieldCheck } from "lucide-react";

interface PaypalButtonProps {
    amount: number;
    onSuccess: () => void;
    payeeEmail?: string; // Routes payment directly to the seller
}

/**
 * Enhanced PayPal button supporting direct peer-to-peer routing.
 */
export function PaypalButton({ amount, onSuccess, payeeEmail }: PaypalButtonProps) {
    const { toast } = useToast();

    return (
        <div className="w-full space-y-3">
            <PayPalButtons
                style={{ layout: "vertical", shape: "rect", label: "pay" }}
                createOrder={(data, actions) => {
                    return actions.order.create({
                        intent: "CAPTURE",
                        purchase_units: [
                            {
                                amount: {
                                    currency_code: "USD",
                                    value: amount.toFixed(2),
                                },
                                // Direct routing to the creator's PayPal account
                                payee: payeeEmail ? {
                                    email_address: payeeEmail
                                } : undefined,
                            },
                        ],
                    });
                }}
                onApprove={(data, actions) => {
                    if (actions.order) {
                        return actions.order.capture().then((details) => {
                            onSuccess();
                        });
                    }
                    return Promise.reject("Order capture failed.");
                }}
                onError={(err) => {
                    console.error("PayPal Error:", err);
                    toast({
                        variant: "destructive",
                        title: "Transaction Failed",
                        description: "Payment could not be processed. Please verify your PayPal account.",
                    });
                }}
            />

            <div className="flex items-center justify-center gap-1.5 text-muted-foreground mt-4">
                <Lock className="h-3 w-3" />
                <p className="text-[10px] uppercase tracking-widest font-semibold">
                    Secure SSL Encryption
                </p>
                <ShieldCheck className="h-3 w-3 ml-2" />
                <p className="text-[10px] uppercase tracking-widest font-semibold">
                    Verified Checkout
                </p>
            </div>
        </div>
    );
}
