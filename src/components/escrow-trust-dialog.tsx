"use client";

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShieldCheck, Lock, Package, CheckCircle2, DollarSign } from 'lucide-react';

interface EscrowTrustDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EscrowTrustDialog({ open, onOpenChange }: EscrowTrustDialogProps) {
    const { user } = useUser();
    const { toast } = useToast();
    const [showContact, setShowContact] = useState(false);
    const [issue, setIssue] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleSendIssue = async () => {
        if (!issue.trim() || !contactEmail.trim()) {
            toast({ variant: 'destructive', title: 'All fields required' });
            return;
        }
        setIsSending(true);
        try {
            const { getFunctions, httpsCallable } = await import('firebase/functions');
            const functions = getFunctions();
            const notify = httpsCallable(functions, 'sendSaleNotification');
            await notify({
                hustleName: 'SUPPORT REQUEST',
                totalAmount: 0,
                sellerEmail: 'guneet.ar2010@gmail.com',
                buyerEmail: contactEmail,
                listingId: 'support',
                status: `🆘 SUPPORT ISSUE FROM ${contactEmail}: ${issue}`,
            });
            toast({ title: 'Message Sent!', description: "We'll get back to you within 24 hours." });
            setShowContact(false);
            setIssue('');
            onOpenChange(false);
        } catch (e) {
            toast({ variant: 'destructive', title: 'Failed to send', description: 'Please email us directly at guneet.ar2010@gmail.com' });
        } finally {
            setIsSending(false);
        }
    };
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
                            {!showContact ? (
                                <p className="text-xs text-center text-muted-foreground italic">
                                    Not satisfied?{' '}
                                    <button onClick={() => { setContactEmail(user?.email || ''); setShowContact(true); }} className="text-primary font-bold hover:underline">
                                        Contact us
                                    </button>
                                    {' '}within 7 days and we'll make it right.
                                </p>
                            ) : (
                                <div className="space-y-3 bg-primary/5 p-4 rounded-2xl border border-primary/10">
                                    <p className="text-sm font-black">Contact Support</p>
                                    <div className="space-y-1">
                                        <Label className="text-xs font-bold">Your Email</Label>
                                        <Input className="h-10 rounded-xl text-sm" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="your@email.com" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs font-bold">Describe Your Issue</Label>
                                        <Textarea className="rounded-xl text-sm min-h-[80px]" value={issue} onChange={(e) => setIssue(e.target.value)} placeholder="What went wrong? Include your transaction details..." />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => setShowContact(false)}>Cancel</Button>
                                        <Button size="sm" className="rounded-xl font-bold flex-1" onClick={handleSendIssue} disabled={isSending}>
                                            {isSending ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                                            Send to Support
                                        </Button>
                                    </div>
                                </div>
                            )}
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
