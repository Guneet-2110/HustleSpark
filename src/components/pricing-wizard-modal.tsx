"use client";

import { ScrollArea } from '@/components/ui/scroll-area';
import { useState, useTransition, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { generatePricingWizardAction } from '@/lib/actions';
import { Loader2, ChevronRight, ChevronLeft, CircleDollarSign, Check } from 'lucide-react';

interface PricingWizardModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    hustleName: string;
    hustleDescription: string;
    onResult: (result: any) => void;
    savedResult?: any;
}

const STEPS = [
    { title: 'Time Per Delivery', description: 'How long does it take to complete one order?', field: 'timePerDelivery' },
    { title: 'Target Customer', description: 'Who are you selling to?', field: 'targetCustomer' },
    { title: 'Costs & Materials', description: 'What do you spend to deliver this service?', field: 'costs' },
    { title: 'Experience Level', description: 'How experienced are you?', field: 'experience' },
];

export function PricingWizardModal({ open, onOpenChange, hustleName, hustleDescription, onResult, savedResult }: PricingWizardModalProps) {
    const { toast } = useToast();
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({ timePerDelivery: '', targetCustomer: '', costs: '', experience: '' });
    const [result, setResult] = useState<any>(null);
    useEffect(() => { if (open && savedResult) setResult(savedResult); }, [open, savedResult]);
    const [isGenerating, startGenerating] = useTransition();
    const handleGenerate = () => {
        startGenerating(async () => {
            const res = await generatePricingWizardAction({ hustleName, hustleDescription, ...answers });
            if (res.message === 'success' && res.data) {
                setResult(res.data);
                onResult(res.data);
            } else {
                toast({ variant: 'destructive', title: 'Failed', description: res.message });
            }
        });
    };

    const handleClose = () => {
        onOpenChange(false);
        setTimeout(() => { setStep(0); setResult(null); setAnswers({ timePerDelivery: '', targetCustomer: '', costs: '', experience: '' }); }, 300);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-lg rounded-[2.5rem]">
                <DialogHeader>
                    <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
                        <CircleDollarSign className="h-6 w-6 text-primary" />
                    </div>
                    <DialogTitle className="text-2xl font-black text-center">Pricing Strategy Wizard</DialogTitle>
                    <DialogDescription className="text-center">Answer 4 quick questions to get your perfect pricing tiers.</DialogDescription>
                </DialogHeader>

                {!result ? (
                    <div className="space-y-6 py-2">
                        {/* Progress */}
                        <div className="flex gap-1.5">
                            {STEPS.map((_, i) => (
                                <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= step ? 'bg-primary' : 'bg-muted'}`} />
                            ))}
                        </div>

                        {/* Current step */}
                        <div className="space-y-3">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Step {step + 1} of {STEPS.length}</p>
                                <p className="font-black text-lg">{STEPS[step].title}</p>
                                <p className="text-sm text-muted-foreground">{STEPS[step].description}</p>
                            </div>

                            {step === 0 && (
                                <Select value={answers.timePerDelivery} onValueChange={(v) => setAnswers({...answers, timePerDelivery: v})}>
                                    <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select time..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Less than 1 hour">Less than 1 hour</SelectItem>
                                        <SelectItem value="1-2 hours">1-2 hours</SelectItem>
                                        <SelectItem value="Half a day">Half a day</SelectItem>
                                        <SelectItem value="Full day">Full day</SelectItem>
                                        <SelectItem value="2-3 days">2-3 days</SelectItem>
                                        <SelectItem value="1 week">1 week</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                            {step === 1 && (
                                <Input className="h-12 rounded-xl" placeholder="e.g. Local businesses, teens, parents..." value={answers.targetCustomer} onChange={(e) => setAnswers({...answers, targetCustomer: e.target.value})} />
                            )}
                            {step === 2 && (
                                <Input className="h-12 rounded-xl" placeholder="e.g. No costs / $5 in materials / Software subscription..." value={answers.costs} onChange={(e) => setAnswers({...answers, costs: e.target.value})} />
                            )}
                            {step === 3 && (
                                <Select value={answers.experience} onValueChange={(v) => setAnswers({...answers, experience: v})}>
                                    <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select level..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Just starting out">Just starting out</SelectItem>
                                        <SelectItem value="Some experience">Some experience (3-6 months)</SelectItem>
                                        <SelectItem value="Experienced">Experienced (6-12 months)</SelectItem>
                                        <SelectItem value="Very experienced">Very experienced (1+ year)</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        <div className="flex gap-3">
                            {step > 0 && (
                                <Button variant="outline" className="rounded-2xl" onClick={() => setStep(step - 1)}>
                                    <ChevronLeft className="h-4 w-4 mr-1" /> Back
                                </Button>
                            )}
                            {step < STEPS.length - 1 ? (
                                <Button className="rounded-2xl flex-1 font-bold" onClick={() => setStep(step + 1)}
                                    disabled={!Object.values(answers)[step]}>
                                    Next <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            ) : (
                                <Button className="rounded-2xl flex-1 font-black" onClick={handleGenerate}
                                    disabled={isGenerating || !answers.experience}>
                                    {isGenerating ? <><Loader2 className="animate-spin mr-2 h-4 w-4" />Calculating...</> : '✨ Generate Pricing'}
                                </Button>
                            )}
                        </div>
                    </div>
                ) : (
                    <ScrollArea className="max-h-[60vh]">
                    <div className="space-y-4 py-2 pr-2">
                        <div className="grid grid-cols-3 gap-3">
                            {['basic', 'standard', 'premium'].map((tier) => (
                                <div key={tier} className={`p-4 rounded-2xl border text-center space-y-2 ${tier === 'standard' ? 'border-primary bg-primary/5 shadow-lg' : 'border-border'}`}>
                                    {tier === 'standard' && <p className="text-[9px] font-black uppercase tracking-widest text-primary">Recommended</p>}
                                    <p className="font-black capitalize text-sm">{result[tier].label}</p>
                                    <p className="text-2xl font-black text-primary">${result[tier].price}</p>
                                    <p className="text-[10px] text-muted-foreground">{result[tier].deliveryTime}</p>
                                    <ul className="text-left space-y-1 mt-2">
                                        {result[tier].includes.map((item: string, i: number) => (
                                            <li key={i} className="text-[10px] flex items-start gap-1">
                                                <Check className="h-3 w-3 text-green-500 shrink-0 mt-0.5" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                        <div className="bg-muted/30 p-4 rounded-2xl space-y-2">
                            <p className="text-xs font-black text-primary">💡 Positioning Tip</p>
                            <p className="text-xs text-muted-foreground">{result.positioningTip}</p>
                        </div>
                        <Button className="w-full rounded-2xl font-black" onClick={handleClose}>Save & Close</Button>
                    </div>
                    </ScrollArea>
                )}
            </DialogContent>
        </Dialog>
    );
}