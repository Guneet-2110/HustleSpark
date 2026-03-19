"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShieldCheck, Lock, Package, CheckCircle2, DollarSign } from 'lucide-react';

interface EscrowTrustDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EscrowTrustDialog({ open, onOpenChange }: EscrowTrustDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                <div className="bg-background max-h-[90vh] flex flex-col">
                    <DialogHeader className="p-8 pb-4">
                        <div className="flex items-center justify-between">
                            <DialogTitle className="text-3xl font-black flex items-center gap-3">
                                <ShieldCheck className="h-8 w-8 text-primary" />
                                Your Money is Always Protected
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-base font-medium pt-2">
                            HustleSpark uses a secure escrow system for every transaction. Here's how it works:
                        </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="flex-1 px-8 pb-6">
                        <div className="space-y-6 py-4">
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <Lock className="h-5 w-5 text-primary" />
                                </div>
                                <div className="text-sm leading-relaxed">
                                    <span className="font-black block text-base mb-0.5">🔒 You pay securely</span>
                                    Your payment is held safely and never goes directly to the seller.
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <Package className="h-5 w-5 text-primary" />
                                </div>
                                <div className="text-sm leading-relaxed">
                                    <span className="font-black block text-base mb-0.5">📦 Seller delivers</span>
                                    The seller has 3 days to deliver the full hustle blueprint, strategy, and materials to you.
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <CheckCircle2 className="h-5 w-5 text-primary" />
                                </div>
                                <div className="text-sm leading-relaxed">
                                    <span className="font-black block text-base mb-0.5">✅ You confirm</span>
                                    Once you're happy with what you received, you confirm delivery.
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                                    <DollarSign className="h-5 w-5 text-green-500" />
                                </div>
                                <div className="text-sm leading-relaxed">
                                    <span className="font-black block text-base mb-0.5">💸 Seller gets paid</span>
                                    Only after your confirmation do we release 90% of the payment to the seller.
                                </div>
                            </div>

                            <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 mt-4">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground leading-relaxed">
                                    🛡️ Every purchase is manually reviewed by the HustleSpark team before funds are released. If there's ever a dispute, we step in to make it right.
                                </p>
                            </div>
                            <p className="text-xs text-center text-muted-foreground italic">
                                Not satisfied? Contact us at <span className="text-primary font-bold">hustlespark.net/support</span> within 7 days and we'll make it right.
                            </p>
                        </div>
                    </ScrollArea>

                    <DialogFooter className="p-8 pt-4 bg-muted/20 border-t">
                        <Button className="w-full h-14 rounded-2xl font-black text-lg shadow-xl" onClick={() => onOpenChange(false)}>
                            Got it, thanks!
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
