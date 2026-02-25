"use client";

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEffect, useState, Suspense, useTransition, useCallback, useRef } from 'react';
import React from 'react';
import { Sparkles, Bookmark, Check, Palette, FileText, Paintbrush, Loader, Image as ImageIcon, Rocket, Printer, Calendar as CalendarIcon, Target, TrendingUp, CircleDollarSign, Edit2, Bot, Send, User, ShoppingBag, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import type { HustleIdea, HustleTrackerData } from '@/ai/flows/generate-hustle-ideas';
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer } from 'recharts';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useFirestore, useAuth as useFirebaseInstance, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';

const COUNTRIES = ["United States", "Canada", "United Kingdom", "Australia", "Other"];
const STATES: Record<string, string[]> = {
    "United States": ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"],
    "Canada": ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"],
    "United Kingdom": ["England", "Scotland", "Wales", "Northern Ireland"],
    "Australia": ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"],
    "Other": ["International / Remote"]
};

const defaultTrackerData: HustleTrackerData = {
    status: 'Not Started',
    earningsGoal: 1000,
    launchDate: null,
    progress: 0,
    earnings: [
        { month: 'Week 1', earnings: 0 },
        { month: 'Week 2', earnings: 0 },
        { month: 'Week 3', earnings: 0 },
        { month: 'Week 4', earnings: 0 },
    ],
    checkedTasks: [],
};

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

    const [isGeneratingLogo, startLogoGeneration] = useTransition();
    const [isGeneratingFlyer, startFlyerGeneration] = useTransition();
    const [isGeneratingBlueprint, startBlueprintGeneration] = useTransition();
    const [isGeneratingSchedule, startScheduleGeneration] = useTransition();
    const [isCoachReplying, startCoachReply] = useTransition();
    const [isListingHustle, startListingHustle] = useTransition();

    const [showFlyerContactModal, setShowFlyerContactModal] = useState(false);
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [showSellModal, setShowSellModal] = useState(false);
    
    const [newGoal, setNewGoal] = useState('1000');
    const [flyerEmail, setFlyerEmail] = useState('');
    const [flyerPhone, setFlyerPhone] = useState('');
    const [coachInput, setCoachInput] = useState('');

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
    
    useEffect(() => {
        if (typeof window !== 'undefined' && !initialLoadDone.current) {
            const hustleDataStr = sessionStorage.getItem('currentHustle');
            if (hustleDataStr) {
                try {
                    const parsedHustle: HustleIdeaWithExtras = JSON.parse(hustleDataStr);
                    const savedVersion = getHustleByName(parsedHustle.name);
                    const initialData = savedVersion || parsedHustle;

                    const mergedTrackerData = {
                        ...defaultTrackerData,
                        ...initialData.trackerData,
                    };

                    setHustle({ 
                        ...initialData, 
                        trackerData: mergedTrackerData,
                        coachHistory: initialData.coachHistory || [],
                    });
                    setNewGoal(String(mergedTrackerData.earningsGoal));
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

    const updateAndSaveHustle = useCallback((updates: Partial<HustleIdeaWithExtras>) => {
        setHustle(prev => {
            if (!prev) return null;
            return { ...prev, ...updates };
        });
    }, []);

    // Stabilized auto-save logic to prevent infinite loops
    const lastSaveRef = useRef<string>("");
    useEffect(() => {
        if (hustle && isSaved) {
            const hustleString = JSON.stringify(hustle);
            if (hustleString === lastSaveRef.current) return;
            
            const timeoutId = setTimeout(() => {
                saveHustle(hustle);
                lastSaveRef.current = hustleString;
            }, 5000); 
            return () => clearTimeout(timeoutId);
        }
    }, [hustle, isSaved, saveHustle]);

    const handleSaveToggle = () => {
        if (!hustle) return;
        if(isSaved) {
            unsaveHustle(hustle.name);
            toast({ title: "Removed", description: "This idea has been removed from your dashboard." });
        } else {
            saveHustle(hustle);
            toast({ title: "Hustle Saved", description: "This idea is now in your dashboard." });
        }
    }

    const handleUpdateGoal = () => {
        const goalValue = parseInt(newGoal);
        if (isNaN(goalValue)) return;
        updateAndSaveHustle({ trackerData: { ...hustle!.trackerData!, earningsGoal: goalValue } });
        setShowGoalModal(false);
        toast({ title: "Goal Updated", description: `Your monthly target is now $${goalValue}.` });
    }

    const handleToggleTask = (task: string) => {
        if (!hustle || !hustle.trackerData) return;
        const currentTasks = hustle.trackerData.checkedTasks || [];
        const newTasks = currentTasks.includes(task) 
            ? currentTasks.filter(t => t !== task)
            : [...currentTasks, task];
        
        const totalPossibleTasks = 28; 
        const progress = Math.min(100, Math.round((newTasks.length / totalPossibleTasks) * 100));

        updateAndSaveHustle({ trackerData: { ...hustle.trackerData, checkedTasks: newTasks, progress } });
    }

    const handleCoachSubmit = () => {
        if (!coachInput.trim() || !hustle) return;
        const newUserMessage: Message = { role: 'user', content: coachInput };
        const historySoFar = [...(hustle.coachHistory || []), newUserMessage];
        
        setHustle(prev => prev ? { ...prev, coachHistory: historySoFar } : null);
        
        const inputToProcess = coachInput;
        setCoachInput('');

        startCoachReply(async () => {
            const result = await generateCoachResponseAction({
                hustle: { name: hustle.name, description: hustle.description },
                userInput: inputToProcess,
                history: historySoFar,
            });
            if (result.message === 'success' && result.data) {
                const finalHistory = [...historySoFar, { role: 'model', content: result.data.coachResponse } as Message];
                updateAndSaveHustle({ coachHistory: finalHistory });
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
                updateAndSaveHustle({ ...result.data });
                toast({ title: "Blueprint Generated", description: "Your custom business strategy is ready." });
            }
        });
    }

    const handleGenerateSchedule = () => {
        if (!hustle) return;
        startScheduleGeneration(async () => {
            const result = await generateHustleScheduleAction({ hustleName: hustle.name, hustleDescription: hustle.description });
            if (result.message === 'success' && result.data) {
                updateAndSaveHustle({ schedule: result.data });
                toast({ title: "Schedule Ready", description: "Your daily action plan has been created." });
            }
        });
    }

    const handleGenerateLogo = () => {
        if (!hustle) return;
        startLogoGeneration(async () => {
            const result = await generateLogoAction({ hustleName: hustle.name, hustleDescription: hustle.description });
            if (result.message === 'success' && result.data) {
                updateAndSaveHustle({ logoUrl: result.data.logoUrl });
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
                 updateAndSaveHustle({ flyerUrl: result.data.flyerUrl });
                 setShowFlyerContactModal(false);
                 toast({ title: "Flyer Ready" });
             }
        });
    }

    const handleSellHustle = () => {
        // Critical: Ensure valid authentication before write
        const currentUser = auth.currentUser;
        if (!hustle || !currentUser || !firestore) {
            toast({ variant: 'destructive', title: "Listing Error", description: "You must be signed in to list a venture." });
            return;
        }

        if (missingAssets) {
            toast({ variant: 'destructive', title: "Assets Missing", description: "Please generate a Logo and Flyer first." });
            return;
        }

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
            // Use project's standard non-blocking mutation
            await addDocumentNonBlocking(listingsRef, listingData);
            setShowSellModal(false);
            toast({ title: "Venture Initiated!", description: "Your business is now live on the global marketplace." });
        });
    }

    if (!hustle) return null;

  return (
    <TooltipProvider delayDuration={0}>
        <div className="container py-6 md:py-12">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{hustle.name}</h1>
                        <p className="mt-2 text-lg text-muted-foreground">{hustle.description}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Button variant="default" onClick={handleSaveToggle} className="shadow-md">
                            {isSaved ? <Check className="mr-2 h-4 w-4"/> : <Bookmark className="mr-2 h-4 w-4" />}
                            {isSaved ? 'Saved to Dashboard' : 'Save Hustle'}
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => missingAssets ? toast({ variant: 'destructive', title: "Assets Required", description: "Generate a professional Logo and Flyer first." }) : setShowSellModal(true)} 
                            className={missingAssets ? 'opacity-50' : 'shadow-sm'}
                        >
                            <ShoppingBag className="mr-2 h-4 w-4" />
                            Sell Your Hustle
                        </Button>
                    </div>
                </div>

                {missingAssets && (
                    <Alert className="bg-primary/5 border-primary/20">
                        <AlertCircle className="h-4 w-4 text-primary" />
                        <AlertTitle className="font-bold">Marketplace Locked</AlertTitle>
                        <AlertDescription>Generate your <strong>Logo</strong> and <strong>Flyer</strong> below to unlock the global marketplace.</AlertDescription>
                    </Alert>
                )}

                <Card className="shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div><CardTitle>Strategy Blueprint</CardTitle></div>
                        {isPremium && (
                            <Button variant="ghost" size="sm" onClick={handleGenerateBlueprint} disabled={isGeneratingBlueprint}>
                                {isGeneratingBlueprint ? <Loader className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                                {hustle.pricingTip ? 'Regenerate' : 'Generate'}
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        {!isPremium ? (
                            <div className="text-center p-8 border-2 border-dashed rounded-xl">
                                <h3 className="text-lg font-bold">Premium Strategy Required</h3>
                                <Button className="mt-4" onClick={() => setPaymentModalOpen(true)}>Upgrade to Unlock Blueprint</Button>
                            </div>
                        ) : hustle.pricingTip ? (
                             <div className="grid md:grid-cols-2 gap-6 text-sm">
                                <div className="space-y-2">
                                    <h4 className="font-bold flex items-center gap-2 text-primary"><CircleDollarSign className="h-4 w-4"/> Elite Pricing</h4>
                                    <p className="text-muted-foreground leading-relaxed">{hustle.pricingTip}</p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-bold flex items-center gap-2 text-accent"><Target className="h-4 w-4"/> Growth Strategy</h4>
                                    <p className="text-muted-foreground leading-relaxed">{hustle.marketingIdea}</p>
                                </div>
                             </div>
                        ) : (
                            <Button className="w-full h-12" onClick={handleGenerateBlueprint} disabled={isGeneratingBlueprint}>
                                Generate Full Strategic Blueprint
                            </Button>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-primary/20 bg-primary/5 shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2"><CalendarIcon className="h-5 w-5"/> Daily Action Plan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!isPremium ? (
                            <div className="text-center py-8">
                                <p className="text-sm text-muted-foreground mb-4">Unlock a step-by-step 4-week launch schedule with Premium.</p>
                                <Button size="sm" onClick={() => setPaymentModalOpen(true)}>Upgrade for Plan</Button>
                            </div>
                        ) : hustle.schedule ? (
                            <Accordion type="single" collapsible className="w-full space-y-2">
                                {[1, 2, 3, 4].map((weekNum) => {
                                    const weekKey = `week${weekNum}` as keyof GenerateHustleScheduleOutput;
                                    const tasks = hustle.schedule![weekKey];
                                    return (
                                        <AccordionItem key={weekKey} value={weekKey} className="border rounded-lg bg-background px-4">
                                            <AccordionTrigger>Week {weekNum}</AccordionTrigger>
                                            <AccordionContent>
                                                <div className="space-y-2 pt-2">
                                                    {tasks.map((task, idx) => (
                                                        <div key={idx} className="flex items-center space-x-3 bg-muted/30 p-3 rounded-lg">
                                                            <Checkbox id={`${weekKey}-${idx}`} checked={hustle.trackerData?.checkedTasks?.includes(task)} onCheckedChange={() => handleToggleTask(task)}/>
                                                            <label htmlFor={`${weekKey}-${idx}`} className="text-sm flex-1">{task}</label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    );
                                })}
                            </Accordion>
                        ) : (
                            <Button className="w-full h-12" onClick={handleGenerateSchedule} disabled={isGeneratingSchedule}>
                                Generate 4-Week Launch Schedule
                            </Button>
                        )}
                    </CardContent>
                </Card>

                <Card className="shadow-md">
                    <CardHeader><CardTitle>Brand Assets</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        {!isPremium ? (
                            <div className="text-center py-8 bg-muted/20 border-2 border-dashed rounded-xl">
                                <p className="text-sm text-muted-foreground mb-4">Upgrade to generate professional agency-grade logos and flyers.</p>
                                <Button size="sm" onClick={() => setPaymentModalOpen(true)}>Unlock Brand Assets</Button>
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="aspect-square bg-muted rounded-xl flex items-center justify-center relative overflow-hidden border">
                                        {hustle.logoUrl ? <Image src={hustle.logoUrl} alt="Logo" fill className="object-cover" /> : <ImageIcon className="h-12 w-12 text-muted-foreground opacity-30" />}
                                        {isGeneratingLogo && <div className="absolute inset-0 bg-background/50 flex items-center justify-center"><Loader className="animate-spin text-primary" /></div>}
                                    </div>
                                    <Button variant="outline" className="w-full h-11" onClick={handleGenerateLogo} disabled={isGeneratingLogo}>
                                        {hustle.logoUrl ? 'Redesign Brand' : 'Generate Logo'}
                                    </Button>
                                </div>
                                <div className="space-y-4">
                                    <div className="aspect-[4/5] bg-muted rounded-xl flex items-center justify-center relative overflow-hidden border">
                                        {hustle.flyerUrl ? <Image src={hustle.flyerUrl} alt="Flyer" fill className="object-cover" /> : <Printer className="h-12 w-12 text-muted-foreground opacity-30" />}
                                        {isGeneratingFlyer && <div className="absolute inset-0 bg-background/50 flex items-center justify-center"><Loader className="animate-spin text-primary" /></div>}
                                    </div>
                                    <Button variant="outline" className="w-full h-11" onClick={() => setShowFlyerContactModal(true)} disabled={isGeneratingFlyer}>
                                        {hustle.flyerUrl ? 'Update Promotion' : 'Generate Flyer'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-accent/20 shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5"/> Hustle Tracker</CardTitle>
                        {isPremium && <Button variant="ghost" size="sm" onClick={() => setShowGoalModal(true)}>Set Goal</Button>}
                    </CardHeader>
                    <CardContent>
                        {!isPremium ? (
                             <div className="bg-accent/5 rounded-lg p-10 text-center border-2 border-accent/20 border-dashed">
                                <h3 className="text-xl font-bold">Track Your Growth</h3>
                                <Button className="mt-6 h-12" onClick={() => setPaymentModalOpen(true)}>Upgrade to Unlock Tracker</Button>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <Label className="text-sm font-bold">Launch Readiness</Label>
                                            <span className="text-sm font-bold text-accent">{hustle.trackerData?.progress}%</span>
                                        </div>
                                        <Progress value={hustle.trackerData?.progress} className="h-3" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-muted rounded-xl border">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Monthly Goal</p>
                                            <p className="text-2xl font-bold">${hustle.trackerData?.earningsGoal}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="h-[200px] bg-muted/10 rounded-xl border p-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={hustle.trackerData?.earnings}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="month" hide />
                                            <YAxis hide />
                                            <ChartTooltip />
                                            <Bar dataKey="earnings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader><CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5"/> AI Coaching Hub</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <ScrollArea className="h-[300px] border rounded-xl bg-background/50 p-4">
                            <div className="space-y-4">
                                {hustle.coachHistory?.map((msg, i) => (
                                    <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                        <div className={`p-4 rounded-2xl text-sm shadow-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                        <div className="flex gap-2">
                            <Input placeholder="Ask Sparky for advice..." value={coachInput} onChange={(e) => setCoachInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCoachSubmit()} className="h-12 bg-background" />
                            <Button onClick={handleCoachSubmit} disabled={isCoachReplying || !coachInput.trim()} className="h-12 w-12 rounded-xl shadow-md"><Send className="h-5 w-5" /></Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={showSellModal} onOpenChange={setShowSellModal}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Venture Launchpad</DialogTitle>
                        <DialogDescription>List your side hustle for sale on our global marketplace.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Listing Price ($)</Label><Input type="number" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} /></div>
                            <div className="space-y-2"><Label>Work Format</Label>
                                <Select value={sellWorkFrom} onValueChange={setSellWorkFrom}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent><SelectItem value="Remote">Remote</SelectItem><SelectItem value="Local">Local Only</SelectItem></SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2"><Label>Category</Label>
                            <Select value={sellCategory} onValueChange={setSellCategory}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Creative Services">Creative Services</SelectItem>
                                    <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                                    <SelectItem value="Education">Education</SelectItem>
                                    <SelectItem value="Home Services">Home Services</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Country</Label>
                                <Select value={sellCountry} onValueChange={(val) => setSellCountry(val)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2"><Label>State / Region</Label>
                                <Select value={sellState} onValueChange={setSellState}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {(STATES[sellCountry] || STATES["Other"]).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2"><Label>Professional Pitch</Label><Textarea value={sellPitch} onChange={(e) => setSellPitch(e.target.value)} placeholder="Describe the value you bring to customers..." rows={4} /></div>
                        <div className="space-y-2"><Label>Expertise & Experience</Label><Textarea value={sellExperience} onChange={(e) => setSellExperience(e.target.value)} placeholder="Why are you the right person for this?" /></div>
                        <div className="space-y-2"><Label>Target Audience</Label><Textarea value={sellWhoIHelp} onChange={(e) => setSellWhoIHelp(e.target.value)} placeholder="Who exactly does this help?" /></div>
                    </div>
                    <DialogFooter>
                        <Button className="w-full h-14 text-lg font-bold shadow-xl" onClick={handleSellHustle} disabled={isListingHustle}>{isListingHustle ? 'Launching...' : 'Launch to Marketplace'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    </TooltipProvider>
  );
}

export default function HustleDetailPage() {
    return (
        <Suspense fallback={<div className="container py-20 text-center"><Loader className="animate-spin h-12 w-12 mx-auto" /></div>}>
            <HustleDetailContent />
        </Suspense>
    )
}

export const runtime = 'edge';
