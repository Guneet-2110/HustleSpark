
"use client";

import { PricingWizardModal } from '@/components/pricing-wizard-modal';
import { SocialCalendarModal } from '@/components/social-calendar-modal';
import { PitchDeckModal } from '@/components/pitch-deck-modal';
import { PhoneVerificationModal } from '@/components/phone-verification-modal';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEffect, useState, Suspense, useTransition, useCallback, useRef } from 'react';
import React from 'react';
import { 
    Sparkles, Bookmark, Check, Palette, FileText, Paintbrush, Loader2, 
    Image as ImageIcon, Rocket, Printer, Calendar as CalendarIcon, 
    Target, TrendingUp, CircleDollarSign, Bot, Send, ShoppingBag, 
    AlertCircle, LayoutDashboard, LineChart, CheckSquare, Settings2, Download, Eye,
    Globe, Heart, Briefcase, Lock
} from 'lucide-react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import type { HustleIdea } from '@/ai/flows/generate-hustle-ideas';
import type { GenerateHustleScheduleOutput } from '@/ai/flows/generate-hustle-schedule';
import { generateFlyerAction, generateLogoAction, generateHustleBlueprintAction, generateHustleScheduleAction, generateCoachResponseAction, generateMarketplaceCopyAction } from '@/lib/actions';import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, uploadBase64Image } from '@/firebase';
import { collection, serverTimestamp, addDoc, doc, setDoc } from 'firebase/firestore';
import { slugify } from '@/lib/utils';

type Message = {
    role: 'user' | 'model';
    content: string;
}

type HustleIdeaWithExtras = HustleIdea & { 
    schedule?: GenerateHustleScheduleOutput;
    coachHistory?: Message[];
    aboutUs?: string;
    whatWeDo?: string;
    ourGoal?: string;
};

