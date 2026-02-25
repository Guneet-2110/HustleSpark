
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
  const { setGeneratedHustles, generatedHustles, isPremium, upgradeToPremium } = useAuth();

  const initialState = { message: null, data: null, errors: {} };
  const [state, dispatch] = useActionState(generateHustleIdeasAction, initialState);

  const [skillsAndInterests, setSkillsAndInterests] = useState('');
  const [age, setAge] = useState('');
  const [timeCommitment, setTimeCommitment] = useState('');

  useEffect(() => {
    if (state?.message === 'success' && state?.data) {
      setGeneratedHustles(state.data);
    }
  }, [state, setGeneratedHustles]);

  const hasGenerated = generatedHustles.length > 0;

  return (
    <div className="max-w-4xl mx-auto">
        {!isPremium && hasGenerated ? (
            <Alert className="text-center bg-muted/50 border-dashed">
                <Star className="h-5 w-5 mx-auto mb-2 text-primary" />
                <AlertTitle className="font-bold">You've used your free generation!</AlertTitle>
                <AlertDescription className="mt-2">
                    Upgrade to premium to generate unlimited hustle ideas and unlock your full marketing kit, hustle blueprint, and live tracker.
                </AlertDescription>
                <Button className="mt-4 active:scale-95 transition-transform" onClick={() => upgradeToPremium(false)}>
                    <Star className="mr-2 h-4 w-4"/>
                    Upgrade Now
                </Button>
            </Alert>
        ) : (
             <form action={dispatch} className="space-y-6">
                <input type="hidden" name="isPremium" value={String(isPremium)} />
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="age">How old are you?</Label>
                        <div className="relative">
                            <Input id="age" name="age" placeholder="e.g., 17" value={age} onChange={(e) => setAge(e.target.value)} />
                            <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                        {state?.errors?.age && (
                            <p className="text-sm font-medium text-destructive">{state.errors.age[0]}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="timeCommitment">Time you can spend</Label>
                        <div className="relative">
                            <Select name="timeCommitment" value={timeCommitment} onValueChange={setTimeCommitment}>
                                <SelectTrigger id="timeCommitment">
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
                <Label htmlFor="skillsAndInterests">Your Skills & Interests</Label>
                <Textarea
                    id="skillsAndInterests"
                    name="skillsAndInterests"
                    placeholder="e.g., I'm a graphic designer who loves vintage cars, hiking, and baking sourdough bread..."
                    rows={5}
                    className="bg-background/80 focus:bg-background"
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
        <Alert variant="destructive" className="mt-6">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      {generatedHustles.length > 0 && (
         <div className="mt-12">
            <h2 className="text-3xl font-bold text-center mb-2">Your AI-Generated Hustles</h2>
            <p className="text-center text-muted-foreground mb-8">Here are three ideas tailored for you. Click on any card to explore more.</p>
            <div className="grid md:grid-cols-3 gap-6">
              {generatedHustles.map((hustle) => (
                <HustleCard key={hustle.name} hustle={hustle} />
              ))}
            </div>
         </div>
      )}

      {generatedHustles.length === 0 && !state?.message && !(!isPremium && hasGenerated) && (
        <div className="mt-12 text-center">
          <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Your future side hustle awaits.</p>
        </div>
      )}
    </div>
  );
}
