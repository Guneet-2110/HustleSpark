"use client";

import { useState, useTransition, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { generateSocialCalendarAction } from '@/lib/actions';
import { Loader2, Instagram, Twitter, Calendar, Check } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface SocialCalendarModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    hustleName: string;
    hustleDescription: string;
    onResult?: (result: any) => void;
    savedResult?: any;
}

const PLATFORMS = ['Instagram', 'TikTok', 'Twitter/X', 'Facebook'];
const POST_TYPE_COLORS: Record<string, string> = {
    'Promotional': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    'Educational': 'bg-green-500/10 text-green-600 border-green-500/20',
    'Behind the Scenes': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    'Engagement': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
};

export function SocialCalendarModal({ open, onOpenChange, hustleName, hustleDescription, onResult, savedResult }: SocialCalendarModalProps) {
    const { toast } = useToast();
    const [targetAudience, setTargetAudience] = useState('');
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['Instagram', 'TikTok']);
    const [result, setResult] = useState<any>(null);
    useEffect(() => { if (open && savedResult) setResult(savedResult); }, [open, savedResult]);
    const [checkedPosts, setCheckedPosts] = useState<number[]>([]);
    const [isGenerating, startGenerating] = useTransition();
    const [activeWeek, setActiveWeek] = useState(1);

    const togglePlatform = (p: string) => {
        setSelectedPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
    };

    const handleGenerate = () => {
        if (!targetAudience.trim() || selectedPlatforms.length === 0) {
            toast({ variant: 'destructive', title: 'Fill in all fields' });
            return;
        }
        startGenerating(async () => {
            const res = await generateSocialCalendarAction({ hustleName, hustleDescription, targetAudience, platforms: selectedPlatforms });
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
        setTimeout(() => { setResult(null); setTargetAudience(''); setCheckedPosts([]); setActiveWeek(1); }, 300);
    };

    const weekPosts = result?.posts?.filter((p: any) => {
        const week = Math.ceil(p.day / 7);
        return week === activeWeek;
    }) || [];

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-2xl rounded-[2.5rem]">
                <DialogHeader>
                    <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
                        <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <DialogTitle className="text-2xl font-black text-center">30-Day Social Media Calendar</DialogTitle>
                    <DialogDescription className="text-center">AI-generated content plan tailored to your hustle.</DialogDescription>
                </DialogHeader>

                {!result ? (
                    <div className="space-y-5 py-2">
                        <div className="space-y-2">
                            <Label className="font-bold">Target Audience</Label>
                            <Input className="h-12 rounded-xl" placeholder="e.g. Teen entrepreneurs, local parents, small businesses..." value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bold">Platforms</Label>
                            <div className="flex flex-wrap gap-2">
                                {PLATFORMS.map(p => (
                                    <button key={p} onClick={() => togglePlatform(p)}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${selectedPlatforms.includes(p) ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary/50'}`}>
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <Button className="w-full h-12 rounded-2xl font-black" onClick={handleGenerate} disabled={isGenerating}>
                            {isGenerating ? <><Loader2 className="animate-spin mr-2 h-4 w-4" />Generating 30 posts...</> : '📅 Generate Calendar'}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Strategy tip */}
                        <div className="bg-primary/5 p-3 rounded-2xl border border-primary/10">
                            <p className="text-xs font-black text-primary mb-1">📊 Strategy</p>
                            <p className="text-xs text-muted-foreground">{result.strategy}</p>
                        </div>

                        {/* Week selector */}
                        <div className="flex gap-2">
                            {[1, 2, 3, 4].map(w => (
                                <button key={w} onClick={() => setActiveWeek(w)}
                                    className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${activeWeek === w ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}>
                                    Week {w}
                                </button>
                            ))}
                        </div>

                        {/* Posts */}
                        <ScrollArea className="h-64">
                            <div className="space-y-3 pr-2">
                                {weekPosts.map((post: any) => (
                                    <div key={post.day} className={`p-4 rounded-2xl border transition-all ${checkedPosts.includes(post.day) ? 'opacity-50 bg-muted/20' : 'bg-background'}`}>
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black bg-muted px-2 py-0.5 rounded-full">Day {post.day}</span>
                                                <span className="text-[10px] font-bold text-primary">{post.platform}</span>
                                                <Badge variant="outline" className={`text-[9px] ${POST_TYPE_COLORS[post.type] || ''}`}>{post.type}</Badge>
                                            </div>
                                            <button onClick={() => setCheckedPosts(prev => prev.includes(post.day) ? prev.filter(d => d !== post.day) : [...prev, post.day])}
                                                className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${checkedPosts.includes(post.day) ? 'bg-green-500 border-green-500' : 'border-muted-foreground'}`}>
                                                {checkedPosts.includes(post.day) && <Check className="h-3 w-3 text-white" />}
                                            </button>
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{post.caption}</p>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {post.hashtags.map((tag: string) => (
                                                <span key={tag} className="text-[10px] text-primary font-bold">#{tag}</span>
                                            ))}
                                        </div>
                                        <p className="text-[10px] text-muted-foreground mt-1">⏰ Best time: {post.bestTime}</p>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{checkedPosts.length}/30 posts completed</span>
                            <span>💡 {result.topTip}</span>
                        </div>

                        <Button className="w-full rounded-2xl font-black" onClick={handleClose}>Done</Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}