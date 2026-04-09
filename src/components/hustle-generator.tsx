
"use client";

import { useActionState, useState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { generateHustleIdeasAction } from '@/lib/actions';
import { useAuth } from '@/hooks/use-auth';
import { HustleCard } from './hustle-card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Lightbulb, Terminal, User, Star, Loader2 } from 'lucide-react';
import React from 'react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto active:scale-95 transition-transform">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Sparking Ideas...
        </>
      ) : (
        'Generate Hustles'
      )}
    </Button>
  );
}

export function HustleGenerator() {
  const { setGeneratedHustles, generatedHustles, isPremium, setPaymentModalOpen } = useAuth();
  const { user: fbUser } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !fbUser) return null;
    return doc(firestore, 'users', fbUser.uid);
  }, [firestore, fbUser]);

  const { data: userDoc } = useDoc(userDocRef);

  const initialState = { message: null, data: null, errors: {} };
  const [state, dispatch] = useActionState(generateHustleIdeasAction, initialState);

  const [skillsAndInterests, setSkillsAndInterests] = useState('');
  const [age, setAge] = useState('');
  const [timeCommitment, setTimeCommitment] = useState('');

  // Sync results from Firestore on initial load
  useEffect(() => {
    if (userDoc?.lastGeneratedHustles && generatedHustles.length === 0) {
      setGeneratedHustles(userDoc.lastGeneratedHustles);
    }
  }, [userDoc, generatedHustles.length, setGeneratedHustles]);

  // Persist new generation results to Firestore
  useEffect(() => {
    if (state?.message === 'success' && state?.data) {
      setGeneratedHustles(state.data);
      
      if (!isPremium && fbUser && firestore) {
        const docRef = doc(firestore, 'users', fbUser.uid);
        updateDoc(docRef, {
          hasGenerated: true,
          lastGeneratedHustles: state.data
        });
      }
    }
  }, [state, setGeneratedHustles, isPremium, fbUser, firestore]);

  const hasUsedFreeGen = !isPremium && userDoc?.hasGenerated;
  const currentResults = generatedHustles.length > 0 ? generatedHustles : (userDoc?.lastGeneratedHustles || []);

  return (
    <div className="max-w-4xl mx-auto">
        {hasUsedFreeGen ? (
            <div className="space-y-12">
                <Alert className="text-center bg-muted/50 border-dashed rounded-[2rem] p-8">
                    <Star className="h-8 w-8 mx-auto mb-4 text-primary" />
                    <AlertTitle className="font-black text-2xl">Free Allotment Reached</AlertTitle>
                    <AlertDescription className="mt-4 text-muted-foreground text-lg font-medium leading-relaxed">
                        You've unlocked your first 3 side hustle ideas! Upgrade to Premium to generate unlimited ideas, access expert blueprints, and chat with your AI coach Sparky.
                    </AlertDescription>
                    <Button className="mt-8 h-14 px-8 rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-transform" onClick={() => setPaymentModalOpen(true)}>
                        <Star className="mr-2 h-5 w-5 fill-current"/>
                        Unlock Unlimited Growth
                    </Button>
                </Alert>

                <div className="animate-fade-in">
                    <h2 className="text-3xl font-black text-center mb-2 tracking-tight">Your AI-Generated Hustles</h2>
                    <p className="text-center text-muted-foreground mb-8 font-medium">Saved to your profile. Select one to start building.</p>
                    <div className="grid md:grid-cols-3 gap-6">
                        {currentResults.map((hustle: any) => (
                            <HustleCard key={hustle.name} hustle={hustle} />
                        ))}
                    </div>
                </div>
            </div>
        ) : (
             <form action={dispatch} className="space-y-6">
                <input type="hidden" name="isPremium" value={String(isPremium)} />
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="age" className="font-bold">How old are you?</Label>
                        <div className="relative">
                            <Input id="age" name="age" placeholder="e.g., 17" value={age} onChange={(e) => setAge(e.target.value)} className="h-12 rounded-xl" />
                            <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                        {state?.errors?.age && (
                            <p className="text-sm font-medium text-destructive">{state.errors.age[0]}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="timeCommitment" className="font-bold">Time availability</Label>
                        <div className="relative">
                            <Select name="timeCommitment" value={timeCommitment} onValueChange={setTimeCommitment}>
                                <SelectTrigger id="timeCommitment" className="h-12 rounded-xl">
                                    <SelectValue placeholder="Select commitment" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="< 5 hours/week">Less than 5 hours/week</SelectItem>
                                    <SelectItem value="5-10 hours/week">5-10 hours/week</SelectItem>
                                    <SelectItem value="10+ hours/week">10+ hours/week</SelectItem>
                                    <SelectItem value="Weekends only">Weekends only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {state?.errors?.timeCommitment && (
                            <p className="text-sm font-medium text-destructive">{state.errors.timeCommitment[0]}</p>
                        )}
                    </div>
                </div>

                <div className="grid w-full gap-1.5">
                <Label htmlFor="skillsAndInterests" className="font-bold">Your Interests & Expertise</Label>
                <Textarea
                    id="skillsAndInterests"
                    name="skillsAndInterests"
                    placeholder="e.g., I'm a graphic designer who loves vintage cars and sourdough baking..."
                    rows={5}
                    className="bg-background/80 focus:bg-background rounded-xl p-4 text-base"
                    value={skillsAndInterests}
                    onChange={(e) => setSkillsAndInterests(e.target.value)}
                />
                {state?.errors?.skillsAndInterests && (
                    <p className="text-sm font-medium text-destructive">{state.errors.skillsAndInterests[0]}</p>
                )}
                </div>
                <div className="text-center">
                    <SubmitButton />
                </div>
            </form>
        )}
     

      {state?.message && state?.message !== 'success' && (
        <Alert variant="destructive" className="mt-6 rounded-2xl bg-destructive/10 border-destructive/20">
          <Terminal className="h-4 w-4 text-destructive" />
          <AlertTitle className="font-black uppercase tracking-widest text-xs">Generator Error</AlertTitle>
          <AlertDescription className="font-mono text-xs mt-1">{state.message}</AlertDescription>
        </Alert>
      )}

      {!hasUsedFreeGen && currentResults.length > 0 && (
         <div className="mt-12 animate-fade-in">
            <h2 className="text-3xl font-black text-center mb-2 tracking-tight">Your AI-Generated Hustles</h2>
            <p className="text-center text-muted-foreground mb-8 font-medium">Click on any venture card to access your strategic launchpad.</p>
            <div className="grid md:grid-cols-3 gap-6">
              {currentResults.map((hustle: any) => (
                <HustleCard key={hustle.name} hustle={hustle} />
              ))}
            </div>
         </div>
      )}

      {currentResults.length === 0 && !state?.message && !hasUsedFreeGen && (
        <div className="mt-12 text-center opacity-40">
          <Lightbulb className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground font-black uppercase tracking-[0.2em] text-xs">Awaiting Input Parameters...</p>
        </div>
      )}
    </div>
  );
}
