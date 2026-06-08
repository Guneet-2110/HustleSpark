"use client";

import { useState, useTransition, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generatePitchDeckAction } from '@/lib/actions';
import { Loader2, Presentation, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PitchDeckModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    hustleName: string;
    hustleDescription: string;
    onResult?: (result: any) => void;
    savedResult?: any;
}

const SLIDE_COLORS = [
    'from-blue-500 to-primary',
    'from-primary to-purple-500',
    'from-purple-500 to-pink-500',
    'from-pink-500 to-orange-500',
    'from-orange-500 to-yellow-500',
];

export function PitchDeckModal({ open, onOpenChange, hustleName, hustleDescription, onResult, savedResult }: PitchDeckModalProps) {
    const { toast } = useToast();
    const [form, setForm] = useState({ targetMarket: '', revenueModel: '', uniqueAdvantage: '' });
    const [result, setResult] = useState<any>(null);
    useEffect(() => { if (open && savedResult) setResult(savedResult); }, [open, savedResult]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isGenerating, startGenerating] = useTransition();

    const handleGenerate = () => {
        if (!form.targetMarket || !form.revenueModel || !form.uniqueAdvantage) {
            toast({ variant: 'destructive', title: 'All fields required' });
            return;
        }
        startGenerating(async () => {
            const res = await generatePitchDeckAction({ hustleName, hustleDescription, ...form });
            if (res.message === 'success' && res.data) {
                setResult(res.data);
                if (onResult) onResult(res.data);
            } else {
                toast({ variant: 'destructive', title: 'Failed', description: res.message });
            }
        });
    };

    const handleClose = () => {
        onOpenChange(false);
        setTimeout(() => { setResult(null); setForm({ targetMarket: '', revenueModel: '', uniqueAdvantage: '' }); setCurrentSlide(0); }, 300);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-xl rounded-[2.5rem]">
                <DialogHeader>
                    <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
                        <Presentation className="h-6 w-6 text-primary" />
                    </div>
                    <DialogTitle className="text-2xl font-black text-center">Pitch Deck Generator</DialogTitle>
                    <DialogDescription className="text-center">Generate a 5-slide investor-ready pitch for your hustle.</DialogDescription>
                </DialogHeader>

                {!result ? (
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label className="font-bold">Target Market</Label>
                            <Input className="h-12 rounded-xl" placeholder="e.g. Teen athletes aged 13-18 in suburban areas..." value={form.targetMarket} onChange={(e) => setForm({...form, targetMarket: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bold">Revenue Model</Label>
                            <Input className="h-12 rounded-xl" placeholder="e.g. $50 per logo design, $150/month retainer..." value={form.revenueModel} onChange={(e) => setForm({...form, revenueModel: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bold">Your Unique Advantage</Label>
                            <Textarea className="rounded-xl min-h-[80px]" placeholder="e.g. I'm a teen myself so I understand what other teens want better than adult designers..." value={form.uniqueAdvantage} onChange={(e) => setForm({...form, uniqueAdvantage: e.target.value})} />
                        </div>
                        <Button className="w-full h-12 rounded-2xl font-black" onClick={handleGenerate} disabled={isGenerating}>
                            {isGenerating ? <><Loader2 className="animate-spin mr-2 h-4 w-4" />Building your deck...</> : '🎯 Generate Pitch Deck'}
                        </Button>
                    </div>
                ) : (
                    <ScrollArea className="max-h-[60vh]">
                    <div className="space-y-4 pr-2">
                        {/* Elevator pitch */}
                        <div className="bg-primary/5 p-3 rounded-2xl border border-primary/10 text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">⚡ 30-Second Elevator Pitch</p>
                            <p className="text-sm font-medium italic">"{result.elevatorPitch}"</p>
                        </div>

                        {/* Slide viewer */}
                        <div className={`relative rounded-[2rem] overflow-hidden bg-gradient-to-br ${SLIDE_COLORS[currentSlide]} p-8 text-white min-h-[200px]`}>
                            <div className="space-y-3">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Slide {currentSlide + 1} of 5</p>
                                <p className="text-xs font-black uppercase tracking-widest opacity-70">{result.slides[currentSlide].title}</p>
                                <p className="text-2xl font-black leading-tight">{result.slides[currentSlide].headline}</p>
                                <ul className="space-y-2 mt-4">
                                    {result.slides[currentSlide].bullets.map((b: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2 text-sm opacity-90">
                                            <span className="shrink-0 mt-0.5">→</span>
                                            {b}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Speaker note */}
                        <div className="bg-muted/30 p-3 rounded-2xl border">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">🎤 Speaker Note</p>
                            <p className="text-xs text-muted-foreground">{result.slides[currentSlide].speakerNote}</p>
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center gap-3">
                            <Button variant="outline" size="icon" className="rounded-xl" onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))} disabled={currentSlide === 0}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="flex gap-1.5 flex-1 justify-center">
                                {result.slides.map((_: any, i: number) => (
                                    <button key={i} onClick={() => setCurrentSlide(i)}
                                        className={`h-2 rounded-full transition-all ${i === currentSlide ? 'w-6 bg-primary' : 'w-2 bg-muted'}`} />
                                ))}
                            </div>
                            <Button variant="outline" size="icon" className="rounded-xl" onClick={() => setCurrentSlide(Math.min(4, currentSlide + 1))} disabled={currentSlide === 4}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Tagline */}
                        <div className="text-center">
                            <p className="text-xs text-muted-foreground">Tagline: <span className="font-black text-primary">"{result.tagline}"</span></p>
                        </div>

                        <Button className="w-full rounded-2xl font-black" onClick={handleClose}>Done</Button>
                    </div>
                    </ScrollArea>
                )}
            </DialogContent>
        </Dialog>
    );
}