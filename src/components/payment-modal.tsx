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
import { Star, CheckCircle2 } from 'lucide-react';
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { PaypalButton } from './paypal-button';

export function PaymentModal() {
  const { isPaymentModalOpen, setPaymentModalOpen, upgradeToPremium } = useAuth();
  const { toast } = useToast();
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePaymentSuccess = () => {
    setIsSuccess(true);
    setTimeout(() => {
        upgradeToPremium(false);
        setPaymentModalOpen(false);
        setIsSuccess(false);
        toast({
            title: 'Premium Activated!',
            description: 'Welcome to HustleSpark Premium! You have full access for 30 days.',
        });
    }, 1500);
  }

  return (
    <Dialog open={isPaymentModalOpen} onOpenChange={setPaymentModalOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Star className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl text-center font-bold">
            {isSuccess ? "Payment Confirmed!" : "Upgrade to Premium"}
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
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
            <>
                <div className="space-y-4 py-4">
                    <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="font-medium">Monthly Plan</span>
                            <span className="font-bold">$15.00</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Includes 30 days of unlimited generations and tools.
                        </div>
                    </div>
                </div>
                <div className="pt-2">
                    <PaypalButton 
                        amount={15} 
                        onSuccess={handlePaymentSuccess} 
                    />
                </div>
            </>
        )}
        
        <DialogFooter className="mt-4 flex flex-col items-center">
             <p className="text-[10px] text-muted-foreground text-center">
                Secure checkout powered by PayPal. No recurring billing in this demo.
             </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
