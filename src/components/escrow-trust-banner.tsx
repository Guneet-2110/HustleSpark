"use client";

import { ShieldCheck, Lock, Package, CheckCircle2, Info } from 'lucide-react';
import { Card, CardContent } from './ui/card';

export function EscrowTrustBanner() {
    return (
        <Card className="border-primary/20 bg-primary/5 rounded-3xl overflow-hidden mb-6">
            <CardContent className="p-6 space-y-4">
                <div className="space-y-1">
                    <h3 className="text-xl font-black flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        Your Money is Always Protected
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium">
                        HustleSpark uses a secure escrow system for every transaction. Here's how it works:
                    </p>
                </div>

                <div className="grid gap-3">
                    <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Lock className="h-4 w-4 text-primary" />
                        </div>
                        <p className="text-xs leading-relaxed">
                            <span className="font-bold">🔒 You pay securely</span> — Your payment is held safely and never goes directly to the seller.
                        </p>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Package className="h-4 w-4 text-primary" />
                        </div>
                        <p className="text-xs leading-relaxed">
                            <span className="font-bold">📦 Seller delivers</span> — The seller has 3 days to deliver the full hustle blueprint, strategy, and materials to you.
                        </p>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                        </div>
                        <p className="text-xs leading-relaxed">
                            <span className="font-bold">✅ You confirm</span> — Once you're happy with what you received, you confirm delivery.
                        </p>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </div>
                        <p className="text-xs leading-relaxed">
                            <span className="font-bold">💸 Seller gets paid</span> — Only after your confirmation do we release 90% of the payment to the seller.
                        </p>
                    </div>
                </div>

                <div className="pt-4 border-t border-primary/10">
                    <div className="flex items-start gap-2 bg-background/50 p-3 rounded-2xl border">
                        <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Every purchase is manually reviewed by the HustleSpark team before funds are released. If there's ever a dispute, we step in to make it right.
                        </p>
                    </div>
                    
                </div>
            </CardContent>
        </Card>
    );
}
