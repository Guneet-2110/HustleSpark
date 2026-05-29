"use client";

import { useHustleScore, getTier, HUSTLE_TIERS } from '@/hooks/use-hustle-score';
import { useAuth } from '@/hooks/use-auth';
import { useUser } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, TrendingUp, Star, CheckSquare, Calendar, ShieldCheck, Zap } from 'lucide-react';

export function HustleScoreCard() {
    const { savedHustles, isPremium } = useAuth();
    const { user } = useUser();
    const { score, breakdown, tier, isLoading } = useHustleScore(user?.uid, savedHustles);

    if (!isPremium) return null;

    if (isLoading) {
        return (
            <Card className="rounded-[2.5rem] border-primary/20 overflow-hidden">
                <CardContent className="p-8 flex items-center justify-center">
                    <Loader2 className="animate-spin h-8 w-8 text-primary" />
                </CardContent>
            </Card>
        );
    }

    const nextTierIndex = HUSTLE_TIERS.findIndex(t => t.label === tier.label) + 1;
    const nextTier = HUSTLE_TIERS[nextTierIndex];
    const progressToNext = nextTier
        ? Math.round(((score - tier.min) / (nextTier.min - tier.min)) * 100)
        : 100;

    return (
        <Card className="rounded-[2.5rem] border-primary/20 overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-br from-primary to-accent p-8 text-primary-foreground relative overflow-hidden">
                <div className="absolute -right-8 -top-8 opacity-10">
                    <Zap className="h-40 w-40" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-1">Your Hustle Score</p>
                <div className="flex items-end gap-3">
                    <span className="text-7xl font-black tracking-tighter">{score}</span>
                    <span className="text-2xl opacity-60 pb-2">/1000</span>
                </div>
                <div className="flex items-center gap-2 mt-3">
                    <span className="text-2xl">{tier.badge}</span>
                    <span className="font-black text-lg">{tier.label}</span>
                </div>
                {nextTier && (
                    <div className="mt-4 space-y-1">
                        <div className="flex justify-between text-[10px] font-bold opacity-70">
                            <span>{tier.label}</span>
                            <span>{nextTier.badge} {nextTier.label} at {nextTier.min}</span>
                        </div>
                        <Progress value={progressToNext} className="h-2 bg-white/20" />
                        <p className="text-[10px] opacity-60">{nextTier.min - score} points to next tier</p>
                    </div>
                )}
                {!nextTier && (
                    <p className="mt-3 text-[10px] font-black uppercase tracking-widest opacity-80">🏆 Maximum tier reached!</p>
                )}
            </div>

            {/* Breakdown */}
            <CardContent className="p-6 space-y-4">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Score Breakdown</p>
                <div className="space-y-3">
                    {[
                        { label: 'Sales Completed', value: breakdown.sales, max: 300, icon: TrendingUp, color: 'text-green-500' },
                        { label: 'Review Rating', value: breakdown.reviews, max: 200, icon: Star, color: 'text-yellow-500' },
                        { label: 'Roadmap Progress', value: breakdown.roadmap, max: 150, icon: CheckSquare, color: 'text-blue-500' },
                        { label: 'Days Active', value: breakdown.daysActive, max: 150, icon: Calendar, color: 'text-purple-500' },
                        { label: 'Dispute Penalty', value: breakdown.disputes, max: 0, icon: ShieldCheck, color: 'text-red-500' },
                    ].map((item) => (
                        <div key={item.label} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
                                    <span className="font-bold text-muted-foreground">{item.label}</span>
                                </div>
                                <span className={`font-black ${item.value < 0 ? 'text-red-500' : 'text-foreground'}`}>
                                    {item.value < 0 ? item.value : `+${item.value}`}
                                </span>
                            </div>
                            {item.max > 0 && (
                                <Progress value={(item.value / item.max) * 100} className="h-1.5" />
                            )}
                        </div>
                    ))}
                </div>

                {/* Tiers */}
                <div className="pt-4 border-t space-y-2">
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">All Tiers</p>
                    <div className="grid grid-cols-2 gap-2">
                        {HUSTLE_TIERS.map((t) => (
                            <div key={t.label} className={`p-3 rounded-2xl border text-center transition-all ${score >= t.min ? 'bg-primary/5 border-primary/20' : 'opacity-30'}`}>
                                <p className="text-lg">{t.badge}</p>
                                <p className="text-[10px] font-black">{t.label}</p>
                                <p className="text-[9px] text-muted-foreground">{t.min}+ pts</p>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}