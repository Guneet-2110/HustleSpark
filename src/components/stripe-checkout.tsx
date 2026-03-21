"use client";

import { useState } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Lock, ShieldCheck, Loader2, ArrowRight } from "lucide-react";

interface StripeCheckoutProps {
    amount: number;
    listingId: string;
    sellerEmail: string;
    hustleName: string;
    buyerId: string;
    onSuccess: () => void;
}

export function StripeCheckout({ amount, listingId, sellerEmail, hustleName, buyerId, onSuccess }: StripeCheckoutProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handlePayment = async () => {
        setIsLoading(true);
        try {
            const functions = getFunctions();
            const createPayment = httpsCallable(functions, "createStripePayment");
            
            const result: any = await createPayment({
                amount,
                listingId,
                sellerEmail,
                hustleName,
            });

            const { url } = result.data;

            if (url) {
                // Redirect to Stripe's hosted checkout page
                window.location.href = url;
            } else {
                console.error("Checkout response missing URL:", result.data);
                throw new Error("The payment system responded but didn't provide a checkout link.");
            }

        } catch (error: any) {
            console.error("Stripe Checkout Error:", error);
            
            // Extract the specific message from Firebase HttpsError if available
            const errorMessage = error.message || "An unexpected error occurred during checkout initialization.";
            
            toast({
                variant: "destructive",
                title: "Payment Error",
                description: errorMessage,
            });
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full space-y-4">
            <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 space-y-3">
                <div className="flex justify-between text-sm font-medium">
                    <span className="text-muted-foreground uppercase tracking-widest text-[10px]">Venture Listing</span>
                    <span className="font-bold">${amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                    <span className="text-muted-foreground uppercase tracking-widest text-[10px]">Platform Escrow Fee</span>
                    <span className="text-green-500 font-bold">Included</span>
                </div>
                <div className="border-t border-primary/10 pt-3 flex justify-between items-center">
                    <span className="font-black text-lg">Total Acquisition</span>
                    <span className="font-black text-2xl tracking-tighter">${amount.toLocaleString()}</span>
                </div>
            </div>

            <Button 
                className="w-full h-16 text-xl font-black rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-95 group" 
                onClick={handlePayment}
                disabled={isLoading}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="animate-spin mr-2 h-6 w-6" /> 
                        Securing Session...
                    </>
                ) : (
                    <div className="flex items-center">
                        Proceed to Secure Checkout
                        <ArrowRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-1" />
                    </div>
                )}
            </Button>

            <div className="flex items-center justify-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1.5">
                    <Lock className="h-3 w-3" />
                    <p className="text-[10px] uppercase tracking-widest font-bold">Secure SSL</p>
                </div>
                <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3 w-3" />
                    <p className="text-[10px] uppercase tracking-widest font-bold">Escrow Protected</p>
                </div>
            </div>
        </div>
    );
}