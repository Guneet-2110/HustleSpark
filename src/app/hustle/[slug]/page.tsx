"use client";

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEffect, useState, Suspense, useTransition, useCallback, useRef } from 'react';
import React from 'react';
import { Sparkles, Bookmark, Check, Palette, FileText, Paintbrush, Loader, Image as ImageIcon, Rocket, Printer, Calendar as CalendarIcon, Target, TrendingUp, CircleDollarSign, Bot, Send, ShoppingBag, AlertCircle } from 'lucide-react';
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
    const [showSellModal, setShowSellModal] = useState(false);
    
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
                    setHustle({ ...initialData });
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
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{hustle.name}</h1>
                        <p className="mt-2 text-lg text-muted-foreground">{hustle.description}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Button variant="default" onClick={handleSaveToggle} className="shadow-md">
                            {isSaved ? <Check className="mr-2 h-4 w-4"/> : <Bookmark className="mr-2 h-4 w-4" />}
                            {isSaved ? 'Saved' : 'Save Hustle'}
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => missingAssets ? toast({ variant: 'destructive', title: "Assets Missing", description: "Generate Logo and Flyer first." }) : setShowSellModal(true)} 
                        >
                            <ShoppingBag className="mr-2 h-4 w-4" />
                            Sell Hustle
                        </Button>
                    </div>
                </div>

                {missingAssets && (
                    <Alert className="bg-primary/5 border-primary/20">
                        <AlertCircle className="h-4 w-4 text-primary" />
                        <AlertTitle className="font-bold">Marketplace Locked</AlertTitle>
                        <AlertDescription>Generate your <strong>Logo</strong> and <strong>Flyer</strong> to unlock the marketplace.</AlertDescription>
                    </Alert>
                )}

                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Strategy</CardTitle>
                            {isPremium && (
                                <Button variant="ghost" size="sm" onClick={handleGenerateBlueprint} disabled={isGeneratingBlueprint}>
                                    {isGeneratingBlueprint ? <Loader className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                                    {hustle.pricingTip ? 'Regenerate' : 'Generate'}
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            {!isPremium ? (
                                <div className="text-center p-4 border-2 border-dashed rounded-xl">
                                    <Button size="sm" onClick={() => setPaymentModalOpen(true)}>Upgrade to Unlock</Button>
                                </div>
                            ) : hustle.pricingTip ? (
                                <div className="space-y-4 text-sm">
                                    <div className="space-y-1">
                                        <h4 className="font-bold text-primary flex items-center gap-2"><CircleDollarSign className="h-4 w-4"/> Pricing</h4>
                                        <p className="text-muted-foreground">{hustle.pricingTip}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-bold text-accent flex items-center gap-2"><Target className="h-4 w-4"/> Marketing</h4>
                                        <p className="text-muted-foreground">{hustle.marketingIdea}</p>
                                    </div>
                                </div>
                            ) : (
                                <Button className="w-full" onClick={handleGenerateBlueprint} disabled={isGeneratingBlueprint}>Generate Blueprint</Button>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-primary/20 bg-primary/5 shadow-md">
                        <CardHeader><CardTitle className="flex items-center gap-2"><CalendarIcon className="h-5 w-5"/> Launch Plan</CardTitle></CardHeader>
                        <CardContent>
                            {!isPremium ? (
                                <div className="text-center py-4">
                                    <Button size="sm" variant="secondary" onClick={() => setPaymentModalOpen(true)}>Upgrade for Schedule</Button>
                                </div>
                            ) : hustle.schedule ? (
                                <Accordion type="single" collapsible className="w-full">
                                    {[1, 2, 3, 4].map((num) => {
                                        const key = `week${num}` as keyof GenerateHustleScheduleOutput;
                                        return (
                                            <AccordionItem key={key} value={key} className="bg-background px-3 border rounded-lg mb-1">
                                                <AccordionTrigger>Week {num}</AccordionTrigger>
                                                <AccordionContent className="space-y-1">
                                                    {hustle.schedule![key].map((task, i) => (
                                                        <div key={i} className="flex items-center gap-2 text-xs p-2 bg-muted/30 rounded">
                                                            <Checkbox id={`${key}-${i}`} />
                                                            <label htmlFor={`${key}-${i}`}>{task}</label>
                                                        </div>
                                                    ))}
                                                </AccordionContent>
                                            </AccordionItem>
                                        );
                                    })}
                                </Accordion>
                            ) : (
                                <Button className="w-full" onClick={handleGenerateSchedule} disabled={isGeneratingSchedule}>Generate 4-Week Plan</Button>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card className="shadow-md">
                    <CardHeader><CardTitle>Branding Assets</CardTitle></CardHeader>
                    <CardContent>
                        {!isPremium ? (
                            <div className="text-center py-8 border-2 border-dashed rounded-xl">
                                <Button size="sm" onClick={() => setPaymentModalOpen(true)}>Unlock Brand Kits</Button>
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="aspect-square bg-muted rounded-xl flex items-center justify-center relative overflow-hidden border">
                                        {hustle.logoUrl ? <Image src={hustle.logoUrl} alt="Logo" fill className="object-cover" /> : <ImageIcon className="h-12 w-12 text-muted-foreground opacity-30" />}
                                        {isGeneratingLogo && <div className="absolute inset-0 bg-background/50 flex items-center justify-center"><Loader className="animate-spin text-primary" /></div>}
                                    </div>
                                    <Button variant="outline" className="w-full" onClick={handleGenerateLogo} disabled={isGeneratingLogo}>
                                        {hustle.logoUrl ? 'Redesign Logo' : 'Generate Logo'}
                                    </Button>
                                </div>
                                <div className="space-y-4">
                                    <div className="aspect-[4/5] bg-muted rounded-xl flex items-center justify-center relative overflow-hidden border">
                                        {hustle.flyerUrl ? <Image src={hustle.flyerUrl} alt="Flyer" fill className="object-cover" /> : <Printer className="h-12 w-12 text-muted-foreground opacity-30" />}
                                        {isGeneratingFlyer && <div className="absolute inset-0 bg-background/50 flex items-center justify-center"><Loader className="animate-spin text-primary" /></div>}
                                    </div>
                                    <Button variant="outline" className="w-full" onClick={() => setShowFlyerContactModal(true)} disabled={isGeneratingFlyer}>
                                        {hustle.flyerUrl ? 'Update Flyer' : 'Generate Flyer'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader><CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5"/> Sparky: AI Coach</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <ScrollArea className="h-[250px] border rounded-xl bg-background/50 p-4">
                            <div className="space-y-4">
                                {hustle.coachHistory?.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`p-3 rounded-2xl text-sm max-w-[80%] ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                                {isCoachReplying && <div className="text-xs text-muted-foreground animate-pulse">Sparky is typing...</div>}
                            </div>
                        </ScrollArea>
                        <div className="flex gap-2">
                            <Input placeholder="Ask Sparky anything..." value={coachInput} onChange={(e) => setCoachInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCoachSubmit()} />
                            <Button onClick={handleCoachSubmit} disabled={isCoachReplying || !coachInput.trim()} size="icon"><Send className="h-4 w-4" /></Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={showFlyerContactModal} onOpenChange={setShowFlyerContactModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Flyer Contact Details</DialogTitle>
                        <DialogDescription>Add your contact info to the generated flyer.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input value={flyerEmail} onChange={(e) => setFlyerEmail(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone (Optional)</Label>
                            <Input value={flyerPhone} onChange={(e) => setFlyerPhone(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button className="w-full" onClick={handleGenerateFlyer} disabled={isGeneratingFlyer}>
                            {isGeneratingFlyer ? 'Designing...' : 'Design Flyer'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showSellModal} onOpenChange={setShowSellModal}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Marketplace Listing</DialogTitle>
                        <DialogDescription>List your side hustle for sale.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Price ($)</Label><Input type="number" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} /></div>
                            <div className="space-y-2"><Label>Work</Label>
                                <Select value={sellWorkFrom} onValueChange={setSellWorkFrom}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent><SelectItem value="Remote">Remote</SelectItem><SelectItem value="Local">Local</SelectItem></SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2"><Label>Pitch</Label><Textarea value={sellPitch} onChange={(e) => setSellPitch(e.target.value)} rows={3} /></div>
                        <div className="space-y-2"><Label>Experience</Label><Textarea value={sellExperience} onChange={(e) => setSellExperience(e.target.value)} /></div>
                        <div className="space-y-2"><Label>Who I Help</Label><Textarea value={sellWhoIHelp} onChange={(e) => setSellWhoIHelp(e.target.value)} /></div>
                    </div>
                    <DialogFooter>
                        <Button className="w-full" onClick={handleSellHustle} disabled={isListingHustle}>{isListingHustle ? 'Listing...' : 'Launch to Marketplace'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    </TooltipProvider>
  );
}

export default function HustleDetailPage() {
    return (
        <Suspense fallback={<div className="container py-20 text-center"><Loader className="animate-spin h-10 w-10 mx-auto" /></div>}>
            <HustleDetailContent />
        </Suspense>
    )
}
