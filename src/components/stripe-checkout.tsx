
"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { getFunctions, httpsCallable } from "firebase/functions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Lock, ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Load stripe outside of component to prevent re-initialization
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

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
    const [isStripeError, setIsStripeError] = useState(false);

    useEffect(() => {
        if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
            console.error("Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
            setIsStripeError(true);
        }
    }, []);

    const handlePayment = async () => {
        if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
            toast({
                variant: "destructive",
                title: "Configuration Error",
                description: "Stripe is not properly configured. Please contact support.",
            });
            return;
        }

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

            const { clientSecret } = result.data;
            const stripe = await stripePromise;

            if (!stripe) throw new Error("Stripe SDK failed to initialize.");

            // Redirect to Stripe hosted checkout or handle via Elements
            const { error } = await stripe.confirmPayment({
                clientSecret,
                confirmParams: {
                    return_url: `${window.location.origin}/payment-success?listingId=${listingId}&sellerEmail=${encodeURIComponent(sellerEmail)}&amount=${amount}`,
                },
            });

            if (error) {
                throw new Error(error.message);
            }

        } catch (error: any) {
            console.error("Payment error:", error);
            toast({
                variant: "destructive",
                title: "Payment Process Failed",
                description: error.message || "An unexpected error occurred during checkout.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isStripeError) {
        return (
            <Alert variant="destructive" className="rounded-2xl">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Checkout Unavailable</AlertTitle>
                <AlertDescription>
                    Stripe configuration keys are missing. Please check your environment variables.
                </AlertDescription>
            </Alert>
        );
    }

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
                    <><Loader2 className="animate-spin mr-2 h-6 w-6" /> Processing Securely...</>
                ) : (
                    `Complete Acquisition ($${amount.toLocaleString()})`
                )}
            </Button>

            <div className="flex items-center justify-center gap-3 text-muted-foreground">
                <div className="flex items-center gap-1.5">
                    <Lock className="h-3 w-3" />
                    <p className="text-[10px] uppercase tracking-widest font-bold">Secure SSL</p>
                </div>
                <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3 w-3" />
                    <p className="text-[10px] uppercase tracking-widest font-bold">Escrow Verified</p>
                </div>
            </div>
        </div>
    );
}
