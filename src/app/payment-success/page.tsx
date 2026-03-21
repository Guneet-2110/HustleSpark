
"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { httpsCallable } from "firebase/functions";
import { Loader2, CheckCircle, XCircle, Rocket, ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useFunctions } from "@/firebase";

function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, isUserLoading } = useAuth();
    const { toast } = useToast();
    const functions = useFunctions();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const processingRef = useRef(false);

    useEffect(() => {
        const processSuccess = async () => {
            if (processingRef.current) return;
            
            const listingId = searchParams.get("listingId");
            const sellerEmail = searchParams.get("sellerEmail");
            const amount = parseFloat(searchParams.get("amount") || "0");
            const sessionId = searchParams.get("session_id");

            if (!listingId || !sellerEmail || !amount || !sessionId || !functions) {
                if (!functions && !isUserLoading) {
                    console.error("Functions SDK not ready");
                    setStatus("error");
                }
                return;
            }

            processingRef.current = true;
            try {
                const confirmPayout = httpsCallable(functions, "confirmAndPayoutSeller");
                
                await confirmPayout({
                    sessionId,
                    sellerEmail,
                    totalAmount: amount,
                    listingId,
                });
                
                setStatus("success");
                toast({
                    title: "Acquisition Finalized",
                    description: "Escrow record created. You can now chat with the creator."
                });
            } catch (error: any) {
                console.error("Payout confirmation error:", error);
                setStatus("error");
                toast({
                    variant: "destructive",
                    title: "Sync Error",
                    description: error.message || "We had trouble finalizing your acquisition record."
                });
            }
        };

        if (!isUserLoading && user && status === "loading") {
            processSuccess();
        }
    }, [user, isUserLoading, searchParams, status, toast, functions]);

    if (status === "loading") {
        return (
            <div className="container py-32 text-center space-y-6">
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                    <Loader2 className="animate-spin h-20 w-20 mx-auto text-primary relative z-10" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-black tracking-tight">Finalizing Your Acquisition</h1>
                    <p className="text-muted-foreground font-medium">Securing your escrow record and opening communication channels...</p>
                </div>
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
                    <h1 className="text-5xl font-black tracking-tighter">Acquisition Complete! 🚀</h1>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        The creator has been notified. You can now access your new venture assets and start a conversation from your dashboard.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" className="h-16 px-10 rounded-2xl font-black text-xl shadow-xl group" onClick={() => router.push("/profile")}>
                        Go to Venture Dashboard
                        <Rocket className="ml-2 h-6 w-6 transition-transform group-hover:scale-110" />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-32 text-center space-y-8">
            <XCircle className="h-24 w-24 mx-auto text-red-500" />
            <h1 className="text-4xl font-black">Something went wrong</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
                Payment was successful, but we had trouble recording the acquisition. Please contact support with your session ID.
            </p>
            <Button variant="outline" size="lg" onClick={() => router.push("/profile")}>
                Return to Dashboard
            </Button>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={<div className="container py-32 text-center"><Loader2 className="animate-spin h-10 w-10 mx-auto text-primary" /></div>}>
            <PaymentSuccessContent />
        </Suspense>
    );
}
