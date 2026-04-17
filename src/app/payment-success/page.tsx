
"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { httpsCallable } from "firebase/functions";
import { Loader2, CheckCircle, XCircle, Rocket, Sparkles, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useFunctions, useUser } from "@/firebase";

function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { upgradeToPremium } = useAuth();
    const { user: firebaseUser, isUserLoading } = useUser();
    const { toast } = useToast();
    const functions = useFunctions();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isUpgrade, setIsUpgrade] = useState(false);
    const processingRef = useRef(false);

    useEffect(() => {
        const processSuccess = async () => {
            if (processingRef.current || isConfirmed) return;
            
            const listingId = searchParams.get("listingId");
            const sellerEmail = searchParams.get("sellerEmail");
            const amount = parseFloat(searchParams.get("amount") || "0");
            const sessionId = searchParams.get("session_id");

            if (!listingId || !sessionId || !functions) {
                return;
            }

            processingRef.current = true;

            // Handle Premium Upgrade Case
            if (listingId === "premium_upgrade") {
                setIsUpgrade(true);
                upgradeToPremium(30);
                setIsConfirmed(true);
                setStatus("success");
                toast({ title: "Premium Activated!", description: "30 days of growth tools unlocked." });
                return;
            }

            // Handle Venture Acquisition Case
            try {
                const confirmPayout = httpsCallable(functions, "confirmAndPayoutSeller");
                const result: any = await confirmPayout({
                    sessionId,
                    sellerEmail,
                    totalAmount: amount,
                    listingId,
                });
                
                if (result.data?.success) {
                    setIsConfirmed(true);
                    setStatus("success");
                    toast({
                        title: "Acquisition Secured",
                        description: "Venture records created. Support channel initialized."
                    });
                } else {
                    throw new Error(result.data?.message || "Record creation failed");
                }
            } catch (error: any) {
                console.error("Payout confirmation error:", error);
                if (error.message?.includes("Already processed")) {
                    setStatus("success");
                    setIsConfirmed(true);
                } else {
                    setStatus("error");
                    toast({
                        variant: "destructive",
                        title: "Sync Error",
                        description: error.message || "We had trouble finalizing your acquisition record."
                    });
                }
            }
        };

        if (!isUserLoading && firebaseUser && status === "loading" && functions) {
            processSuccess();
        }
    }, [firebaseUser, isUserLoading, searchParams, status, toast, functions, isConfirmed, upgradeToPremium]);

    if (status === "loading") {
        return (
            <div className="container py-32 text-center space-y-6">
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                    <Loader2 className="animate-spin h-20 w-20 mx-auto text-primary relative z-10" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-black tracking-tight">Securing Your Transaction</h1>
                    <p className="text-muted-foreground font-medium">Provisioning access and updating records...</p>
                </div>
            </div>
        );
    }

    if (status === "success") {
        return (
            <div className="container py-32 text-center space-y-8">
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full" />
                    {isUpgrade ? <Sparkles className="h-24 w-24 mx-auto text-primary relative z-10" /> : <CheckCircle className="h-24 w-24 mx-auto text-green-500 relative z-10" />}
                </div>
                <div className="space-y-4 max-w-lg mx-auto">
                    <h1 className="text-5xl font-black tracking-tighter text-green-500">
                        {isUpgrade ? "Premium Active! 🚀" : "Purchase Complete! 🚀"}
                    </h1>
                    <p className="text-muted-foreground text-lg leading-relaxed font-medium">
                        {isUpgrade 
                            ? "Your account has been upgraded. All AI tools, marketing kits, and trackers are now fully unlocked."
                            : "The creator has been notified. You can now chat with them to get started and start a conversation from your dashboard."
                        }
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                    <Button size="lg" className="h-16 px-10 rounded-2xl font-black text-xl shadow-xl group" onClick={() => router.push("/profile")}>
                        Go to Dashboard
                        <LayoutDashboard className="ml-2 h-6 w-6 transition-transform group-hover:scale-110" />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-32 text-center space-y-8">
            <XCircle className="h-24 w-24 mx-auto text-red-500" />
            <h1 className="text-4xl font-black tracking-tight">Sync Encountered a Delay</h1>
            <p className="text-muted-foreground max-w-md mx-auto font-medium">
                Payment was successful, but we had trouble recording the update. Don't worry, our team will manually verify this within 12 hours.
            </p>
            <Button variant="outline" size="lg" className="h-14 px-8 rounded-xl font-bold" onClick={() => router.push("/profile")}>
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