function HustleDetailContent() {
    const { 
        user: localUser, 
        isLoggedIn, 
        isPremium, 
        setPaymentModalOpen, 
        saveHustle, 
        unsaveHustle, 
        isHustleSaved, 
        getHustleByName,
        savedHustles,
        generatedHustles
    } = useAuth();
    const { user: firebaseUser, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const params = useParams();
    const [hustle, setHustle] = useState<HustleIdeaWithExtras | null>(null);
    const { toast } = useToast();
    const initialLoadDone = useRef(false);

    // AI Generation Transitions
    const [isGeneratingLogo, startLogoGeneration] = useTransition();
    const [isGeneratingFlyer, startFlyerGeneration] = useTransition();
    const [isGeneratingBlueprint, startBlueprintGeneration] = useTransition();
    const [isGeneratingSchedule, startScheduleGeneration] = useTransition();
    const [isCoachReplying, startCoachReply] = useTransition();
    const [isListingHustle, startListingHustle] = useTransition();

    // Modals
    const [showFlyerContactModal, setShowFlyerContactModal] = useState(false);
    const [showSellModal, setShowSellModal] = useState(false);
    const [showPhoneVerification, setShowPhoneVerification] = useState(false);
const [isPhoneVerified, setIsPhoneVerified] = useState(false);
    const [showTrackerSettings, setShowTrackerSettings] = useState(false);
    const [showPricingWizard, setShowPricingWizard] = useState(false);
    const [showSocialCalendar, setShowSocialCalendar] = useState(false);
    const [showPitchDeck, setShowPitchDeck] = useState(false);
    
    // Inputs
    const [flyerEmail, setFlyerEmail] = useState('');
    const [flyerPhone, setFlyerPhone] = useState('');
    const [coachInput, setCoachInput] = useState('');
    const [targetEarnings, setTargetEarnings] = useState('1000');
    const [newEarningsEntry, setNewEarningsEntry] = useState('');
const [newWinEntry, setNewWinEntry] = useState('');
const [showEarningsInput, setShowEarningsInput] = useState(false);

    // Sell Form
    const [sellPrice, setSellPrice] = useState('100');
    const [sellCategory, setSellCategory] = useState('Creative Services');
    const [sellCountry, setSellCountry] = useState('');
    const [sellState, setSellState] = useState('');
    const [sellCity, setSellCity] = useState('');
    const [sellPaypal, setSellPaypal] = useState('');
    const [sellAboutUs, setSellAboutUs] = useState('');
    const [sellWhatWeDo, setSellWhatWeDo] = useState('');
    const [sellOurGoal, setSellOurGoal] = useState('');
    const [sellWorkFrom, setSellWorkFrom] = useState('');
    const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
    const [confirmedPaypal, setConfirmedPaypal] = useState(false);

    const [pricingResult, setPricingResult] = useState<any>(hustle?.pricingWizard || null);
    const [socialCalendarResult, setSocialCalendarResult] = useState<any>(hustle?.socialCalendar || null);
    const [pitchDeckResult, setPitchDeckResult] = useState<any>(hustle?.pitchDeck || null);
    
    const isSaved = hustle ? isHustleSaved(hustle.name) : false;
    const weeksAllowed = (() => {
        if (!isPremium) return 2;
        if (!localUser?.premiumExpiresAt) return 4;
        const daysLeft = Math.ceil((new Date(localUser.premiumExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (daysLeft >= 120) return 16;
        if (daysLeft >= 90) return 12;
        if (daysLeft >= 60) return 8;
        return 4;
    })();
    const missingAssets = hustle ? (!hustle.logoUrl || !hustle.flyerUrl) : true;
    
    useEffect(() => {
        if (!isUserLoading && !firebaseUser) {
            router.push('/login');
        }
    }, [firebaseUser, isUserLoading, router]);

    // Initialize Data - Slug matching for reliable loading
    useEffect(() => {
        if (!isUserLoading && firebaseUser && !initialLoadDone.current) {
            const paramsSlug = params?.slug as string;
            if (!paramsSlug) return;

            const findHustleInSources = () => {
                // Check saved first
                let found = savedHustles.find(h => slugify(h.name) === paramsSlug);
                // Then generated
                if (!found) {
                    found = generatedHustles.find(h => slugify(h.name) === paramsSlug);
                }
                // Then session fallback
                if (!found) {
                    const hustleDataStr = sessionStorage.getItem('currentHustle');
                    if (hustleDataStr) {
                        try {
                            const parsed = JSON.parse(hustleDataStr);
                            if (slugify(parsed.name) === paramsSlug) found = parsed;
                        } catch (e) {}
                    }
                }
                return found;
            };

            const found = findHustleInSources();
            if (found) {
                setHustle({ ...found });
                if (found.trackerData?.earningsGoal) {
                    setTargetEarnings(found.trackerData.earningsGoal.toString());
                }
                initialLoadDone.current = true;
            }
        }
    }, [firebaseUser, isUserLoading, params?.slug, savedHustles, generatedHustles]);

    // Auto-fill form fields when sell modal opens
    useEffect(() => {
        if (showSellModal && hustle) {
            if (!sellPaypal && firebaseUser?.email) setSellPaypal(firebaseUser.email);
            
            if (!sellAboutUs && !sellWhatWeDo && !sellOurGoal) {
                setIsGeneratingCopy(true);
                generateMarketplaceCopyAction({
                    hustleName: hustle.name,
                    hustleDescription: hustle.description,
                    pricingTip: hustle.pricingTip,
                    marketingIdea: hustle.marketingIdea,
                }).then((result) => {
                    if (result.message === 'success' && result.data) {
                        setSellAboutUs(result.data.aboutUs);
                        setSellWhatWeDo(result.data.whatWeDo);
                        setSellOurGoal(result.data.ourGoal);
                    }
                }).finally(() => setIsGeneratingCopy(false));
            }
        }
    }, [showSellModal, hustle, firebaseUser, sellAboutUs, sellWhatWeDo, sellOurGoal, sellPaypal]);

    useEffect(() => {
        if (firebaseUser?.email) {
            setFlyerEmail(firebaseUser.email);
        }
    }, [firebaseUser]);

    // Tracker Logic
    const toggleTask = (weekKey: string, taskIndex: number) => {
        if (!hustle) return;
        const taskId = `${weekKey}-${taskIndex}`;
        const currentChecked = hustle.trackerData?.checkedTasks || [];
        const isChecked = currentChecked.includes(taskId);
        
        const newChecked = isChecked 
            ? currentChecked.filter(id => id !== taskId)
            : [...currentChecked, taskId];

            const totalTasks = weeksAllowed * 7;
        const progressPercent = Math.round((newChecked.length / totalTasks) * 100);

        const updatedHustle = {
            ...hustle,
            trackerData: {
                ...hustle.trackerData!,
                checkedTasks: newChecked,
                progress: progressPercent
            }
        };

        setHustle(updatedHustle);
        if (isSaved) saveHustle(updatedHustle);
    };

    const updateEarningsGoal = () => {
        if (!hustle) return;
        const updatedHustle = {
            ...hustle,
            trackerData: {
                ...hustle.trackerData!,
                earningsGoal: parseFloat(targetEarnings) || 0
            }
        };
        setHustle(updatedHustle);
        if (isSaved) saveHustle(updatedHustle);
        setShowTrackerSettings(false);
        toast({ title: "Goal Updated", description: `Earnings target set to $${targetEarnings}` });
    };

    const addEarningsEntry = () => {
        if (!hustle || !newEarningsEntry) return;
        const amount = parseFloat(newEarningsEntry);
        if (isNaN(amount)) return;
        const existing = hustle.trackerData?.earningsLog || [];
        const newEntry = { amount, date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) };
        const newLog = [...existing, newEntry];
        const totalEarned = newLog.reduce((sum, e) => sum + e.amount, 0);
        const updatedHustle = {
            ...hustle,
            trackerData: { ...hustle.trackerData!, earningsLog: newLog, totalEarned }
        };
        setHustle(updatedHustle);
        saveHustle(updatedHustle);
        setNewEarningsEntry('');
        setShowEarningsInput(false);
        toast({ title: `+$${amount} logged!`, description: `Total: $${totalEarned}` });
    };
    
    const addWinEntry = () => {
        if (!hustle || !newWinEntry.trim()) return;
        const existing = hustle.trackerData?.winLog || [];
        const newWin = { text: newWinEntry, date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) };
        const updatedHustle = {
            ...hustle,
            trackerData: { ...hustle.trackerData!, winLog: [...existing, newWin] }
        };
        setHustle(updatedHustle);
        saveHustle(updatedHustle);
        setNewWinEntry('');
        toast({ title: "Win logged! 🏆" });
    };

    const handlePrintFlyer = () => {
        if (!hustle?.flyerUrl) return;
        const win = window.open('', '_blank');
        if (win) {
            win.document.write(`
                <html>
                    <body style="margin:0; display:flex; justify-content:center; align-items:center; background:#f4f4f5;">
                        <img src="${hustle.flyerUrl}" style="max-width:100%; height:auto; box-shadow:0 20px 25px -5px rgba(0,0,0,0.1);" />
                        <script>window.onload = () => { window.print(); }</script>
                    </body>
                </html>
            `);
            win.document.close();
        }
    };


    const handleSaveToggle = () => {
        if (!hustle) return;
        if (isSaved) {
            unsaveHustle(hustle.name);
            toast({ title: "Removed", description: "Hustle removed from your dashboard." });
        } else {
            const hustleWithStartDate = {
                ...hustle,
                trackerData: {
                    ...hustle.trackerData,
                    startedAt: hustle.trackerData?.startedAt || new Date().toISOString(),
                    checkedTasks: hustle.trackerData?.checkedTasks || [],
                    progress: hustle.trackerData?.progress || 0,
                    earningsGoal: hustle.trackerData?.earningsGoal || 1000,
                    earningsLog: hustle.trackerData?.earningsLog || [],
                    totalEarned: hustle.trackerData?.totalEarned || 0,
                    winLog: hustle.trackerData?.winLog || [],
                }
            };
            saveHustle(hustleWithStartDate);
            setHustle(hustleWithStartDate);
            toast({ title: "Hustle Saved", description: "This idea is now in your dashboard." });
        }
    }

    const handleCoachSubmit = () => {
        if (!coachInput.trim() || !hustle) return;
        const newUserMessage: Message = { role: 'user', content: coachInput };
        const historySoFar = [...(hustle.coachHistory || []), newUserMessage];
        
        setHustle(prev => prev ? { ...prev, coachHistory: historySoFar } : null);
        const currentInput = coachInput;
        setCoachInput('');

        startCoachReply(async () => {
            const result = await generateCoachResponseAction({
                hustle: { name: hustle.name, description: hustle.description },
                userInput: currentInput,
                history: historySoFar,
            });
            if (result.message === 'success' && result.data) {
                const finalHistory = [...historySoFar, { role: 'model', content: result.data.coachResponse } as Message];
                const updatedHustle = { ...hustle, coachHistory: finalHistory };
                setHustle(updatedHustle);
                if (isSaved) saveHustle(updatedHustle);
            } else {
                toast({ variant: 'destructive', title: 'Coach Offline', description: 'Sparky is busy right now.' });
            }
        });
    }

    const handleGenerateBlueprint = () => {
        if (!hustle) return;
        startBlueprintGeneration(async () => {
            const result = await generateHustleBlueprintAction({ hustleName: hustle.name, hustleDescription: hustle.description });
            if (result.message === 'success' && result.data) {
                const updatedHustle = { ...hustle, ...result.data };
                setHustle(updatedHustle);
                if (isSaved) saveHustle(updatedHustle);
                toast({ title: "Blueprint Generated" });
            }
        });
    }

    const handleGenerateSchedule = () => {
        if (!hustle) return;
        startScheduleGeneration(async () => {
            const result = await generateHustleScheduleAction({ hustleName: hustle.name, hustleDescription: hustle.description, weeksToGenerate: weeksAllowed });
            if (result.message === 'success' && result.data) {
                const updatedHustle = { ...hustle, schedule: result.data };
                setHustle(updatedHustle);
                if (isSaved) saveHustle(updatedHustle);
                toast({ title: "Schedule Ready" });
            }
        });
    }

    const handleGenerateLogo = () => {
        if (!hustle || !firebaseUser) return;
        startLogoGeneration(async () => {
            const result = await generateLogoAction({ hustleName: hustle.name, hustleDescription: hustle.description });
            if (result.message === 'success' && result.data) {
                let logoUrl = result.data.logoUrl;
                if (logoUrl.startsWith('data:')) {
                    try {
                        logoUrl = await uploadBase64Image(
                            logoUrl,
                            `hustles/${firebaseUser.uid}/logo_${Date.now()}.png`
                        );
                    } catch (e) {
                        console.error('Logo upload failed:', e);
                    }
                }
                const updatedHustle = { ...hustle, logoUrl };
                setHustle(updatedHustle);
                saveHustle(updatedHustle);
                toast({ title: "Logo Ready" });
            }
        });
    }

    const handleGenerateFlyer = () => {
        if (!hustle || !firebaseUser) return;
        startFlyerGeneration(async () => {
             const result = await generateFlyerAction({ 
                 hustleName: hustle.name, 
                 flyerText: hustle.flyerText || hustle.description,
                 email: flyerEmail,
                 phone: flyerPhone
             });
             if (result.message === 'success' && result.data) {
                 let flyerUrl = result.data.flyerUrl;
                 if (flyerUrl.startsWith('data:')) {
                     try {
                         flyerUrl = await uploadBase64Image(
                             flyerUrl,
                             `hustles/${firebaseUser.uid}/flyer_${Date.now()}.png`
                         );
                     } catch (e) {
                         console.error('Flyer upload failed:', e);
                     }
                 }
                 const updatedHustle = { ...hustle, flyerUrl };
                 setHustle(updatedHustle);
                 saveHustle(updatedHustle);
                 setShowFlyerContactModal(false);
                 toast({ title: "Flyer Ready" });
             }
        });
    }

    const handleSellHustle = () => {
        if (!hustle || !firebaseUser || !firestore) {
            toast({ variant: 'destructive', title: 'Action Denied', description: 'You must be logged in to publish a venture.' });
            return;
        }
        
        if (!sellPaypal || !sellPaypal.includes('@')) {
            toast({ variant: 'destructive', title: 'Payout Email Required', description: 'Please enter a valid PayPal email address to receive your 90% payout.' });
            return;
        }
        if (!confirmedPaypal) {
            toast({ variant: 'destructive', title: 'PayPal Confirmation Required', description: 'Please confirm you have an active PayPal account with this email.' });
            return;
        }

        if (!sellCity || !sellState || !sellCountry) {
            toast({ variant: 'destructive', title: 'Location Required', description: 'Please fill in Country, State and City.' });
            return;
        }
        if (!sellAboutUs || !sellWhatWeDo || !sellOurGoal) {
            toast({ variant: 'destructive', title: 'Description Required', description: 'Please fill in About Us, What We Do and Our Goal.' });
            return;
        }
        if (!sellWorkFrom) {
            toast({ variant: 'destructive', title: 'Service Type Required', description: 'Please select how you deliver your service.' });
            return;
        }
        if (!sellPrice || parseFloat(sellPrice) <= 0) {
            toast({ variant: 'destructive', title: 'Price Required', description: 'Please set a price for your service.' });
            return;
        }

        startListingHustle(async () => {
            try {
                let flyerUrl = hustle.flyerUrl || '';
                let logoUrl = hustle.logoUrl || '';

                if (flyerUrl.startsWith('data:')) {
                    flyerUrl = await uploadBase64Image(
                        flyerUrl,
                        `listings/${firebaseUser.uid}/flyer_${Date.now()}.png`
                    );
                }

                if (logoUrl.startsWith('data:')) {
                    logoUrl = await uploadBase64Image(
                        logoUrl,
                        `listings/${firebaseUser.uid}/logo_${Date.now()}.png`
                    );
                }

                const listingData = {
                    hustleName: hustle.name,
                    description: hustle.description,
                    pitch: sellAboutUs,
                    experience: sellWhatWeDo,
                    whoIHelp: sellOurGoal,
                    workFrom: sellWorkFrom,
                    price: parseFloat(sellPrice),
                    category: sellCategory,
                    country: sellCountry,
                    state: sellState,
                    city: sellCity,
                    location: `${sellCity}, ${sellState}, ${sellCountry}`,
                    paypalEmail: sellPaypal,
                    flyerUrl: flyerUrl,
                    logoUrl: logoUrl,
                    userId: firebaseUser.uid,
                    status: 'pending_approval',
                    createdAt: serverTimestamp(),
                };

                const listingsRef = collection(firestore, 'marketplace_listings');
                await addDoc(listingsRef, listingData);
                
                setShowSellModal(false);
                toast({ 
                    title: "Submission Received!", 
                    description: "Your venture is now in the approval queue." 
                });

            } catch (error: any) {
                console.error("Firestore write failed:", error);
                toast({
                    variant: 'destructive',
                    title: 'Publish Failed',
                    description: error.message || 'Something went wrong.',
                });
            }
        });
    }

    if (isUserLoading || !firebaseUser || !hustle) {
        return (
            <div className="container py-32 text-center space-y-4">
                <Loader2 className="animate-spin h-10 w-10 mx-auto text-primary" />
                <p className="font-black text-muted-foreground uppercase tracking-widest text-xs">Opening Command Center...</p>
            </div>
        );
    }

  return (
    <TooltipProvider delayDuration={0}>
        <div className="container py-6 md:py-12">
            <div className="max-w-[1400px] mx-auto space-y-8">
                {/* Header Command Center */}
                <div className="flex flex-col lg:flex-row justify-between items-start gap-6 bg-card p-6 rounded-3xl border shadow-sm">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                <Rocket className="h-6 w-6 text-primary" />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight">{hustle.name}</h1>
                        </div>
                        <p className="text-muted-foreground text-lg max-w-2xl">{hustle.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                        <Button variant={isSaved ? "secondary" : "default"} onClick={handleSaveToggle} className="h-12 px-6 rounded-2xl font-bold transition-all hover:scale-105">
                            {isSaved ? <Check className="mr-2 h-5 w-5"/> : <Bookmark className="mr-2 h-5 w-5" />}
                            {isSaved ? 'Hustle Saved' : 'Save Venture'}
                        </Button>
                        <Button 
    variant="outline" 
    className="h-12 px-6 rounded-2xl font-bold border-2"
    onClick={async () => {
        if (!isPremium) {
            toast({ variant: 'destructive', title: "Premium Required", description: "Upgrade to Premium to list your venture on the marketplace." });
            setPaymentModalOpen(true);
            return;
        }

        if (missingAssets) {
            toast({ variant: 'destructive', title: "Assets Missing", description: "Generate Logo and Flyer first." });
            return;
        }
        
        if (!isPhoneVerified && firestore && firebaseUser) {
            const { doc, getDoc } = await import('firebase/firestore');
            const userRef = doc(firestore, 'users', firebaseUser.uid);
            const snap = await getDoc(userRef);
            const data = snap.data();
            if (data?.phoneVerified || isPremium) {
                setIsPhoneVerified(true);
                if (!hustle.aboutUs) handleGenerateBlueprint();
                setShowSellModal(true);
            } else {
                setShowPhoneVerification(true);
            }
            return;
        }
    
        if (!hustle.aboutUs) handleGenerateBlueprint();
        setShowSellModal(true);
    }} 
>
    <ShoppingBag className="mr-2 h-5 w-5" />
    Exit to Marketplace
</Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* LEFT COLUMN: LIVE TRACKER & STRATEGY */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* LIVE HUSTLE TRACKER */}
                        <Card className="rounded-[2.5rem] border-primary/20 bg-primary/5 shadow-2xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-6 opacity-10">
                                <TrendingUp className="h-32 w-32" />
                            </div>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div className="space-y-1">
                                    <CardTitle className="text-2xl flex items-center gap-2">
                                        <LayoutDashboard className="h-6 w-6 text-primary" /> 
                                        Live Hustle Tracker
                                    </CardTitle>
                                    <CardDescription>Track your path from Zero to Revenue</CardDescription>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setShowTrackerSettings(true)}>
                                    <Settings2 className="h-5 w-5" />
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-8">
    {/* STAT BOXES */}
    <div className="grid sm:grid-cols-4 gap-4">
        {/* Launch Progress */}
        <div className="bg-background/60 backdrop-blur-md p-5 rounded-3xl border shadow-sm space-y-2">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Launch Progress</p>
            <div className="flex items-end gap-2">
                <span className="text-3xl font-black">{hustle.trackerData?.progress || 0}%</span>
                <span className="text-xs text-muted-foreground pb-1">Ready</span>
            </div>
            <Progress value={hustle.trackerData?.progress || 0} className="h-2" />
        </div>

        {/* Days Active */}
        <div className="bg-background/60 backdrop-blur-md p-5 rounded-3xl border shadow-sm space-y-2">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Days Active</p>
            <div className="flex items-end gap-2">
                <span className="text-3xl font-black">
                    {hustle.trackerData?.startedAt 
                        ? Math.floor((Date.now() - new Date(hustle.trackerData.startedAt).getTime()) / (1000 * 60 * 60 * 24))
                        : 0}
                </span>
                <span className="text-xs text-muted-foreground pb-1">Days</span>
            </div>
            <Progress value={Math.min(((hustle.trackerData?.startedAt ? Math.floor((Date.now() - new Date(hustle.trackerData.startedAt).getTime()) / (1000 * 60 * 60 * 24)) : 0) / 28) * 100, 100)} className="h-2" />
        </div>

        {/* Recommended Goals */}
        <div className="bg-background/60 backdrop-blur-md p-5 rounded-3xl border shadow-sm space-y-2">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Recommended Goals</p>
            <div className="flex flex-col gap-1 mt-1">
                {[
                    { label: '🥉 Starter', amount: 500 },
                    { label: '🥈 Growth', amount: 2000 },
                    { label: '🥇 Scale', amount: 10000 },
                ].map((tier) => (
                    <button
                        key={tier.amount}
                        onClick={() => {
                            const updatedHustle = {
                                ...hustle,
                                trackerData: { ...hustle.trackerData!, earningsGoal: tier.amount }
                            };
                            setHustle(updatedHustle);
                            saveHustle(updatedHustle);
                            setTargetEarnings(tier.amount.toString());
                            toast({ title: `Goal set to $${tier.amount}` });
                        }}
                        className={`text-[10px] font-black text-left px-2 py-1 rounded-lg transition-all ${hustle.trackerData?.earningsGoal === tier.amount ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10 text-muted-foreground'}`}
                    >
                        {tier.label}: ${tier.amount.toLocaleString()}
                    </button>
                ))}
            </div>
        </div>

        {/* Earnings to Date */}
        <div className="bg-primary text-primary-foreground p-5 rounded-3xl shadow-xl space-y-2 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-20">
                <CircleDollarSign className="h-20 w-20" />
            </div>
            <p className="text-xs font-black uppercase tracking-widest opacity-80">Earnings to Date</p>
            <div className="flex items-end gap-2">
                <span className="text-3xl font-black">${(hustle.trackerData?.totalEarned || 0).toLocaleString()}</span>
                <span className="text-xs opacity-80 pb-1">USD</span>
            </div>
            <Progress 
                value={hustle.trackerData?.earningsGoal ? Math.min(((hustle.trackerData?.totalEarned || 0) / hustle.trackerData.earningsGoal) * 100, 100) : 0} 
                className="h-2 bg-white/20" 
            />
            <button onClick={() => setShowEarningsInput(!showEarningsInput)} className="text-[10px] font-black uppercase tracking-widest opacity-80 hover:opacity-100 transition-opacity">
                + Log Earnings
            </button>
        </div>
    </div>

    {/* EARNINGS INPUT */}
    {showEarningsInput && (
        <div className="bg-background/60 p-4 rounded-2xl border flex gap-3 items-center animate-in fade-in slide-in-from-top-2">
            <CircleDollarSign className="h-5 w-5 text-primary shrink-0" />
            <Input
                type="number"
                placeholder="Amount earned (e.g. 150)"
                className="h-10 rounded-xl"
                value={newEarningsEntry}
                onChange={(e) => setNewEarningsEntry(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addEarningsEntry()}
            />
            <Button size="sm" className="rounded-xl font-black shrink-0" onClick={addEarningsEntry}>Log It</Button>
        </div>
    )}

    {/* EARNINGS CHART */}
    {hustle.trackerData?.earningsLog && hustle.trackerData.earningsLog.length > 0 && (
        <div className="bg-background/60 p-6 rounded-3xl border space-y-4">
            <h4 className="font-black text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <LineChart className="h-4 w-4 text-primary" /> Earnings History
            </h4>
            <div className="flex items-end gap-2 h-24">
                {hustle.trackerData.earningsLog.map((entry: any, i: number) => {
                    const max = Math.max(...hustle.trackerData!.earningsLog.map((e: any) => e.amount));
                    const height = max > 0 ? (entry.amount / max) * 100 : 0;
                    return (
                        <div key={i} className="flex flex-col items-center gap-1 flex-1">
                            <span className="text-[8px] font-bold text-primary">${entry.amount}</span>
                            <div 
                                className="w-full bg-primary rounded-t-lg transition-all duration-500" 
                                style={{ height: `${height}%`, minHeight: '4px' }}
                            />
                            <span className="text-[8px] text-muted-foreground">{entry.date}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    )}

    {/* WIN LOG */}
    <div className="bg-background/60 p-6 rounded-3xl border space-y-4">
        <h4 className="font-black text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            🏆 Win Log
        </h4>
        <div className="flex gap-3">
            <Input
                placeholder="Log a win... (e.g. Got my first client!)"
                className="h-10 rounded-xl"
                value={newWinEntry}
                onChange={(e) => setNewWinEntry(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addWinEntry()}
            />
            <Button size="sm" className="rounded-xl font-black shrink-0" onClick={addWinEntry}>Add</Button>
        </div>
        {hustle.trackerData?.winLog && hustle.trackerData.winLog.length > 0 ? (
            <div className="space-y-2 max-h-40 overflow-y-auto">
                {[...hustle.trackerData.winLog].reverse().map((win: any, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-primary/5 rounded-2xl">
                        <span className="text-lg">🏆</span>
                        <div>
                            <p className="text-sm font-medium">{win.text}</p>
                            <p className="text-[10px] text-muted-foreground">{win.date}</p>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <p className="text-xs text-muted-foreground italic">No wins logged yet. You got this!</p>
        )}
    </div>

    {/* LAUNCH ROADMAP */}
    <div className="space-y-4">
        <h3 className="font-bold flex items-center gap-2 px-2"><CheckSquare className="h-5 w-5 text-primary" /> Launch Roadmap</h3>
        {!hustle.schedule ? (
            <div className="text-center py-12 bg-background/40 rounded-[2rem] border-2 border-dashed border-primary/20">
                <Button onClick={handleGenerateSchedule} disabled={isGeneratingSchedule} className="rounded-2xl h-12 px-8 font-bold">
                    {isGeneratingSchedule ? <Loader2 className="animate-spin mr-2" /> : <CalendarIcon className="mr-2 h-5 w-5" />}
                    Generate {isPremium ? `${Math.min(Math.ceil((new Date(localUser?.premiumExpiresAt || '').getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 7)), 16)}` : '2'}-Week Action Plan
                </Button>
            </div>
        ) : (
            <Accordion type="single" collapsible className="w-full space-y-3">
                {(() => {
                    let totalWeeks = 2; // free
                    if (isPremium && localUser?.premiumExpiresAt) {
                        const daysLeft = Math.ceil((new Date(localUser.premiumExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                        if (daysLeft >= 120) totalWeeks = 16;
                        else if (daysLeft >= 90) totalWeeks = 12;
                        else if (daysLeft >= 60) totalWeeks = 8;
                        else totalWeeks = 4;
                    }
                    const weeksToShow = Math.min(totalWeeks, Object.keys(hustle.schedule || {}).length);
                    return Array.from({ length: weeksToShow }, (_, i) => i + 1);
                })().map((num) => {
                    const key = `week${num}` as keyof GenerateHustleScheduleOutput;
                    const weekTasks = hustle.schedule![key];
                    const weekChecked = (hustle.trackerData?.checkedTasks || []).filter(id => id.startsWith(key));
                    const weekProgress = Math.round((weekChecked.length / 7) * 100);
                    return (
                        <AccordionItem key={key} value={key} className="bg-background rounded-3xl border shadow-sm overflow-hidden px-1">
                            <AccordionTrigger className="hover:no-underline px-6">
                                <div className="flex items-center gap-4 w-full">
                                    <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center font-black">W{num}</div>
                                    <div className="flex-1 text-left">
                                    <p className="font-bold text-lg">
                                            {num === 1 && "Setup & Foundations"}
                                            {num === 2 && "Product Development"}
                                            {num === 3 && "Marketing Blitz"}
                                            {num === 4 && "Launch & Scale"}
                                            {num === 5 && "Growth & Optimization"}
                                            {num === 6 && "Revenue Acceleration"}
                                            {num === 7 && "Community Building"}
                                            {num === 8 && "Systems & Automation"}
                                            {num === 9 && "Brand Expansion"}
                                            {num === 10 && "Partnerships"}
                                            {num === 11 && "Customer Retention"}
                                            {num === 12 && "Analytics & Review"}
                                            {num === 13 && "New Revenue Streams"}
                                            {num === 14 && "Advanced Marketing"}
                                            {num === 15 && "Team & Delegation"}
                                            {num === 16 && "Long-Term Vision"}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Progress value={weekProgress} className="h-1.5 w-24" />
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground">{weekProgress}% Complete</span>
                                        </div>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pb-6 pt-2">
                                <div className="grid gap-2">
                                    {weekTasks.map((task, i) => (
                                        <div key={i} className={`flex items-start gap-3 p-4 rounded-2xl transition-all ${hustle.trackerData?.checkedTasks?.includes(`${key}-${i}`) ? 'bg-primary/5 opacity-60' : 'bg-muted/30 hover:bg-muted/50'}`}>
                                            <Checkbox 
                                                id={`${key}-${i}`} 
                                                checked={hustle.trackerData?.checkedTasks?.includes(`${key}-${i}`)}
                                                onCheckedChange={() => toggleTask(key, i)}
                                                className="mt-0.5"
                                            />
                                            <label htmlFor={`${key}-${i}`} className="text-sm font-medium leading-tight cursor-pointer select-none">
                                                {task}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
            </Accordion>
        )}
    </div>
</CardContent>
                        </Card>

                        {/* GROWTH STRATEGY */}
                        <div className="grid sm:grid-cols-2 gap-8">
                            <Card className="rounded-[2.5rem] shadow-lg border-primary/10 overflow-hidden">
                                <CardHeader className="bg-primary/5 border-b flex flex-row items-center justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="flex items-center gap-2"><CircleDollarSign className="h-5 w-5" /> Elite Pricing</CardTitle>
                                    </div>
                                    {isPremium && (
                                        <Button variant="ghost" size="sm" onClick={handleGenerateBlueprint} disabled={isGeneratingBlueprint}>
                                            <Sparkles className={`h-4 w-4 ${isGeneratingBlueprint ? 'animate-spin' : ''}`} />
                                        </Button>
                                    )}
                                </CardHeader>
                                <CardContent className="pt-6 min-h-[150px] flex items-center">
                                    {hustle.pricingTip ? (
                                        <p className="text-muted-foreground leading-relaxed italic">"{hustle.pricingTip}"</p>
                                    ) : (
                                        <div className="w-full text-center">
                                            {isPremium ? (
                                                <Button variant="secondary" className="rounded-2xl" onClick={handleGenerateBlueprint} disabled={isGeneratingBlueprint}>Generate Pricing Strategy</Button>
                                            ) : (
                                                <Button variant="secondary" className="rounded-2xl text-xs" onClick={() => setPaymentModalOpen(true)}><Lock className="mr-2 h-4 w-4" />Unlock with Premium</Button>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="rounded-[2.5rem] shadow-lg border-accent/10 overflow-hidden">
                                <CardHeader className="bg-accent/5 border-b flex flex-row items-center justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="flex items-center gap-2 text-accent"><Target className="h-5 w-5" /> High-Impact Marketing</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6 min-h-[150px] flex items-center">
                                    {hustle.marketingIdea ? (
                                        <p className="text-muted-foreground leading-relaxed italic">"{hustle.marketingIdea}"</p>
                                    ) : (
                                        <div className="w-full text-center">
                                            {isPremium ? (
                                                <Button variant="secondary" className="rounded-2xl" onClick={handleGenerateBlueprint} disabled={isGeneratingBlueprint}>Generate Marketing Blitz</Button>
                                            ) : (
                                                <Button variant="secondary" className="rounded-2xl text-xs" onClick={() => setPaymentModalOpen(true)}><Lock className="mr-2 h-4 w-4" />Unlock with Premium</Button>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                            </div>

{/* PREMIUM TOOLS */}
<div className="grid sm:grid-cols-3 gap-4">
    {[
        { title: '💰 Pricing Wizard', description: 'Get AI-recommended pricing tiers for your hustle', onClick: () => setShowPricingWizard(true) },
        { title: '📅 Social Calendar', description: '30 days of social media content tailored to your hustle', onClick: () => setShowSocialCalendar(true) },
        { title: '🎯 Pitch Deck', description: 'Generate a 5-slide investor-ready pitch', onClick: () => setShowPitchDeck(true) },
    ].map((tool) => (
        <Card key={tool.title} className="rounded-[2rem] shadow-lg border-primary/10 overflow-hidden">
            <CardContent className="p-6 space-y-3">
                <p className="font-black text-sm">{tool.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{tool.description}</p>
                {isPremium ? (
                    <Button className="w-full rounded-xl h-10 font-bold text-xs" onClick={tool.onClick}>
                        Launch Tool
                    </Button>
                ) : (
                    <Button variant="secondary" className="w-full rounded-xl h-10 font-bold text-xs" onClick={() => setPaymentModalOpen(true)}>
                        <Lock className="mr-1 h-3 w-3" /> Premium Only
                    </Button>
                )}
            </CardContent>
        </Card>
    ))}
</div>
</div>

{/* RIGHT COLUMN: BRANDING & COACH */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* BRANDING KIT */}
                        <Card className="rounded-[2.5rem] shadow-xl border-primary/20 overflow-hidden">
                            <CardHeader className="bg-muted/50 border-b">
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center gap-2"><Palette className="h-5 w-5 text-primary" /> Branding Kit</div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="aspect-square bg-muted rounded-[2rem] flex items-center justify-center relative overflow-hidden border-4 border-white shadow-inner group">
                                        {hustle.logoUrl ? (
                                            <Image src={hustle.logoUrl} alt="Logo" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <ImageIcon className="h-16 w-16 text-muted-foreground/30" />
                                        )}
                                        {isGeneratingLogo && <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>}
                                    </div>
                                    <Button variant="outline" className="w-full h-12 rounded-2xl border-2 font-bold" onClick={handleGenerateLogo} disabled={isGeneratingLogo}>
                                        {hustle.logoUrl ? 'Redesign Logo' : 'Generate Identity'}
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    <div className="aspect-[3/4] bg-muted rounded-[2rem] flex items-center justify-center relative overflow-hidden border-4 border-white shadow-inner group">
                                        {hustle.flyerUrl ? (
                                            <Image src={hustle.flyerUrl} alt="Flyer" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <Printer className="h-16 w-16 text-muted-foreground/30" />
                                        )}
                                        {isGeneratingFlyer && <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>}
                                        {hustle.flyerUrl && !isGeneratingFlyer && (
                                            <div className="absolute bottom-4 right-4">
                                                <Button size="icon" className="rounded-full shadow-2xl h-12 w-12" onClick={handlePrintFlyer}>
                                                    <Printer className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" className="flex-1 h-12 rounded-2xl border-2 font-bold" onClick={() => setShowFlyerContactModal(true)} disabled={isGeneratingFlyer}>
                                            {hustle.flyerUrl ? 'Update Info' : 'Design Flyer'}
                                        </Button>
                                        {hustle.flyerUrl && (
                                            <Button variant="secondary" size="icon" className="h-12 w-12 rounded-2xl" onClick={handlePrintFlyer}>
                                                <Download className="h-5 w-5" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* SPARKY: AI COACH */}
                        <Card className="rounded-[2.5rem] shadow-xl border-primary/20 overflow-hidden flex flex-col h-[600px]">
                            <CardHeader className="bg-primary text-primary-foreground p-6">
                                <CardTitle className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                                        <Bot className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="font-black text-lg">Sparky</p>
                                        <p className="text-[10px] uppercase font-bold opacity-80">Active AI Coach</p>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 p-0 overflow-hidden relative">
                                <ScrollArea className="h-full p-6">
                                    <div className="space-y-4 pb-4">
                                        <div className="bg-muted p-4 rounded-3xl text-sm leading-relaxed">
                                            Hi! I'm Sparky. I'm here to help you launch <strong>{hustle.name}</strong>. What's on your mind?
                                        </div>
                                        {hustle.coachHistory?.map((msg, i) => (
                                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`p-4 rounded-3xl text-sm max-w-[85%] leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground font-medium' : 'bg-muted border'}`}>
                                                    {msg.content}
                                                </div>
                                            </div>
                                        ))}
                                        {isCoachReplying && <div className="flex gap-2 items-center text-xs text-muted-foreground animate-pulse font-bold uppercase tracking-wider"><Loader2 className="h-3 w-3 animate-spin" /> Sparky is strategizing...</div>}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                            <CardFooter className="p-6 bg-muted/30 border-t">
                                {!isPremium ? (
                                    <Button variant="secondary" className="w-full rounded-2xl font-bold" onClick={() => setPaymentModalOpen(true)}>
                                        <Lock className="mr-2 h-4 w-4" />
                                        Unlock Sparky with Premium
                                    </Button>
                                ) : (
                                    <div className="flex gap-2 w-full">
                                        <Input 
                                            placeholder="Ask for advice..." 
                                            className="h-12 rounded-2xl bg-background shadow-inner border-2 focus:ring-primary"
                                            value={coachInput} 
                                            onChange={(e) => setCoachInput(e.target.value)} 
                                            onKeyDown={(e) => e.key === 'Enter' && handleCoachSubmit()} 
                                        />
                                        <Button onClick={handleCoachSubmit} disabled={isCoachReplying || !coachInput.trim()} size="icon" className="h-12 w-12 rounded-2xl shadow-lg transition-all hover:scale-105">
                                            <Send className="h-5 w-5" />
                                        </Button>
                                    </div>
                                )}
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>

            {/* TRACKER SETTINGS MODAL */}
            <Dialog open={showTrackerSettings} onOpenChange={setShowTrackerSettings}>
                <DialogContent className="rounded-[2rem]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">Tracker Configuration</DialogTitle>
                        <DialogDescription>Define your success metrics for this hustle.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <Label className="font-bold">Earnings Goal (USD)</Label>
                            <div className="relative">
                                <CircleDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input 
                                    type="number" 
                                    className="pl-10 h-12 rounded-xl font-bold" 
                                    value={targetEarnings} 
                                    onChange={(e) => setTargetEarnings(e.target.value)} 
                                />
                            </div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">A challenging but achievable target keeps you focused.</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button className="w-full h-12 rounded-2xl font-bold text-lg" onClick={updateEarningsGoal}>Save Milestones</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showFlyerContactModal} onOpenChange={setShowFlyerContactModal}>
                <DialogContent className="rounded-[2rem]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">Flyer Contact Details</DialogTitle>
                        <DialogDescription>Add your professional contact info to the generated flyer.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="font-bold">Business Email</Label>
                            <Input className="h-12 rounded-xl" value={flyerEmail} onChange={(e) => setFlyerEmail(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bold">Phone (Optional)</Label>
                            <Input className="h-12 rounded-xl" value={flyerPhone} onChange={(e) => setFlyerPhone(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button className="w-full h-12 rounded-2xl font-bold text-lg" onClick={handleGenerateFlyer} disabled={isGeneratingFlyer}>
                            {isGeneratingFlyer ? 'Designing...' : 'Generate High-Impact Flyer'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showSellModal} onOpenChange={(open) => { setShowSellModal(open); if (!open) setConfirmedPaypal(false); }}>
                <DialogContent className="sm:max-w-2xl rounded-[2.5rem]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">Marketplace Launchpad</DialogTitle>
                        <DialogDescription>AI has pre-filled your strategy. Review and submit for admin approval.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto px-1">
                        {isGeneratingCopy && (
                            <div className="flex items-center justify-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/20">
                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                <p className="text-sm font-bold text-primary">AI is writing your listing description...</p>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="font-bold">Sale Price ($) *</Label>
                                <Input type="number" className="h-12 rounded-xl font-bold" placeholder="e.g. 50" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold">How do you deliver? *</Label>
                                <Select value={sellWorkFrom} onValueChange={setSellWorkFrom}>
                                    <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Online">Online (via chat/email)</SelectItem>
                                        <SelectItem value="In-Person">In-Person (local only)</SelectItem>
                                        <SelectItem value="Both">Both Online & In-Person</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                             <div className="space-y-2"><Label className="font-bold">Country *</Label><Input className="h-12 rounded-xl" placeholder="e.g. United States" value={sellCountry} onChange={(e) => setSellCountry(e.target.value)} /></div>
                             <div className="space-y-2"><Label className="font-bold">State *</Label><Input className="h-12 rounded-xl" placeholder="e.g. TX" value={sellState} onChange={(e) => setSellState(e.target.value)} /></div>
                             <div className="space-y-2"><Label className="font-bold text-primary">City *</Label><Input className="h-12 rounded-xl border-primary/50" placeholder="e.g., Austin" value={sellCity} onChange={(e) => setSellCity(e.target.value)} /></div>
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bold flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /> About us *</Label>
                            <div className="relative">
                                <Textarea className="rounded-xl min-h-[100px]" placeholder="Tell the world who you are..." value={sellAboutUs} onChange={(e) => setSellAboutUs(e.target.value)} disabled={isGeneratingCopy} />
                                {isGeneratingCopy && <div className="absolute inset-0 bg-background/50 rounded-xl flex items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bold flex items-center gap-2"><Briefcase className="h-4 w-4 text-primary" /> What we do *</Label>
                            <div className="relative">
                                <Textarea className="rounded-xl min-h-[100px]" placeholder="Explain your services and expertise..." value={sellWhatWeDo} onChange={(e) => setSellWhatWeDo(e.target.value)} disabled={isGeneratingCopy} />
                                {isGeneratingCopy && <div className="absolute inset-0 bg-background/50 rounded-xl flex items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bold flex items-center gap-2"><Heart className="h-4 w-4 text-primary" /> Our goal *</Label>
                            <div className="relative">
                                <Textarea className="rounded-xl min-h-[100px]" placeholder="What is the mission of this hustle?" value={sellOurGoal} onChange={(e) => setSellOurGoal(e.target.value)} disabled={isGeneratingCopy} />
                                {isGeneratingCopy && <div className="absolute inset-0 bg-background/50 rounded-xl flex items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>}
                            </div>
                        </div>
                        
                        <div className="space-y-3 bg-orange-500/5 p-4 rounded-2xl border border-orange-500/20">
                            <Label className="font-bold flex items-center gap-2">
                                <CircleDollarSign className="h-4 w-4 text-orange-500" /> 
                                Payout Email (PayPal) *
                            </Label>
                            <Input 
                                className="h-12 rounded-xl" 
                                placeholder="your-paypal@email.com" 
                                value={sellPaypal} 
                                onChange={(e) => setSellPaypal(e.target.value)} 
                            />
                            <div className="bg-orange-500/10 rounded-xl p-3 space-y-1">
                                <p className="text-xs font-bold text-orange-600">⚠️ Important — Read Before Submitting</p>
                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                    Your 90% payout will be sent to this PayPal email within 3 business days after the buyer confirms receipt. 
                                    If you don't have PayPal yet, <a href="https://paypal.com/signup" target="_blank" rel="noopener noreferrer" className="text-orange-500 font-bold underline">create a free account here</a> before submitting.
                                </p>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-background rounded-xl border">
                                <Checkbox 
                                    id="confirm-paypal"
                                    checked={confirmedPaypal}
                                    onCheckedChange={(checked) => setConfirmedPaypal(checked === true)}
                                    className="mt-0.5"
                                />
                                <label htmlFor="confirm-paypal" className="text-xs font-bold cursor-pointer leading-relaxed">
                                    I confirm I have an active PayPal account with this email address and can receive payments.
                                </label>
                            </div>
                        </div>
                        <div className="pt-4 border-t space-y-4">
                             <Label className="font-bold flex items-center gap-2"><Eye className="h-4 w-4 text-muted-foreground" /> Asset Preview</Label>
                             <div className="grid grid-cols-2 gap-4">
                                  <div className="aspect-square relative rounded-2xl overflow-hidden border bg-muted">
                                       {hustle.logoUrl && <Image src={hustle.logoUrl} alt="Logo" fill className="object-cover" />}
                                       <div className="absolute bottom-2 left-2 bg-black/60 text-[8px] text-white px-2 py-0.5 rounded-full">LOGO</div>
                                  </div>
                                  <div className="aspect-square relative rounded-2xl overflow-hidden border bg-muted">
                                       {hustle.flyerUrl && <Image src={hustle.flyerUrl} alt="Flyer" fill className="object-cover" />}
                                       <div className="absolute bottom-2 left-2 bg-black/60 text-[8px] text-white px-2 py-0.5 rounded-full">FLYER</div>
                                  </div>
                             </div>
                        </div>
                    </div>
                    <DialogFooter className="pt-4">
                        <Button className="w-full h-14 rounded-2xl font-black text-xl shadow-xl bg-primary hover:bg-primary/90" onClick={handleSellHustle} disabled={isListingHustle}>{isListingHustle ? 'Syncing...' : 'Submit for Review'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <PhoneVerificationModal
    open={showPhoneVerification}
    onOpenChange={setShowPhoneVerification}
    onVerified={() => {
        setIsPhoneVerified(true);
        setShowPhoneVerification(false);
        if (!hustle.aboutUs) handleGenerateBlueprint();
        setShowSellModal(true);
    }}
/>
<PricingWizardModal
                open={showPricingWizard}
                onOpenChange={setShowPricingWizard}
                hustleName={hustle.name}
                hustleDescription={hustle.description}
                onResult={(result) => {
                    setPricingResult(result);
                    const updatedHustle = { ...hustle, pricingWizard: result };
                    setHustle(updatedHustle);
                    if (isSaved) saveHustle(updatedHustle);
                    toast({ title: '💰 Pricing Strategy Saved!' });
                }}
                savedResult={pricingResult}
            />
            <SocialCalendarModal
                open={showSocialCalendar}
                onOpenChange={setShowSocialCalendar}
                hustleName={hustle.name}
                hustleDescription={hustle.description}
                onResult={(result) => {
                    setSocialCalendarResult(result);
                    const updatedHustle = { ...hustle, socialCalendar: result };
                    setHustle(updatedHustle);
                    if (isSaved) saveHustle(updatedHustle);
                    toast({ title: '📅 Social Calendar Saved!' });
                }}
                savedResult={socialCalendarResult}
            />
            <PitchDeckModal
                open={showPitchDeck}
                onOpenChange={setShowPitchDeck}
                hustleName={hustle.name}
                hustleDescription={hustle.description}
                onResult={(result) => {
                    setPitchDeckResult(result);
                    const updatedHustle = { ...hustle, pitchDeck: result };
                    setHustle(updatedHustle);
                    if (isSaved) saveHustle(updatedHustle);
                    toast({ title: '🎯 Pitch Deck Saved!' });
                }}
                savedResult={pitchDeckResult}
                />
            </div>
            </TooltipProvider>
      );
    }
    
    export default function HustleDetailPage() {
    return (
        <Suspense fallback={<div className="container py-20 text-center"><Loader2 className="animate-spin h-10 w-10 mx-auto text-primary" /></div>}>
            <HustleDetailContent />
        </Suspense>
    )
}