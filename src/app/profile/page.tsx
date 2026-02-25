"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Star, List, ArrowRight, LayoutDashboard, Clock, Trash2 } from "lucide-react";
import { slugify } from "@/lib/utils";
import { HustleGenerator } from "@/components/hustle-generator";
import type { HustleIdea } from "@/ai/flows/generate-hustle-ideas";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const calculateTimeLeft = (expiryDate: string | null | undefined) => {
    if (!expiryDate) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    const difference = +new Date(expiryDate) - +new Date();
    let timeLeft = {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: difference,
    };

    if (difference > 0) {
        timeLeft = {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
            total: difference,
        };
    }

    return timeLeft;
};

function ProfilePageContent() {
  const { user, isLoggedIn, isPremium, savedHustles, upgradeToPremium, setPaymentModalOpen, unsaveHustle } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(user?.premiumExpiresAt));

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, router]);

  useEffect(() => {
    const timer = setInterval(() => {
        if (isPremium && user?.premiumExpiresAt) {
            setTimeLeft(calculateTimeLeft(user.premiumExpiresAt));
        }
    }, 1000);
    return () => clearInterval(timer);
  }, [isPremium, user?.premiumExpiresAt]);

  const handleHustleClick = (hustle: HustleIdea) => {
    if (typeof window !== 'undefined') {
        sessionStorage.setItem('currentHustle', JSON.stringify(hustle));
    }
  }

  const handleDeleteHustle = (e: React.MouseEvent, hustleName: string) => {
    e.preventDefault();
    e.stopPropagation();
    unsaveHustle(hustleName);
    toast({
        title: "Venture Removed",
        description: `${hustleName} has been deleted from your dashboard.`,
    });
  }

  const handleDevTrial = (days: number) => {
    upgradeToPremium(days);
  };

  const handleUpgradeClick = () => {
    setPaymentModalOpen(true);
  }

  if (!isLoggedIn || !user) {
    return (
         <div className="container py-12">
            <div className="mb-8">
                <Skeleton className="h-9 w-1/2" />
                <Skeleton className="h-5 w-1/3 mt-2" />
            </div>
        </div>
    );
  }

  return (
    <div className="container py-12">
        <div className="mb-8">
            <h1 className="text-3xl font-bold">Welcome back, {user.email}</h1>
            {isPremium && timeLeft.total > 0 ? (
                 <div className="mt-4 inline-flex items-center gap-x-2 rounded-lg bg-primary/10 border border-primary/20 px-3 py-2 text-sm font-medium text-foreground">
                    <Clock className="h-5 w-5 text-primary animate-pulse" />
                    <span>Premium access: <span className="font-mono font-bold text-primary">{timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s</span> remaining</span>
                </div>
            ) : (
                <p className="text-muted-foreground">Ready to launch your next big thing?</p>
            )}
        </div>
      <div className="grid gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
            <Card className="bg-gradient-to-br from-primary/10 via-transparent to-accent/5 shadow-lg border-primary/10">
                <CardHeader>
                    <CardTitle className="flex items-center"><LayoutDashboard className="mr-2 h-5 w-5"/>Side Hustle Lab</CardTitle>
                    <CardDescription>Tailor your next venture with AI precision.</CardDescription>
                </CardHeader>
                <CardContent>
                    <HustleGenerator />
                </CardContent>
            </Card>

            {savedHustles.length > 0 && (
                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center"><List className="mr-2 h-5 w-5"/>Your Saved Ventures</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2">
                        {savedHustles.map((hustle) => {
                             const slug = slugify(hustle.name);
                            return (
                                <div key={hustle.name} className="relative group">
                                    <Link href={`/hustle/${slug}`} onClick={() => handleHustleClick(hustle)} className="block h-full">
                                        <div className="border p-4 rounded-xl hover:bg-muted/50 transition-all flex justify-between items-center active:scale-[0.98] h-full shadow-sm hover:shadow-md border-primary/5 hover:border-primary/20">
                                            <div className="pr-8">
                                                <p className="font-bold group-hover:text-primary transition-colors text-sm">{hustle.name}</p>
                                                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{hustle.description}</p>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform ml-2 shrink-0" />
                                        </div>
                                    </Link>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity active:scale-90"
                                        onClick={(e) => handleDeleteHustle(e, hustle.name)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            )
                        })}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
        <div className="lg:col-span-1 space-y-8">
            <Card className="border-primary/20 shadow-xl overflow-hidden">
                <CardHeader className="bg-primary/5 border-b">
                    <CardTitle className="text-lg">Subscription Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg border">
                        <span className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Account Tier</span>
                        <Badge variant={isPremium ? "default" : "secondary"} className="shadow-sm">
                            {isPremium ? 'Premium Active' : 'Free Tier'}
                        </Badge>
                    </div>
                    <Button className="w-full h-12 shadow-lg active:scale-95 transition-transform touch-manipulation group" onClick={handleUpgradeClick}>
                        <Star className="mr-2 h-4 w-4 transition-transform group-hover:rotate-45" />
                        {isPremium ? 'Extend Subscription' : 'Upgrade to Premium'}
                    </Button>
                </CardContent>
                <CardFooter className="flex flex-col gap-3 border-t bg-muted/10 pt-4 pb-6 px-6">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold w-full text-center">Developer Sandbox</p>
                    <div className="grid grid-cols-2 gap-3 w-full">
                        <Button variant="outline" size="sm" className="text-[10px] h-9 active:scale-95 border-primary/10 hover:bg-primary/5" onClick={() => handleDevTrial(20)}>
                            20-Day Trial
                        </Button>
                        <Button variant="outline" size="sm" className="text-[10px] h-9 active:scale-95 border-primary/10 hover:bg-primary/5" onClick={() => handleDevTrial(0.0007)}>
                            1 Min Trial
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ProfilePageContent />
        </Suspense>
    )
}
