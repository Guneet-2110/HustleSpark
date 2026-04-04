
"use client";

import { useState } from "react";
import { httpsCallable } from "firebase/functions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Lock, ShieldCheck, Loader2, ArrowRight, Sparkles } from "lucide-react";
import { useFunctions } from "@/firebase";

interface StripeUpgradeButtonProps {
    amount: number;
    onSuccess: () => void;
}

export function StripeUpgradeButton({ amount, onSuccess }: StripeUpgradeButtonProps) {
    const { toast } = useToast();
    const functions = useFunctions();
    const [isLoading, setIsLoading] = useState(false);

    const handleUpgrade = async () => {
        if (!functions) {
            toast({
                variant: "destructive",
                title: "System Error",
                description: "Payment services are still initializing. Please wait a moment.",
            });
            return;
        }

        setIsLoading(true);
        try {
            const createPayment = httpsCallable(functions, "createStripePayment");
            
            // Reusing the general payment function with special upgrade parameters
            const result: any = await createPayment({
                amount,
                listingId: "premium_upgrade",
                sellerEmail: "admin@hustlespark.net",
                hustleName: "HustleSpark Premium Upgrade (30 Days)",
            });

            const { url } = result.data;

            if (url) {
                window.location.href = url;
            } else {
                throw new Error("Payment link could not be generated.");
            }

        } catch (error: any) {
            console.error("Stripe Upgrade Error:", error);
            toast({
                variant: "destructive",
                title: "Payment Error",
                description: error.message || "Failed to initialize checkout session.",
            });
            setIsLoading(false);
        }
    };

    return (
        <Button 
            className="w-full h-16 text-xl font-black rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-95 group bg-gradient-to-r from-primary to-accent border-none" 
            onClick={handleUpgrade}
            disabled={isLoading}
        >
            {isLoading ? (
                <>
                    <Loader2 className="animate-spin mr-2 h-6 w-6" /> 
                    Securing Session...
                </>
            ) : (
                <div className="flex items-center">
                    <Sparkles className="mr-2 h-6 w-6" />
                    Activate Premium Access
                    <ArrowRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-1" />
                </div>
            )}
        </Button>
    );
}
