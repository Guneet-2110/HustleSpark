
"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getFunctions, httpsCallable } from "firebase/functions";
import { Loader2, CheckCircle, XCircle, Rocket, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, isUserLoading } = useAuth();
    const { toast } = useToast();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const processingRef = useRef(false);

    useEffect(() => {
        const processSuccess = async () => {
            // Prevent double-processing
            if (processingRef.current) return;
            
            const listingId = searchParams.get("listingId");
            const sellerEmail = searchParams.get("sellerEmail");
            const amount = parseFloat(searchParams.get("amount") || "0");
            const paymentIntent = searchParams.get("payment_intent");

            if (!listingId || !sellerEmail || !amount || !paymentIntent) {
                console.error("Missing required payment success parameters");
                setStatus("error");
                return;
            }

            processingRef.current = true;
            try {
                const functions = getFunctions();
                const confirmPayout = httpsCallable(functions, "confirmAndPayoutSeller");
                
                await confirmPayout({
                    paymentIntentId: paymentIntent,
                    sellerEmail,
                    totalAmount: amount,
                    listingId,
                });
                
                setStatus("success");
                toast({
                    title: "Transaction Recorded",
                    description: "Your acquisition is now being processed in escrow."
                });
            } catch (error: any) {
                console.error("Payout error:", error);
                setStatus("error");
                toast({
                    variant: "destructive",
                    title: "Processing Error",
                    description: error.message || "We had trouble finalizing your acquisition."
                });
            }
        };

        if (!isUserLoading && user && status === "loading") {
            processSuccess();
        } else if (!isUserLoading && !user) {
            // If no user, we might be in an anonymous state or need to redirect
            setStatus("error");
        }
    }, [user, isUserLoading, searchParams, status, toast]);

    if (status === "loading") {
        return (
            <div className="container py-32 text-center space-y-6">
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                    <Loader2 className="animate-spin h-20 w-20 mx-auto text-primary relative z-10" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-black tracking-tight">Securing Your Venture</h1>
                    <p className="text-muted-foreground font-medium">Finalizing escrow records and notifying the creator...</p>
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-50">Please do not refresh this page.</p>
            </div>
        );
    }

    if (status === "success") {
        return (
            <div className="container py-32 text-center space-y-8">
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full" />
                    <CheckCircle className="h-24 w-24 mx-auto text-green-500 relative z-10" />
                </div>
                <div className="space-y-4 max-w-lg mx-auto">
                    <h1 className="text-5xl font-black tracking-tighter">Venture Acquired! 🚀</h1>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        Your secure acquisition is complete. The creator has been notified to deliver the assets to your dashboard.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" className="h-16 px-10 rounded-2xl font-black text-xl shadow-xl group" onClick={() => router.push("/profile")}>
                        Go to Dashboard
                        <Rocket className="ml-2 h-6 w-6 transition-transform group-hover:scale-110" />
                    </Button>
                    <Button variant="outline" size="lg" className="h-16 px-10 rounded-2xl font-bold text-lg border-2" onClick={() => router.push("/marketplace")}>
                        Marketplace
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-32 text-center space-y-8">
            <XCircle className="h-24 w-24 mx-auto text-red-500" />
            <div className="space-y-4 max-w-lg mx-auto">
                <h1 className="text-4xl font-black">Something went wrong</h1>
                <p className="text-muted-foreground text-lg">
                    Your payment was successful, but we had trouble recording the transaction in our system. Please take a screenshot of this page and contact support.
                </p>
            </div>
            <div className="flex gap-4 justify-center">
                <Button variant="secondary" className="h-14 px-8 rounded-2xl font-bold" onClick={() => window.location.reload()}>
                    Retry Processing
                </Button>
                <Button variant="outline" className="h-14 px-8 rounded-2xl font-bold" onClick={() => router.push("/marketplace")}>
                    Back to Marketplace
                </Button>
            </div>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={
            <div className="container py-32 text-center">
                <Loader2 className="animate-spin h-12 w-12 mx-auto text-primary" />
                <p className="mt-4 font-bold text-muted-foreground">Initializing success handler...</p>
            </div>
        }>
            <PaymentSuccessContent />
        </Suspense>
    );
}
