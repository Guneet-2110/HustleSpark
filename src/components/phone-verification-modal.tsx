"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Phone, Shield, Loader2, CheckCircle } from 'lucide-react';
import { RecaptchaVerifier, linkWithPhoneNumber } from 'firebase/auth';
import { useAuth as useFirebaseAuth, useFirestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';

interface PhoneVerificationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onVerified: () => void;
}

export function PhoneVerificationModal({ open, onOpenChange, onVerified }: PhoneVerificationModalProps) {
    const { toast } = useToast();
    const firebaseAuth = useFirebaseAuth();
    const firestore = useFirestore();
    const [step, setStep] = useState<'phone' | 'code' | 'success'>('phone');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [confirmationResult, setConfirmationResult] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSendCode = async () => {
        if (!phoneNumber.trim()) {
            toast({ variant: 'destructive', title: 'Phone Required', description: 'Please enter your phone number.' });
            return;
        }

        if (!firebaseAuth.currentUser) {
            toast({ variant: 'destructive', title: 'Not logged in', description: 'Please log in first.' });
            return;
        }

        setIsLoading(true);
        try {
            const recaptchaVerifier = new RecaptchaVerifier(firebaseAuth, 'recaptcha-container', {
                size: 'invisible',
            });

            const formatted = phoneNumber.startsWith('+') ? phoneNumber : `+1${phoneNumber.replace(/\D/g, '')}`;
            
            // Use linkWithPhoneNumber instead of signInWithPhoneNumber
            // This links phone to existing account WITHOUT replacing the session
            const result = await linkWithPhoneNumber(firebaseAuth.currentUser, formatted, recaptchaVerifier);
            setConfirmationResult(result);
            setStep('code');
            toast({ title: 'Code Sent!', description: `Verification code sent to ${formatted}` });
        } catch (error: any) {
            console.error('Phone verification error:', error);
            // If phone is already linked to this account, skip verification
            if (error.code === 'auth/provider-already-linked') {
                if (firebaseAuth.currentUser && firestore) {
                    const userRef = doc(firestore, 'users', firebaseAuth.currentUser.uid);
                    await setDoc(userRef, { phoneVerified: true, phoneNumber: phoneNumber }, { merge: true });
                }
                setStep('success');
                setTimeout(() => {
                    onOpenChange(false);
                    setStep('phone');
                    setPhoneNumber('');
                    onVerified();
                }, 1000);
                return;
            }
            toast({ variant: 'destructive', title: 'Failed to Send Code', description: error.message || 'Please check your phone number and try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        if (!verificationCode.trim() || !confirmationResult) return;

        setIsLoading(true);
        try {
            // confirm() here completes the link, not a new sign-in
            await confirmationResult.confirm(verificationCode);

            // Save phoneVerified to Firestore
            const currentUser = firebaseAuth.currentUser;
            if (currentUser && firestore) {
                const userRef = doc(firestore, 'users', currentUser.uid);
                await setDoc(userRef, {
                    phoneVerified: true,
                    phoneNumber: phoneNumber
                }, { merge: true });
            }

            setStep('success');
            toast({ title: 'Phone Verified! ✅', description: 'Opening marketplace launchpad...' });

            setTimeout(() => {
                onOpenChange(false);
                setStep('phone');
                setPhoneNumber('');
                setVerificationCode('');
                onVerified();
            }, 1000);

        } catch (error: any) {
            console.error('Verification error:', error);
            setVerificationCode('');
            toast({
                variant: 'destructive',
                title: 'Verification Failed',
                description: 'Please request a new code and try again.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md rounded-[2.5rem]">
                <DialogHeader>
                    <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                        {step === 'success' ? <CheckCircle className="h-7 w-7 text-green-500" /> : <Phone className="h-7 w-7 text-primary" />}
                    </div>
                    <DialogTitle className="text-2xl font-black text-center">
                        {step === 'phone' && 'Verify Your Phone'}
                        {step === 'code' && 'Enter Verification Code'}
                        {step === 'success' && 'Phone Verified!'}
                    </DialogTitle>
                    <DialogDescription className="text-center font-medium">
                        {step === 'phone' && 'To protect buyers, sellers must verify their phone number before listing.'}
                        {step === 'code' && `Enter the 6-digit code sent to ${phoneNumber}`}
                        {step === 'success' && 'You can now list your venture on the marketplace!'}
                    </DialogDescription>
                </DialogHeader>

                <div id="recaptcha-container" />

                {step === 'phone' && (
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="font-bold">Phone Number</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    className="h-12 rounded-xl pl-10"
                                    placeholder="+1 (555) 000-0000"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground font-medium">Include country code e.g. +1 for US, +44 for UK</p>
                        </div>
                        <Button className="w-full h-12 rounded-2xl font-black" onClick={handleSendCode} disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <Shield className="mr-2 h-5 w-5" />}
                            Send Verification Code
                        </Button>
                    </div>
                )}

                {step === 'code' && (
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="font-bold">6-Digit Code</Label>
                            <Input
                                className="h-12 rounded-xl text-center text-2xl font-black tracking-[0.5em]"
                                placeholder="000000"
                                maxLength={6}
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                            />
                        </div>
                        <Button className="w-full h-12 rounded-2xl font-black" onClick={handleVerifyCode} disabled={isLoading || verificationCode.length !== 6}>
                            {isLoading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : null}
                            Verify Code
                        </Button>
                        <button onClick={() => setStep('phone')} className="w-full text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                            Use a different number
                        </button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}