
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useAuth as useFirebaseInstance, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Star, List, ArrowRight, LayoutDashboard, Clock, Trash2, MessageSquare, Briefcase, Package, ShieldCheck, CheckCircle2, ShieldAlert, Store, Loader2 } from "lucide-react";
import { slugify } from "@/lib/utils";
import { HustleGenerator } from "@/components/hustle-generator";
import type { HustleIdea } from "@/ai/flows/generate-hustle-ideas";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { collection, query, where, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { notifyAdminOfCompletionAction } from "@/lib/actions";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

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
  
  const [timeLeft, setTimeLeft] = useState<{days:number, hours:number, minutes:number, seconds:number, total:number} | null>(null);
  const [isClient, setIsClient] = useState(false);

  const isDeveloper = localUser?.email === 'guneet.ar2010@gmail.com' || localUser?.email === 'tester@gmail.com';

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isLoggedIn && isClient) {
      router.push('/login');
    }
  }, [isLoggedIn, router, isClient]);

  useEffect(() => {
    if (isPremium && localUser?.premiumExpiresAt) {
        setTimeLeft(calculateTimeLeft(localUser.premiumExpiresAt));
    }

    const timer = setInterval(() => {
        if (isPremium && localUser?.premiumExpiresAt) {
            setTimeLeft(calculateTimeLeft(localUser.premiumExpiresAt));
        }
    }, 1000);
    return () => clearInterval(timer);
  }, [isPremium, localUser?.premiumExpiresAt]);

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

  const myListingsQuery = useMemoFirebase(() => {
      if (!firestore || !firebaseUser) return null;
      return query(
          collection(firestore, 'marketplace_listings'),
          where('userId', '==', firebaseUser.uid),
          orderBy('createdAt', 'desc')
      );
  }, [firestore, firebaseUser]);

  const { data: myListings, isLoading: isMyListingsLoading } = useCollection(myListingsQuery);

  const salesQuery = useMemoFirebase(() => {
      if (!firestore || !firebaseUser) return null;
      return query(collection(firestore, 'transactions'), where('sellerId', '==', firebaseUser.uid), orderBy('createdAt', 'desc'));
  }, [firestore, firebaseUser]);

  const purchasesQuery = useMemoFirebase(() => {
      if (!firestore || !firebaseUser) return null;
      return query(collection(firestore, 'transactions'), where('buyerId', '==', firebaseUser.uid), orderBy('createdAt', 'desc'));
  }, [firestore, firebaseUser]);

  const { data: sales, isLoading: isSalesLoading } = useCollection(salesQuery);
  const { data: purchases, isLoading: isPurchasesLoading } = useCollection(purchasesQuery);

  const handleMarkAsDelivered = async (transaction: any) => {
      if (!firestore) return;
      try {
          const transRef = doc(firestore, 'transactions', transaction.id);
          await updateDoc(transRef, { status: 'pending_confirmation' });
          toast({ title: "Venture Delivered", description: "The buyer has been notified to confirm receipt." });
      } catch (e) {
          toast({ variant: 'destructive', title: "Update Failed", description: "Could not mark as delivered." });
      }
  };

  const handleConfirmReceipt = async (transaction: any) => {
      if (!firestore) return;
      try {
          const transRef = doc(firestore, 'transactions', transaction.id);
          await updateDoc(transRef, { status: 'completed' });
          
          await notifyAdminOfCompletionAction({
              id: transaction.id,
              hustleName: transaction.hustleName,
              sellerEmail: transaction.sellerEmail,
              sellerAmount: transaction.sellerAmount,
              buyerEmail: transaction.buyerEmail,
          });

          toast({ title: "Receipt Confirmed!", description: "The creator has been notified and payout is being processed." });
      } catch (e) {
          toast({ variant: 'destructive', title: "Update Failed", description: "Could not confirm receipt." });
      }
  };

  const handleDeleteListing = async (listingId: string) => {
      if (!firestore) return;
      try {
          await deleteDoc(doc(firestore, 'marketplace_listings', listingId));
          toast({ title: "Listing Removed", description: "Your venture has been removed from the marketplace." });
      } catch (e) {
          toast({ variant: 'destructive', title: "Deletion Failed", description: "Could not remove listing." });
      }
  };

  const handleHustleClick = (hustle: HustleIdea) => {
    if (typeof window !== 'undefined') {
        sessionStorage.setItem('currentHustle', JSON.stringify(hustle));
    }
  }

  const handleDeleteHustle = (e: React.MouseEvent, hustleName: string) => {
    e.preventDefault();
    e.stopPropagation();
    unsaveHustle(hustleName);
    toast({ title: "Venture Removed", description: `${hustleName} has been deleted.` });
  }

  if (!isLoggedIn || !localUser || !isClient) {
    return <div className="container py-12"><Skeleton className="h-9 w-1/2" /><Skeleton className="h-5 w-1/3 mt-2" /></div>;
  }

  return (
    <div className="container py-12">
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
                <h1 className="text-4xl font-black tracking-tight">Venture Dashboard</h1>
                {isPremium && timeLeft && timeLeft.total > 0 ? (
                     <div className="mt-4 inline-flex items-center gap-x-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-2 text-sm font-medium">
                        <Clock className="h-5 w-5 text-primary animate-pulse" />
                        <span>Premium access: <span className="font-mono font-bold text-primary">{timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m</span></span>
                    </div>
                ) : (
                    <p className="text-muted-foreground mt-2 font-medium">Welcome back, {localUser.email}</p>
                )}
            </div>

            {isDeveloper && (
                <Button 
                    variant="outline" 
                    onClick={() => upgradeToPremium(365)}
                    className="border-primary/50 text-primary hover:bg-primary/5 rounded-2xl h-12 px-6 font-black"
                >
                    <ShieldAlert className="mr-2 h-5 w-5" />
                    Activate Free Premium
                </Button>
            )}
        </div>

      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-12">
            <Card className="shadow-xl rounded-[2.5rem] border-primary/20 overflow-hidden">
                <CardHeader className="bg-primary/5 border-b">
                    <CardTitle className="flex items-center gap-2"><Store className="h-6 w-6 text-primary"/> Your Marketplace Ventures</CardTitle>
                    <CardDescription>Manage ventures you have listed for sale.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    {isMyListingsLoading ? <Skeleton className="h-32 w-full" /> : myListings && myListings.length > 0 ? (
                        <div className="space-y-4">
                            {myListings.map((l) => (
                                <div key={l.id} className="p-5 border rounded-3xl bg-muted/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-black text-lg">{l.hustleName}</p>
                                            <Badge variant={l.status === 'approved' ? 'default' : 'secondary'} className="text-[10px] uppercase">
                                                {l.status.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{l.description}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" asChild className="rounded-xl">
                                            <Link href={`/marketplace/listing/${l.id}`}>View</Link>
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="rounded-xl text-destructive hover:bg-destructive/10">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="rounded-[2.5rem]">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will permanently delete your venture listing from the marketplace.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteListing(l.id)} className="rounded-xl bg-destructive">Delete Listing</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 border-2 border-dashed rounded-3xl opacity-60">
                            <p className="font-bold uppercase tracking-widest text-[10px]">No ventures listed yet</p>
                            <Button variant="link" className="mt-2" asChild>
                                <Link href="/marketplace">Explore Marketplace</Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="shadow-xl rounded-[2.5rem] border-primary/10 overflow-hidden">
                <CardHeader className="bg-primary/5 border-b">
                    <CardTitle className="flex items-center gap-2"><Package className="h-6 w-6 text-primary"/> Venture Sales (Creator)</CardTitle>
                    <CardDescription>Track delivery and confirmation status for your sold ventures.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    {isSalesLoading ? <Skeleton className="h-32 w-full" /> : sales && sales.length > 0 ? (
                        <div className="space-y-4">
                            {sales.map((t) => (
                                <div key={t.id} className="p-5 border rounded-3xl bg-muted/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <p className="font-black text-lg">{t.hustleName}</p>
                                        <div className="flex gap-2 mt-1">
                                            <Badge variant="outline" className="text-[10px] font-bold uppercase">{t.status.replace('_', ' ')}</Badge>
                                            <span className="text-xs font-bold text-primary">${t.sellerAmount} Due</span>
                                        </div>
                                    </div>
                                    {t.status === 'pending_delivery' && (
                                        <Button onClick={() => handleMarkAsDelivered(t)} className="rounded-2xl h-10 px-6 font-bold shadow-lg">
                                            Mark as Delivered
                                        </Button>
                                    )}
                                    {t.status === 'pending_confirmation' && (
                                        <p className="text-xs font-bold text-muted-foreground flex items-center gap-1 italic">
                                            <Clock className="h-3 w-3" /> Awaiting Buyer Confirmation
                                        </p>
                                    )}
                                    {t.status === 'completed' && (
                                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20 px-4 py-1.5 rounded-xl font-bold">
                                            <CheckCircle2 className="h-3 w-3 mr-1" /> Payout Processed
                                        </Badge>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 border-2 border-dashed rounded-3xl opacity-60">
                            <p className="font-bold uppercase tracking-widest text-[10px]">No ventures sold yet</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="shadow-xl rounded-[2.5rem] border-accent/10 overflow-hidden">
                <CardHeader className="bg-accent/5 border-b">
                    <CardTitle className="flex items-center gap-2 text-accent"><ShieldCheck className="h-6 w-6"/> Acquired Ventures (Buyer)</CardTitle>
                    <CardDescription>Confirm delivery to release funds to the creator.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    {isPurchasesLoading ? <Skeleton className="h-32 w-full" /> : purchases && purchases.length > 0 ? (
                        <div className="space-y-4">
                            {purchases.map((t) => (
                                <div key={t.id} className="p-5 border rounded-3xl bg-muted/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <p className="font-black text-lg">{t.hustleName}</p>
                                        <div className="flex gap-2 mt-1">
                                            <Badge variant="outline" className="text-[10px] font-bold uppercase border-accent/30 text-accent">{t.status.replace('_', ' ')}</Badge>
                                            <span className="text-xs font-bold text-muted-foreground italic">Paid ${t.amount}</span>
                                        </div>
                                    </div>
                                    {t.status === 'pending_delivery' && (
                                        <p className="text-xs font-bold text-muted-foreground flex items-center gap-1 italic">
                                            <Clock className="h-3 w-3" /> Creator preparing assets...
                                        </p>
                                    )}
                                    {t.status === 'pending_confirmation' && (
                                        <Button onClick={() => handleConfirmReceipt(t)} className="bg-accent hover:bg-accent/90 text-white rounded-2xl h-10 px-6 font-bold shadow-lg">
                                            Confirm Receipt
                                        </Button>
                                    )}
                                    {t.status === 'completed' && (
                                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20 px-4 py-1.5 rounded-xl font-bold">
                                            <CheckCircle2 className="h-3 w-3 mr-1" /> Acquisition Complete
                                        </Badge>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 border-2 border-dashed rounded-3xl opacity-60">
                            <p className="font-bold uppercase tracking-widest text-[10px]">No ventures acquired yet</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/10 via-transparent to-accent/5 shadow-2xl border-primary/20 rounded-[2.5rem] overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-2xl"><LayoutDashboard className="h-6 w-6 text-primary"/>Side Hustle Lab</CardTitle>
                    <CardDescription>Tailor your next venture with high-fidelity strategy.</CardDescription>
                </CardHeader>
                <CardContent><HustleGenerator /></CardContent>
            </Card>
        </div>

        <div className="lg:col-span-4 space-y-12">
            <Card className="shadow-xl rounded-[2rem] border-primary/10">
                <CardHeader><CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary"/>Your Saved Ventures</CardTitle></CardHeader>
                <CardContent>
                    <div className="space-y-3">
                    {savedHustles.map((hustle) => (
                        <div key={hustle.name} className="relative group">
                            <Link href={`/hustle/${slugify(hustle.name)}`} onClick={() => handleHustleClick(hustle)} className="block h-full">
                                <div className="border p-4 rounded-2xl hover:bg-muted/50 transition-all flex justify-between items-center shadow-sm hover:shadow-md border-primary/5 hover:border-primary/20">
                                    <div className="pr-8">
                                        <p className="font-bold group-hover:text-primary transition-colors text-sm">{hustle.name}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">Strategic Idea</p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform ml-2 shrink-0" />
                                </div>
                            </Link>
                            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => handleDeleteHustle(e, hustle.name)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-xl rounded-[2rem] border-accent/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-accent"/>Active Conversations</CardTitle>
                </CardHeader>
                <CardContent>
                    {isChatsLoading ? <Skeleton className="h-16 w-full rounded-2xl" /> : filteredChats.length > 0 ? (
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
                        <div className="text-center py-8 opacity-60">
                            <p className="font-bold uppercase tracking-widest text-[10px]">No active chats</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="border-primary/20 shadow-xl overflow-hidden rounded-[2.5rem]">
                <CardHeader className="bg-primary/5 border-b"><CardTitle className="text-lg">Elite Subscription</CardTitle></CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="flex items-center justify-between bg-muted/50 p-4 rounded-2xl border">
                        <span className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Tier</span>
                        <Badge variant={isPremium ? "default" : "secondary"} className="shadow-sm font-bold">{isPremium ? 'PREMIUM ACTIVE' : 'FREE TIER'}</Badge>
                    </div>
                    <Button className="w-full h-14 rounded-2xl shadow-xl font-black text-lg group" onClick={() => setPaymentModalOpen(true)}>
                        <Star className="mr-2 h-5 w-5 transition-transform group-hover:rotate-45" />
                        {isPremium ? 'Extend Access' : 'Upgrade to Pro'}
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
    return <Suspense fallback={<div className="container py-20 text-center"><Skeleton className="h-10 w-48 mx-auto"/></div>}><ProfilePageContent /></Suspense>;
}
