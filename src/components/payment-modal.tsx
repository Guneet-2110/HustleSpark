
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/use-auth';
import { Button } from './ui/button';
import { Star, CheckCircle2, CreditCard } from 'lucide-react';
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { PaypalButton } from './paypal-button';
import { StripeUpgradeButton } from './stripe-upgrade-button';

export function PaymentModal() {
  const { isPaymentModalOpen, setPaymentModalOpen, upgradeToPremium } = useAuth();
  const { toast } = useToast();
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'selection' | 'stripe' | 'paypal'>('selection');

  const handlePaymentSuccess = () => {
    setIsSuccess(true);
    setTimeout(() => {
        upgradeToPremium(30);
        setPaymentModalOpen(false);
        setIsSuccess(false);
        setPaymentMethod('selection');
        toast({
            title: 'Premium Activated!',
            description: 'Welcome to HustleSpark Premium! You have full access for 30 days.',
        });
    }, 1500);
  }

  return (
    <Dialog open={isPaymentModalOpen} onOpenChange={(open) => {
        setPaymentModalOpen(open);
        if (!open) setPaymentMethod('selection');
    }}>
      <DialogContent className="sm:max-w-md rounded-[2.5rem]">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Star className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl text-center font-black">
            {isSuccess ? "Payment Confirmed!" : "Unlock Premium Growth"}
          </DialogTitle>
          <DialogDescription className="text-center pt-2 font-medium">
            {isSuccess 
                ? "Redirecting to your premium dashboard..." 
                : "Unlock full marketing kits, AI coaching, blueprints, and more for just $15/month."}
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
                <CheckCircle2 className="h-16 w-16 text-green-500 animate-bounce" />
                <p className="font-semibold text-lg">Thank you for your purchase!</p>
            </div>
        ) : (
            <div className="space-y-6 py-4">
                <div className="bg-muted/50 p-6 rounded-[2rem] border border-primary/10 space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="font-black text-lg">Monthly Plan</span>
                        <span className="font-black text-2xl text-primary">$15.00</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
                        30 Days of Unlimited Access
                    </p>
                </div>

                {paymentMethod === 'selection' && (
                    <div className="grid gap-3">
                        <Button 
                            className="h-14 rounded-2xl font-black text-lg shadow-xl" 
                            onClick={() => setPaymentMethod('stripe')}
                        >
                            <CreditCard className="mr-2 h-5 w-5" />
                            Pay with Card (Stripe)
                        </Button>
                        <Button 
                            variant="secondary" 
                            className="h-14 rounded-2xl font-black text-lg border-2" 
                            onClick={() => setPaymentMethod('paypal')}
                        >
                            Pay with PayPal
                        </Button>
                    </div>
                )}

                {paymentMethod === 'stripe' && (
                    <div className="space-y-4 animate-in fade-in zoom-in-95">
                        <StripeUpgradeButton amount={15} onSuccess={handlePaymentSuccess} />
                        <Button variant="ghost" className="w-full text-xs" onClick={() => setPaymentMethod('selection')}>
                            Go Back
                        </Button>
                    </div>
                )}

                {paymentMethod === 'paypal' && (
                    <div className="space-y-4 animate-in fade-in zoom-in-95">
                        <PaypalButton amount={15} onSuccess={handlePaymentSuccess} />
                        <Button variant="ghost" className="w-full text-xs" onClick={() => setPaymentMethod('selection')}>
                            Go Back
                        </Button>
                    </div>
                )}
            </div>
        )}
        
        <DialogFooter className="flex flex-col items-center">
             <p className="text-[10px] text-muted-foreground text-center font-bold uppercase tracking-widest opacity-60">
                Secure SSL Protected Checkout
             </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
