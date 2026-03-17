"use client";

import { PayPalButtons } from "@paypal/react-paypal-js";
import { useToast } from "@/hooks/use-toast";
import { Lock, ShieldCheck } from "lucide-react";
import { httpsCallable } from "firebase/functions";
import { useFirebase } from "@/firebase";

interface PaypalButtonProps {
    amount: number;
    onSuccess: () => void;
    payeeEmail?: string;
    listingId?: string;
    buyerId?: string;
}

export function PaypalButton({ amount, onSuccess, payeeEmail, listingId, buyerId }: PaypalButtonProps) {
    const { toast } = useToast();
    const { functions } = useFirebase();

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
                                // In a real PayPal production app, you might use 'payee' here
                                // but for this prototype, splitting is handled by our Cloud Function
                            },
                        ],
                    });
                }}
                onApprove={(data, actions) => {
                    if (actions.order) {
                        return actions.order.capture().then(async (details) => {
                            try {
                                // Call Cloud Function to split payment and record transaction
                                const processPayment = httpsCallable(functions, "processMarketplacePayout");
                                await processPayment({
                                    sellerEmail: payeeEmail,
                                    totalAmount: amount,
                                    listingId: listingId,
                                    buyerId: buyerId,
                                });
                                onSuccess();
                            } catch (error: any) {
                                console.error("Payout error:", error);
                                toast({
                                    variant: "destructive",
                                    title: "Payout Error",
                                    description: "Payment received but payout processing failed. Support notified.",
                                });
                                // Still call onSuccess since buyer's primary transaction completed
                                onSuccess();
                            }
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
