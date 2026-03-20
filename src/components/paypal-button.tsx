
"use client";

import { PayPalButtons } from "@paypal/react-paypal-js";
import { useToast } from "@/hooks/use-toast";
import { Lock, ShieldCheck, Loader2 } from "lucide-react";
import { useFirestore, useUser } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useState } from "react";

interface PaypalButtonProps {
    amount: number;
    onSuccess: () => void;
    payeeEmail?: string;
    listingId?: string;
    sellerId?: string;
    hustleName?: string;
}

export function PaypalButton({ amount, onSuccess, payeeEmail, listingId, sellerId, hustleName }: PaypalButtonProps) {
    const { toast } = useToast();
    const firestore = useFirestore();
    const { user } = useUser();
    const [isProcessing, setIsProcessing] = useState(false);

    return (
        <div className="w-full space-y-3 relative">
            {isProcessing && (
                <div className="absolute inset-0 z-50 bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                    <p className="text-xs font-bold uppercase tracking-widest text-primary">Finalizing Acquisition...</p>
                </div>
            )}
            
            <PayPalButtons
                style={{ layout: "vertical", shape: "rect", label: "pay" }}
                disabled={isProcessing}
                createOrder={(data, actions) => {
                    return actions.order.create({
                        intent: "CAPTURE",
                        purchase_units: [{
                            amount: {
                                currency_code: "USD",
                                value: amount.toFixed(2),
                            },
                            ...(payeeEmail ? { payee: { email_address: payeeEmail } } : {})
                        }],
                    });
                }}
                onApprove={(data, actions) => {
                    if (actions.order) {
                        return actions.order.capture().then(async (details) => {
                            setIsProcessing(true);
                            try {
                                if (!firestore || !user) throw new Error("Services unavailable");

                                const sellerAmount = parseFloat((amount * 0.9).toFixed(2));
                                const platformFee = parseFloat((amount * 0.1).toFixed(2));

                                // Create Escrow Transaction Record
                                await addDoc(collection(firestore, "transactions"), {
                                    buyerId: user.uid,
                                    buyerEmail: user.email || "",
                                    sellerId: sellerId || "",
                                    sellerEmail: payeeEmail || "",
                                    listingId: listingId || "",
                                    hustleName: hustleName || "Venture Acquisition",
                                    amount: amount,
                                    sellerAmount: sellerAmount,
                                    platformFee: platformFee,
                                    status: "pending_delivery",
                                    createdAt: serverTimestamp(),
                                });

                                toast({
                                    title: "Payment Captured",
                                    description: "Transaction initialized in escrow. Awaiting delivery from the creator.",
                                });

                                // Ensure navigation happens after a short delay to allow PayPal UI to close
                                setTimeout(() => {
                                    onSuccess();
                                }, 500);
                            } catch (error: any) {
                                console.error("Escrow recording error:", error);
                                setIsProcessing(false);
                                toast({
                                    variant: "destructive",
                                    title: "System Error",
                                    description: "Payment captured but record failed. Please contact support.",
                                });
                                onSuccess();
                            }
                        });
                    }
                    return Promise.reject("Order capture failed.");
                }}
                onError={(err) => {
                    console.error("PayPal Error:", err);
                    setIsProcessing(false);
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
