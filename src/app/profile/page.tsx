
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useAuth as useFirebaseInstance, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Star, List, ArrowRight, LayoutDashboard, Clock, Trash2, MessageSquare, Briefcase } from "lucide-react";
import { slugify } from "@/lib/utils";
import { HustleGenerator } from "@/components/hustle-generator";
import type { HustleIdea } from "@/ai/flows/generate-hustle-ideas";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { collection, query, where, orderBy } from 'firebase/firestore';

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
  const { user: localUser, isLoggedIn, isPremium, savedHustles, upgradeToPremium, setPaymentModalOpen, unsaveHustle } = useAuth();
  const { user: firebaseUser } = useFirebaseInstance();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(localUser?.premiumExpiresAt));

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, router]);

  useEffect(() => {
    const timer = setInterval(() => {
        if (isPremium && localUser?.premiumExpiresAt) {
            setTimeLeft(calculateTimeLeft(localUser.premiumExpiresAt));
        }
    }, 1000);
    return () => clearInterval(timer);
  }, [isPremium, localUser?.premiumExpiresAt]);

  // Fetch active chats for this user
  const chatsQuery = useMemoFirebase(() => {
    if (!firestore || !firebaseUser) return null;
    return query(
        collection(firestore, 'chats'),
        where('updatedAt', '!=', null),
        orderBy('updatedAt', 'desc')
    );
  }, [firestore, firebaseUser]);

  const { data: rawChats, isLoading: isChatsLoading } = useCollection(chatsQuery);

  const filteredChats = rawChats?.filter(c => c.buyerId === firebaseUser?.uid || c.sellerId === firebaseUser?.uid) || [];

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

  if (!isLoggedIn || !localUser) {
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
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, {localUser.email}</h1>
            {isPremium && timeLeft.total > 0 ? (
                 <div className="mt-4 inline-flex items-center gap-x-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-2 text-sm font-medium text-foreground">
                    <Clock className="h-5 w-5 text-primary animate-pulse" />
                    <span>Premium access: <span className="font-mono font-bold text-primary">{timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s</span> remaining</span>
                </div>
            ) : (
                <p className="text-muted-foreground mt-2">Scale your ideas with AI precision.</p>
            )}
        </div>
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-8">
            <Card className="bg-gradient-to-br from-primary/10 via-transparent to-accent/5 shadow-2xl border-primary/20 rounded-[2.5rem] overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-2xl"><LayoutDashboard className="h-6 w-6 text-primary"/>Side Hustle Lab</CardTitle>
                    <CardDescription>Tailor your next venture with high-fidelity strategy.</CardDescription>
                </CardHeader>
                <CardContent>
                    <HustleGenerator />
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-8">
                {savedHustles.length > 0 && (
                    <Card className="shadow-xl rounded-[2rem] border-primary/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary"/>Your Ventures</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                            {savedHustles.map((hustle) => {
                                 const slug = slugify(hustle.name);
                                return (
                                    <div key={hustle.name} className="relative group">
                                        <Link href={`/hustle/${slug}`} onClick={() => handleHustleClick(hustle)} className="block h-full">
                                            <div className="border p-4 rounded-2xl hover:bg-muted/50 transition-all flex justify-between items-center active:scale-[0.98] h-full shadow-sm hover:shadow-md border-primary/5 hover:border-primary/20">
                                                <div className="pr-8">
                                                    <p className="font-bold group-hover:text-primary transition-colors text-sm">{hustle.name}</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">Strategic Idea</p>
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

                <Card className="shadow-xl rounded-[2rem] border-accent/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-accent"/>Active Conversations</CardTitle>
                        <CardDescription>Buyer & Seller handshake zone.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isChatsLoading ? (
                            <div className="space-y-3">
                                <Skeleton className="h-16 w-full rounded-2xl" />
                                <Skeleton className="h-16 w-full rounded-2xl" />
                            </div>
                        ) : filteredChats.length > 0 ? (
                            <div className="space-y-3">
                                {filteredChats.map(chat => (
                                    <Link key={chat.id} href={`/chats/${chat.id}`} className="block">
                                        <div className="border p-4 rounded-2xl hover:bg-muted/50 transition-all flex justify-between items-center border-accent/5 hover:border-accent/20 group">
                                            <div>
                                                <p className="font-bold text-sm group-hover:text-accent transition-colors">{chat.hustleName}</p>
                                                <p className="text-[10px] text-muted-foreground line-clamp-1 mt-1 italic">{chat.lastMessage || 'No messages yet'}</p>
                                            </div>
                                            <Badge variant="outline" className="text-[9px] uppercase font-bold tracking-widest bg-accent/5">Chat Live</Badge>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-muted/20 rounded-2xl border-2 border-dashed border-accent/10">
                                <MessageSquare className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">No active chats</p>
                                <p className="text-[10px] text-muted-foreground mt-1">Acquire a venture to start chatting.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
            <Card className="border-primary/20 shadow-xl overflow-hidden rounded-[2.5rem]">
                <CardHeader className="bg-primary/5 border-b">
                    <CardTitle className="text-lg">Elite Subscription</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="flex items-center justify-between bg-muted/50 p-4 rounded-2xl border">
                        <span className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Tier</span>
                        <Badge variant={isPremium ? "default" : "secondary"} className="shadow-sm font-bold">
                            {isPremium ? 'PREMIUM ACTIVE' : 'FREE TIER'}
                        </Badge>
                    </div>
                    <Button className="w-full h-14 rounded-2xl shadow-xl active:scale-95 transition-all font-black text-lg group" onClick={handleUpgradeClick}>
                        <Star className="mr-2 h-5 w-5 transition-transform group-hover:rotate-45" />
                        {isPremium ? 'Extend Access' : 'Upgrade to Pro'}
                    </Button>
                </CardContent>
                <CardFooter className="flex flex-col gap-3 border-t bg-muted/10 pt-6 pb-8 px-6">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black w-full text-center opacity-60">Developer Sandbox</p>
                    <div className="grid grid-cols-2 gap-3 w-full">
                        <Button variant="outline" size="sm" className="text-[10px] h-10 rounded-xl active:scale-95 border-primary/20 hover:bg-primary/5 font-bold" onClick={() => handleDevTrial(20)}>
                            20-Day Trial
                        </Button>
                        <Button variant="outline" size="sm" className="text-[10px] h-10 rounded-xl active:scale-95 border-primary/20 hover:bg-primary/5 font-bold" onClick={() => handleDevTrial(0.0007)}>
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
        <Suspense fallback={<div className="container py-20 text-center"><Skeleton className="h-10 w-48 mx-auto"/></div>}>
            <ProfilePageContent />
        </Suspense>
    )
}
