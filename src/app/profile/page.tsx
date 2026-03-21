
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
    if (difference <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        total: difference,
    };
};

function ProfilePageContent() {
  const { user: localUser, isLoggedIn, isPremium, savedHustles, upgradeToPremium, setPaymentModalOpen, unsaveHustle } = useAuth();
  const { user: firebaseUser } = useFirebaseInstance();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [timeLeft, setTimeLeft] = useState<{days:number, hours:number, minutes:number, seconds:number, total:number} | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isPremium && localUser?.premiumExpiresAt) {
        setTimeLeft(calculateTimeLeft(localUser.premiumExpiresAt));
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft(localUser.premiumExpiresAt));
        }, 1000);
        return () => clearInterval(timer);
    }
  }, [isPremium, localUser?.premiumExpiresAt]);

  const isDeveloper = localUser?.email === 'guneet.ar2010@gmail.com' || localUser?.email === 'tester@gmail.com';

  const chatsQuery = useMemoFirebase(() => {
    if (!firestore || !firebaseUser) return null;
    return query(collection(firestore, 'chats'), orderBy('updatedAt', 'desc'));
  }, [firestore, firebaseUser]);

  const { data: rawChats, isLoading: isChatsLoading } = useCollection(chatsQuery);
  const filteredChats = rawChats?.filter(c => c.buyerId === firebaseUser?.uid || c.sellerId === firebaseUser?.uid) || [];

  const myListingsQuery = useMemoFirebase(() => {
      if (!firestore || !firebaseUser) return null;
      return query(collection(firestore, 'marketplace_listings'), where('userId', '==', firebaseUser.uid), orderBy('createdAt', 'desc'));
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
          await updateDoc(doc(firestore, 'transactions', transaction.id), { status: 'pending_confirmation' });
          toast({ title: "Venture Delivered" });
      } catch (e) {
          toast({ variant: 'destructive', title: "Update Failed" });
      }
  };

  const handleConfirmReceipt = async (transaction: any) => {
      if (!firestore) return;
      try {
          await updateDoc(doc(firestore, 'transactions', transaction.id), { status: 'completed' });
          await notifyAdminOfCompletionAction({
              id: transaction.id,
              hustleName: transaction.hustleName,
              sellerEmail: transaction.sellerEmail,
              sellerAmount: transaction.sellerAmount,
              buyerEmail: transaction.buyerEmail,
          });
          toast({ title: "Receipt Confirmed!" });
      } catch (e) {
          toast({ variant: 'destructive', title: "Update Failed" });
      }
  };

  const handleDeleteListing = async (listingId: string) => {
      if (!firestore) return;
      try {
          await deleteDoc(doc(firestore, 'marketplace_listings', listingId));
          toast({ title: "Listing Removed" });
      } catch (e) {
          toast({ variant: 'destructive', title: "Deletion Failed" });
      }
  };

  if (!isLoggedIn || !localUser || !isClient) {
    return <div className="container py-20 text-center"><Loader2 className="animate-spin h-10 w-10 mx-auto text-primary" /></div>;
  }

  return (
    <div className="container py-12">
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
                <h1 className="text-4xl font-black tracking-tight">Venture Dashboard</h1>
                {isPremium && timeLeft && timeLeft.total > 0 && (
                     <div className="mt-4 inline-flex items-center gap-x-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-2 text-sm font-medium">
                        <Clock className="h-5 w-5 text-primary" />
                        <span>Premium: <span className="font-mono font-bold">{timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m</span></span>
                    </div>
                )}
            </div>
            {isDeveloper && (
                <Button variant="outline" onClick={() => upgradeToPremium(365)} className="rounded-2xl h-12 font-black">
                    <ShieldAlert className="mr-2 h-5 w-5" /> Activate Free Premium
                </Button>
            )}
        </div>

      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-12">
            <Card className="shadow-xl rounded-[2.5rem] border-primary/20 overflow-hidden">
                <CardHeader className="bg-primary/5 border-b">
                    <CardTitle className="flex items-center gap-2"><Store className="h-6 w-6 text-primary"/> Your Marketplace Ventures</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    {isMyListingsLoading ? <Skeleton className="h-20 w-full" /> : myListings && myListings.length > 0 ? (
                        <div className="space-y-4">
                            {myListings.map((l) => (
                                <div key={l.id} className="p-4 border rounded-2xl bg-muted/20 flex justify-between items-center">
                                    <div>
                                        <p className="font-black">{l.hustleName}</p>
                                        <Badge variant="secondary" className="text-[10px] mt-1">{l.status.replace('_', ' ')}</Badge>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" asChild><Link href={`/marketplace/listing/${l.id}`}>View</Link></Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteListing(l.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-center text-muted-foreground py-8 italic">No ventures listed.</p>}
                </CardContent>
            </Card>

            <Card className="shadow-xl rounded-[2.5rem] border-primary/10 overflow-hidden">
                <CardHeader className="bg-primary/5 border-b">
                    <CardTitle className="flex items-center gap-2"><Package className="h-6 w-6 text-primary"/> Venture Sales (Creator)</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    {isSalesLoading ? <Skeleton className="h-20 w-full" /> : sales && sales.length > 0 ? (
                        <div className="space-y-4">
                            {sales.map((t) => (
                                <div key={t.id} className="p-4 border rounded-2xl bg-muted/20 flex justify-between items-center">
                                    <div>
                                        <p className="font-black">{t.hustleName}</p>
                                        <Badge variant="outline" className="text-[10px] mt-1">{t.status.replace('_', ' ')}</Badge>
                                    </div>
                                    {t.status === 'pending_delivery' && <Button onClick={() => handleMarkAsDelivered(t)} size="sm">Mark Delivered</Button>}
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-center text-muted-foreground py-8 italic">No sales yet.</p>}
                </CardContent>
            </Card>

            <Card className="shadow-xl rounded-[2.5rem] border-accent/10 overflow-hidden">
                <CardHeader className="bg-accent/5 border-b">
                    <CardTitle className="flex items-center gap-2 text-accent"><ShieldCheck className="h-6 w-6"/> Acquired Ventures (Buyer)</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    {isPurchasesLoading ? <Skeleton className="h-20 w-full" /> : purchases && purchases.length > 0 ? (
                        <div className="space-y-4">
                            {purchases.map((t) => (
                                <div key={t.id} className="p-4 border rounded-2xl bg-muted/20 flex justify-between items-center">
                                    <div>
                                        <p className="font-black">{t.hustleName}</p>
                                        <Badge variant="outline" className="text-[10px] mt-1 border-accent/30 text-accent">{t.status.replace('_', ' ')}</Badge>
                                    </div>
                                    {t.status === 'pending_confirmation' && <Button onClick={() => handleConfirmReceipt(t)} size="sm" className="bg-accent">Confirm Receipt</Button>}
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-center text-muted-foreground py-8 italic">No acquisitions yet.</p>}
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/10 via-transparent to-accent/5 shadow-2xl border-primary/20 rounded-[2.5rem] overflow-hidden p-6">
                <HustleGenerator />
            </Card>
        </div>

        <div className="lg:col-span-4 space-y-12">
            <Card className="shadow-xl rounded-[2rem] border-primary/10">
                <CardHeader><CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary"/>Saved Ideas</CardTitle></CardHeader>
                <CardContent>
                    <div className="space-y-3">
                    {savedHustles.length > 0 ? savedHustles.map((hustle) => (
                        <Link key={hustle.name} href={`/hustle/${slugify(hustle.name)}`} className="block group">
                            <div className="border p-4 rounded-2xl hover:bg-muted/50 transition-all flex justify-between items-center">
                                <p className="font-bold text-sm">{hustle.name}</p>
                                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </Link>
                    )) : <p className="text-center text-xs text-muted-foreground py-4 italic">No saved ideas.</p>}
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-xl rounded-[2rem] border-accent/10">
                <CardHeader><CardTitle className="flex items-center gap-2 text-accent"><MessageSquare className="h-5 w-5"/>Active Support</CardTitle></CardHeader>
                <CardContent>
                    {isChatsLoading ? <Skeleton className="h-10 w-full" /> : filteredChats.length > 0 ? (
                        <div className="space-y-3">
                            {filteredChats.map(chat => (
                                <Link key={chat.id} href={`/chats/${chat.id}`} className="block group">
                                    <div className="border p-4 rounded-2xl hover:bg-muted/50 transition-all">
                                        <p className="font-bold text-sm">{chat.hustleName}</p>
                                        <p className="text-[10px] text-muted-foreground line-clamp-1 mt-1 italic">{chat.lastMessage}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : <p className="text-center text-xs text-muted-foreground py-4 italic">No active conversations.</p>}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
    return <Suspense fallback={<div className="container py-20 text-center"><Loader2 className="animate-spin h-10 w-10 mx-auto text-primary" /></div>}><ProfilePageContent /></Suspense>;
}
