
"use client";

import { PayPalButtons } from "@paypal/react-paypal-js";
import { useToast } from "@/hooks/use-toast";
import { Lock, ShieldCheck } from "lucide-react";
import { useFirestore, useUser } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

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

    return (
        <div className="w-full space-y-3">
            <PayPalButtons
                style={{ layout: "vertical", shape: "rect", label: "pay" }}
                createOrder={(data, actions) => {
                    const purchaseUnit: any = {
                        amount: {
                            currency_code: "USD",
                            value: amount.toFixed(2),
                        }
                    };

                    // If a specific payee is provided, direct the payment to them
                    if (payeeEmail) {
                        purchaseUnit.payee = {
                            email_address: payeeEmail
                        };
                    }

                    return actions.order.create({
                        intent: "CAPTURE",
                        purchase_units: [purchaseUnit],
                    });
                }}
                onApprove={(data, actions) => {
                    if (actions.order) {
                        return actions.order.capture().then(async (details) => {
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

                                onSuccess();
                            } catch (error: any) {
                                console.error("Escrow recording error:", error);
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
