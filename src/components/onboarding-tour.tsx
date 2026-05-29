"use client";

import { useState, useEffect } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Sparkles, Store, Star, ArrowRight, X } from 'lucide-react';

const STEPS = [
    {
        id: 'welcome',
        title: 'Welcome to HustleSpark! 👋',
        description: "You're now part of a platform built for teen entrepreneurs like you. Let's show you around in 3 quick steps.",
        icon: '🚀',
        target: null,
        arrow: null,
    },
    {
        id: 'generator',
        title: 'Generate Your First Hustle',
        description: "Scroll down and tell us your age, interests, and time availability. Our AI will generate 3 personalized hustle ideas just for you — completely free!",
        icon: '💡',
        target: null,
        arrow: 'down',
    },
    {
        id: 'marketplace',
        title: 'Explore the Marketplace',
        description: "Browse hustles from other teen entrepreneurs. You can hire someone to help you, or sell your own service once you go Premium!",
        icon: '🛒',
        target: 'marketplace',
        arrow: 'up-left',
    },
    {
        id: 'premium',
        title: 'Unlock Your Full Potential',
        description: "Free users get 3 hustle ideas. Go Premium to unlock unlimited ideas, your AI coach Sparky, up to 16-week roadmaps, and the ability to sell on the marketplace.",
        icon: '⭐',
        target: 'pricing',
        arrow: 'up-left',
    },
];

export function OnboardingTour() {
    const firestore = useFirestore();
    const { user } = useUser();
    const [step, setStep] = useState(0);
    const [visible, setVisible] = useState(false);
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        if (!firestore || !user || checked) return;
        const check = async () => {
            const userRef = doc(firestore, 'users', user.uid);
            const snap = await getDoc(userRef);
            const data = snap.data();
            if (!data?.onboardingComplete) {
                setVisible(true);
            }
            setChecked(true);
        };
        check();
    }, [firestore, user, checked]);

    const complete = async () => {
        setVisible(false);
        if (!firestore || !user) return;
        const userRef = doc(firestore, 'users', user.uid);
        await setDoc(userRef, { onboardingComplete: true }, { merge: true });
    };

    const next = () => {
        if (step < STEPS.length - 1) {
            setStep(step + 1);
        } else {
            complete();
        }
    };

    if (!visible) return null;

    const current = STEPS[step];

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 pointer-events-none" />

            {/* Arrow pointing down to generator (step 1) */}
            {step === 1 && (
                <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex flex-col items-center gap-2 animate-bounce">
                    <div className="w-0.5 h-16 bg-primary" />
                    <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-primary" />
                </div>
            )}

            {/* Arrow pointing to navbar (steps 2 & 3) */}
            {(step === 2 || step === 3) && (
                <div className="fixed top-14 left-32 z-50 pointer-events-none flex items-center gap-2 animate-pulse">
                    <div className="w-0 h-0 border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-primary" />
                    <div className="h-0.5 w-16 bg-primary" />
                    <div className={`text-[10px] font-black uppercase tracking-widest text-primary bg-background px-2 py-1 rounded-full border border-primary`}>
                        {step === 2 ? '← Marketplace' : '← Pricing'}
                    </div>
                </div>
            )}

            {/* Tour Card */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90vw] max-w-md">
                <div className="bg-background rounded-[2.5rem] shadow-2xl border border-primary/20 overflow-hidden">
                    {/* Progress bar */}
                    <div className="h-1 bg-muted">
                        <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                        />
                    </div>

                    <div className="p-8 space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-4xl">{current.icon}</span>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                        Step {step + 1} of {STEPS.length}
                                    </p>
                                    <h3 className="text-xl font-black">{current.title}</h3>
                                </div>
                            </div>
                            <button onClick={complete} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <p className="text-muted-foreground font-medium leading-relaxed">
                            {current.description}
                        </p>

                        <div className="flex items-center justify-between pt-2">
                            <div className="flex gap-1.5">
                                {STEPS.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-primary' : 'w-1.5 bg-muted'}`}
                                    />
                                ))}
                            </div>
                            <Button onClick={next} className="rounded-2xl font-black px-6">
                                {step === STEPS.length - 1 ? "Let's Go! 🚀" : (
                                    <>Next <ArrowRight className="ml-2 h-4 w-4" /></>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}