
"use client";

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEffect, useState, Suspense, useTransition, useCallback, useRef } from 'react';
import React from 'react';
import { 
    Sparkles, Bookmark, Check, Palette, FileText, Paintbrush, Loader, 
    Image as ImageIcon, Rocket, Printer, Calendar as CalendarIcon, 
    Target, TrendingUp, CircleDollarSign, Bot, Send, ShoppingBag, 
    AlertCircle, LayoutDashboard, LineChart, CheckSquare, Settings2, Download
} from 'lucide-react';
import Image from 'next/image';
import type { HustleIdea } from '@/ai/flows/generate-hustle-ideas';
import type { GenerateHustleScheduleOutput } from '@/ai/flows/generate-hustle-schedule';
import { generateFlyerAction, generateLogoAction, generateHustleBlueprintAction, generateHustleScheduleAction, generateCoachResponseAction } from '@/lib/actions';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from '@/components/ui/dialog';
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
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useFirestore, useAuth as useFirebaseInstance, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Message = {
    role: 'user' | 'model';
    content: string;
}

type HustleIdeaWithExtras = HustleIdea & { 
    schedule?: GenerateHustleScheduleOutput;
    coachHistory?: Message[];
};

function HustleDetailContent() {
    const { user: localUser, isPremium, setPaymentModalOpen, saveHustle, unsaveHustle, isHustleSaved, getHustleByName } = useAuth();
    const firestore = useFirestore();
    const auth = useFirebaseInstance();
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
    const [showTrackerSettings, setShowTrackerSettings] = useState(false);
    
    // Inputs
    const [flyerEmail, setFlyerEmail] = useState('');
    const [flyerPhone, setFlyerPhone] = useState('');
    const [coachInput, setCoachInput] = useState('');
    const [targetEarnings, setTargetEarnings] = useState('1000');

    // Sell Form
    const [sellPrice, setSellPrice] = useState('100');
    const [sellCategory, setSellCategory] = useState('Creative Services');
    const [sellCountry, setSellCountry] = useState('United States');
    const [sellState, setSellState] = useState('TX');
    const [sellPaypal, setSellPaypal] = useState('');
    const [sellPitch, setSellPitch] = useState('');
    const [sellExperience, setSellExperience] = useState('');
    const [sellWhoIHelp, setSellWhoIHelp] = useState('');
    const [sellWorkFrom, setSellWorkFrom] = useState('Remote');
    
    const isSaved = hustle ? isHustleSaved(hustle.name) : false;
    const missingAssets = hustle ? (!hustle.logoUrl || !hustle.flyerUrl) : true;
    
    // Initialize Data
    useEffect(() => {
        if (typeof window !== 'undefined' && !initialLoadDone.current) {
            const hustleDataStr = sessionStorage.getItem('currentHustle');
            if (hustleDataStr) {
                try {
                    const parsedHustle: HustleIdeaWithExtras = JSON.parse(hustleDataStr);
                    const savedVersion = getHustleByName(parsedHustle.name);
                    const initialData = savedVersion || parsedHustle;
                    setHustle({ ...initialData });
                    if (initialData.trackerData?.earningsGoal) {
                        setTargetEarnings(initialData.trackerData.earningsGoal.toString());
                    }
                    initialLoadDone.current = true;
                } catch (error) {
                    console.error("Failed to parse hustle data", error);
                }
            }
        }
    }, [getHustleByName]); 

    useEffect(() => {
        if (localUser?.email) {
            setSellPaypal(localUser.email);
            setFlyerEmail(localUser.email);
        }
    }, [localUser]);

    // Tracker Logic
    const toggleTask = (weekKey: string, taskIndex: number) => {
        if (!hustle) return;
        const taskId = `${weekKey}-${taskIndex}`;
        const currentChecked = hustle.trackerData?.checkedTasks || [];
        const isChecked = currentChecked.includes(taskId);
        
        const newChecked = isChecked 
            ? currentChecked.filter(id => id !== taskId)
            : [...currentChecked, taskId];

        const totalTasks = 28; // 4 weeks * 7 tasks
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
        if(isSaved) {
            unsaveHustle(hustle.name);
            toast({ title: "Removed", description: "Hustle removed from your dashboard." });
        } else {
            saveHustle(hustle);
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
            const result = await generateHustleScheduleAction({ hustleName: hustle.name, hustleDescription: hustle.description });
            if (result.message === 'success' && result.data) {
                const updatedHustle = { ...hustle, schedule: result.data };
                setHustle(updatedHustle);
                if (isSaved) saveHustle(updatedHustle);
                toast({ title: "Schedule Ready" });
            }
        });
    }

    const handleGenerateLogo = () => {
        if (!hustle) return;
        startLogoGeneration(async () => {
            const result = await generateLogoAction({ hustleName: hustle.name, hustleDescription: hustle.description });
            if (result.message === 'success' && result.data) {
                const updatedHustle = { ...hustle, logoUrl: result.data.logoUrl };
                setHustle(updatedHustle);
                if (isSaved) saveHustle(updatedHustle);
                toast({ title: "Logo Ready" });
            }
        });
    }

    const handleGenerateFlyer = () => {
        if (!hustle) return;
        startFlyerGeneration(async () => {
             const result = await generateFlyerAction({ 
                 hustleName: hustle.name, 
                 flyerText: hustle.flyerText || hustle.description,
                 email: flyerEmail,
                 phone: flyerPhone
             });
             if (result.message === 'success' && result.data) {
                 const updatedHustle = { ...hustle, flyerUrl: result.data.flyerUrl };
                 setHustle(updatedHustle);
                 if (isSaved) saveHustle(updatedHustle);
                 setShowFlyerContactModal(false);
                 toast({ title: "Flyer Ready" });
             }
        });
    }

    const handleSellHustle = () => {
        const currentUser = auth.currentUser;
        if (!hustle || !currentUser || !firestore) return;

        const listingData = {
            hustleName: hustle.name,
            description: hustle.description,
            pitch: sellPitch,
            experience: sellExperience,
            whoIHelp: sellWhoIHelp,
            workFrom: sellWorkFrom,
            price: parseFloat(sellPrice),
            category: sellCategory,
            country: sellCountry,
            state: sellState,
            location: `${sellState}, ${sellCountry}`,
            paypalEmail: sellPaypal,
            flyerUrl: hustle.flyerUrl || '', 
            logoUrl: hustle.logoUrl || '',   
            userId: currentUser.uid,        
            createdAt: serverTimestamp(), 
        };

        startListingHustle(async () => {
            const listingsRef = collection(firestore, 'marketplace_listings');
            addDocumentNonBlocking(listingsRef, listingData);
            setShowSellModal(false);
            toast({ title: "Venture Initiated!", description: "Your business is now live on the marketplace." });
        });
    }

    if (!hustle) return null;

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
                            onClick={() => missingAssets ? toast({ variant: 'destructive', title: "Assets Missing", description: "Generate Logo and Flyer first." }) : setShowSellModal(true)} 
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
                                <div className="grid sm:grid-cols-3 gap-6">
                                    <div className="bg-background/60 backdrop-blur-md p-6 rounded-3xl border shadow-sm space-y-2">
                                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Launch Progress</p>
                                        <div className="flex items-end gap-2">
                                            <span className="text-4xl font-black">{hustle.trackerData?.progress || 0}%</span>
                                            <span className="text-xs text-muted-foreground pb-1">Ready</span>
                                        </div>
                                        <Progress value={hustle.trackerData?.progress || 0} className="h-2" />
                                    </div>
                                    <div className="bg-background/60 backdrop-blur-md p-6 rounded-3xl border shadow-sm space-y-2">
                                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Earnings Goal</p>
                                        <div className="flex items-end gap-2">
                                            <span className="text-4xl font-black">${hustle.trackerData?.earningsGoal || 1000}</span>
                                            <span className="text-xs text-muted-foreground pb-1">Target</span>
                                        </div>
                                        <Progress value={0} className="h-2 opacity-30" />
                                    </div>
                                    <div className="bg-primary text-primary-foreground p-6 rounded-3xl shadow-xl space-y-2 relative overflow-hidden">
                                        <div className="absolute -right-4 -bottom-4 opacity-20">
                                            <CircleDollarSign className="h-20 w-20" />
                                        </div>
                                        <p className="text-xs font-black uppercase tracking-widest opacity-80">Earnings to Date</p>
                                        <div className="flex items-end gap-2">
                                            <span className="text-4xl font-black">$0</span>
                                            <span className="text-xs opacity-80 pb-1">USD</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-bold flex items-center gap-2 px-2"><CheckSquare className="h-5 w-5 text-primary" /> Launch Roadmap</h3>
                                    {!hustle.schedule ? (
                                        <div className="text-center py-12 bg-background/40 rounded-[2rem] border-2 border-dashed border-primary/20">
                                            <Button onClick={handleGenerateSchedule} disabled={isGeneratingSchedule} className="rounded-2xl h-12 px-8 font-bold">
                                                {isGeneratingSchedule ? <Loader className="animate-spin mr-2" /> : <CalendarIcon className="mr-2 h-5 w-5" />}
                                                Generate 4-Week Action Plan
                                            </Button>
                                        </div>
                                    ) : (
                                        <Accordion type="single" collapsible className="w-full space-y-3">
                                            {[1, 2, 3, 4].map((num) => {
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
                                            <Button variant="secondary" className="rounded-2xl" onClick={handleGenerateBlueprint} disabled={isGeneratingBlueprint}>Generate Pricing Strategy</Button>
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
                                            <Button variant="secondary" className="rounded-2xl" onClick={handleGenerateBlueprint} disabled={isGeneratingBlueprint}>Generate Marketing Blitz</Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
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
                                        {isGeneratingLogo && <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center"><Loader className="animate-spin text-primary h-8 w-8" /></div>}
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
                                        {isGeneratingFlyer && <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center"><Loader className="animate-spin text-primary h-8 w-8" /></div>}
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
                                        {isCoachReplying && <div className="flex gap-2 items-center text-xs text-muted-foreground animate-pulse font-bold uppercase tracking-wider"><Loader className="h-3 w-3 animate-spin" /> Sparky is strategizing...</div>}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                            <CardFooter className="p-6 bg-muted/30 border-t">
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

            <Dialog open={showSellModal} onOpenChange={setShowSellModal}>
                <DialogContent className="sm:max-w-lg rounded-[2.5rem]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">Marketplace Launchpad</DialogTitle>
                        <DialogDescription>List your proven side hustle strategy for sale to the global community.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto px-1">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label className="font-bold">Sale Price ($)</Label><Input type="number" className="h-12 rounded-xl font-bold" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} /></div>
                            <div className="space-y-2"><Label className="font-bold">Operation</Label>
                                <Select value={sellWorkFrom} onValueChange={setSellWorkFrom}>
                                    <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                                    <SelectContent><SelectItem value="Remote">Remote Operation</SelectItem><SelectItem value="Local">Local Delivery</SelectItem></SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2"><Label className="font-bold">The Pitch</Label><Textarea className="rounded-xl min-h-[100px]" placeholder="Why should someone buy this business?" value={sellPitch} onChange={(e) => setSellPitch(e.target.value)} /></div>
                        <div className="space-y-2"><Label className="font-bold">Your Success Path</Label><Textarea className="rounded-xl" placeholder="Describe your experience with this hustle..." value={sellExperience} onChange={(e) => setSellExperience(e.target.value)} /></div>
                        <div className="space-y-2"><Label className="font-bold">Target Buyer</Label><Textarea className="rounded-xl" placeholder="Who is this business ideal for?" value={sellWhoIHelp} onChange={(e) => setSellWhoIHelp(e.target.value)} /></div>
                    </div>
                    <DialogFooter className="pt-4">
                        <Button className="w-full h-14 rounded-2xl font-black text-xl shadow-xl" onClick={handleSellHustle} disabled={isListingHustle}>{isListingHustle ? 'Syncing...' : 'Publish to Marketplace'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    </TooltipProvider>
  );
}

export default function HustleDetailPage() {
    return (
        <Suspense fallback={<div className="container py-20 text-center"><Loader className="animate-spin h-10 w-10 mx-auto text-primary" /></div>}>
            <HustleDetailContent />
        </Suspense>
    )
}
