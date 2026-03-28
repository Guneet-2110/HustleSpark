
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useAuth as useFirebaseInstance, useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { Trash2, MessageSquare, Briefcase, Package, ShieldCheck, Store, Loader2, ArrowRight, ShieldAlert, ShoppingBag, Send, Eye, CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";
import { slugify } from "@/lib/utils";
import { HustleGenerator } from "@/components/hustle-generator";
import { useToast } from "@/hooks/use-toast";
import { collection, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function ProfilePage() {
  const { user: localUser, isLoggedIn, isPremium, savedHustles, upgradeToPremium } = useAuth();
  const { user: firebaseUser, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Standardized Queries for the Dashboard
  const buyerChatsQuery = useMemoFirebase(() => {
    if (!firestore || !firebaseUser) return null;
    return query(
      collection(firestore, 'chats'), 
      where('buyerId', '==', firebaseUser.uid)
    );
  }, [firestore, firebaseUser]);

  const sellerChatsQuery = useMemoFirebase(() => {
    if (!firestore || !firebaseUser) return null;
    return query(
      collection(firestore, 'chats'), 
      where('sellerId', '==', firebaseUser.uid)
    );
  }, [firestore, firebaseUser]);

  const { data: rawBuyerChats, isLoading: isBuyerChatsLoading } = useCollection(buyerChatsQuery);
  const { data: rawSellerChats, isLoading: isSellerChatsLoading } = useCollection(sellerChatsQuery);
  
  const allChats = useMemo(() => {
    return [...(rawBuyerChats || []), ...(rawSellerChats || [])].sort((a, b) => 
      (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0)
    );
  }, [rawBuyerChats, rawSellerChats]);

  const myListingsQuery = useMemoFirebase(() => {
      if (!firestore || !firebaseUser) return null;
      return query(collection(firestore, 'marketplace_listings'), where('userId', '==', firebaseUser.uid));
  }, [firestore, firebaseUser]);

  const { data: myListings, isLoading: isMyListingsLoading } = useCollection(myListingsQuery);

  const salesQuery = useMemoFirebase(() => {
      if (!firestore || !firebaseUser) return null;
      return query(collection(firestore, 'transactions'), where('sellerId', '==', firebaseUser.uid));
  }, [firestore, firebaseUser]);

  const purchasesQuery = useMemoFirebase(() => {
      if (!firestore || !firebaseUser) return null;
      return query(collection(firestore, 'transactions'), where('buyerId', '==', firebaseUser.uid));
  }, [firestore, firebaseUser]);

  const { data: rawSales, isLoading: isSalesLoading } = useCollection(salesQuery);
  const { data: rawPurchases, isLoading: isPurchasesLoading } = useCollection(purchasesQuery);

  const sales = useMemo(() => (rawSales || []).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)), [rawSales]);
  const purchases = useMemo(() => (rawPurchases || []).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)), [rawPurchases]);

  const isDeveloper = localUser?.email === 'guneet.ar2010@gmail.com' || localUser?.email === 'tester@gmail.com';

  const handleMarkAsDelivered = async (transaction: any) => {
      if (!firestore) return;
      try {
          await updateDoc(doc(firestore, 'transactions', transaction.id), { status: 'pending_confirmation' });
          toast({ title: "Marked as Delivered", description: "The buyer has been notified to confirm receipt." });
      } catch (e) {
          toast({ variant: 'destructive', title: "Update Failed" });
      }
  };

  const handleConfirmReceipt = async (transaction: any) => {
      if (!firestore) return;
      try {
          await updateDoc(doc(firestore, 'transactions', transaction.id), { status: 'completed' });
          toast({ title: "Acquisition Confirmed!", description: "Funds will be released to the creator shortly." });
      } catch (e) {
          toast({ variant: 'destructive', title: "Update Failed" });
      }
  };

  const handleDispute = async (transaction: any) => {
      if (!firestore) return;
      try {
          await updateDoc(doc(firestore, 'transactions', transaction.id), { status: 'disputed' });
          toast({ 
              variant: 'destructive', 
              title: "Dispute Opened", 
              description: "Admin has been notified. Please discuss the issues in the support chat." 
          });
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

  if (!mounted || isAuthLoading || !isLoggedIn || !localUser) {
    return (
      <div className="container py-20 text-center">
        <Loader2 className="animate-spin h-10 w-10 mx-auto text-primary" />
        <p className="mt-4 text-muted-foreground font-bold uppercase tracking-widest text-xs">Synchronizing Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container py-12">
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
                <h1 className="text-4xl font-black tracking-tight">Venture Dashboard</h1>
                <p className="text-muted-foreground mt-1">Manage your intellectual property and acquisitions.</p>
            </div>
            <div className="flex gap-3">
                <Button variant="outline" asChild className="rounded-2xl h-12 font-bold">
                    <Link href="/marketplace"><ShoppingBag className="mr-2 h-5 w-5"/> Explore Marketplace</Link>
                </Button>
                {isDeveloper && (
                    <Button variant="outline" onClick={() => upgradeToPremium(365)} className="rounded-2xl h-12 font-black border-2 border-primary/20">
                        <ShieldAlert className="mr-2 h-5 w-5 text-primary" /> Activate Developer Premium
                    </Button>
                )}
            </div>
        </div>

      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-12">
            {/* 1. CREATOR VENTURES */}
            <Card className="shadow-xl rounded-[2.5rem] border-primary/20 overflow-hidden bg-card/50">
                <CardHeader className="bg-primary/5 border-b">
                    <CardTitle className="flex items-center gap-2 text-xl font-black"><Store className="h-6 w-6 text-primary"/> Your Marketplace Ventures</CardTitle>
                    <CardDescription className="font-medium">Manage ventures you have listed for sale.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    {isMyListingsLoading ? <Skeleton className="h-20 w-full rounded-2xl" /> : myListings && myListings.length > 0 ? (
                        <div className="space-y-4">
                            {myListings.map((l) => (
                                <div key={l.id} className="p-4 border rounded-2xl bg-background/50 flex justify-between items-center group">
                                    <div>
                                        <p className="font-black text-lg">{l.hustleName}</p>
                                        <Badge variant="secondary" className="text-[10px] mt-1 font-bold">{l.status.replace('_', ' ').toUpperCase()}</Badge>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" asChild className="rounded-xl font-bold"><Link href={`/marketplace/listing/${l.id}`}>View Listing</Link></Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteListing(l.id)} className="text-destructive rounded-xl hover:bg-destructive/10 transition-colors"><Trash2 className="h-4 w-4" /></Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : <div className="text-center py-10 italic text-muted-foreground border-2 border-dashed rounded-3xl font-medium">No ventures listed yet.</div>}
                </CardContent>
            </Card>

            {/* 2. CREATOR SALES */}
            <Card className="shadow-xl rounded-[2.5rem] border-primary/10 overflow-hidden bg-card/50">
                <CardHeader className="bg-primary/5 border-b">
                    <CardTitle className="flex items-center gap-2 text-xl font-black"><Package className="h-6 w-6 text-primary"/> Venture Sales (Creator)</CardTitle>
                    <CardDescription className="font-medium">Track delivery and confirmation status for your sold ventures.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    {isSalesLoading ? <Skeleton className="h-20 w-full rounded-2xl" /> : sales && sales.length > 0 ? (
                        <div className="space-y-4">
                            {sales.map((t) => {
                                const chatForSale = allChats.find(c => c.listingId === t.listingId);
                                return (
                                    <div key={t.id} className="p-4 border rounded-2xl bg-background/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                        <div>
                                            <p className="font-black text-lg">{t.hustleName}</p>
                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                <Badge variant="outline" className="text-[10px] font-bold uppercase">{t.status.replace('_', ' ')}</Badge>
                                                <span className="text-[10px] text-muted-foreground font-bold tracking-tight">${t.sellerAmount.toLocaleString()} Net Payout</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {chatForSale && (
                                                <Button variant="secondary" size="sm" className="rounded-xl font-bold" asChild>
                                                    <Link href={`/chats/${chatForSale.id}`}><MessageSquare className="h-4 w-4 mr-2" /> Chat Buyer</Link>
                                                </Button>
                                            )}
                                            {t.status === 'pending_delivery' && (
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button size="sm" className="rounded-xl font-bold bg-primary text-primary-foreground shadow-lg">
                                                            Mark as Delivered
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className="rounded-[2rem]">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Venture Assets Double Check</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Have you provided all assets, logos, and strategies to the buyer via the support chat? Once you mark this as delivered, the buyer will be asked to confirm receipt.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel className="rounded-xl">Wait, Not Yet</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleMarkAsDelivered(t)} className="rounded-xl bg-primary">Yes, Everything Sent</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : <div className="text-center py-10 italic text-muted-foreground border-2 border-dashed rounded-3xl font-medium">No sales recorded yet.</div>}
                </CardContent>
            </Card>

            {/* 3. BUYER ACQUISITIONS */}
            <Card className="shadow-xl rounded-[2.5rem] border-accent/10 overflow-hidden bg-card/50">
                <CardHeader className="bg-accent/5 border-b">
                    <CardTitle className="flex items-center gap-2 text-xl font-black text-accent"><ShieldCheck className="h-6 w-6"/> Acquired Ventures (Buyer)</CardTitle>
                    <CardDescription className="font-medium">Confirm delivery to release funds to the creator.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    {isPurchasesLoading ? <Skeleton className="h-20 w-full rounded-2xl" /> : purchases && purchases.length > 0 ? (
                        <div className="space-y-4">
                            {purchases.map((t) => {
                                const chatForAcquisition = allChats.find(c => c.listingId === t.listingId);
                                return (
                                    <div key={t.id} className="p-4 border rounded-2xl bg-background/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                        <div>
                                            <p className="font-black text-lg">{t.hustleName}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="outline" className={`text-[10px] font-bold uppercase ${t.status === 'disputed' ? 'border-destructive text-destructive' : 'border-accent/30 text-accent'}`}>{t.status.replace('_', ' ')}</Badge>
                                                <span className="text-[10px] text-muted-foreground font-bold tracking-tight">${t.amount.toLocaleString()} Invested</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {chatForAcquisition && (
                                                <Button variant="secondary" size="sm" className="rounded-xl font-bold" asChild>
                                                    <Link href={`/chats/${chatForAcquisition.id}`}><MessageSquare className="h-4 w-4 mr-2" /> Chat Creator</Link>
                                                </Button>
                                            )}
                                            {t.status === 'pending_confirmation' && (
                                                <div className="flex gap-2">
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg">
                                                                Confirm Receipt
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent className="rounded-[2rem]">
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Approve Acquisition?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    By confirming receipt, you acknowledge that you have received all intellectual property and assets for this venture. This will release the escrow funds to the creator.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel className="rounded-xl">Not Ready Yet</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleConfirmReceipt(t)} className="rounded-xl bg-green-600">Yes, Approve & Release</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>

                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="outline" size="sm" className="border-destructive text-destructive hover:bg-destructive/10 rounded-xl font-bold">
                                                                Report Issue
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent className="rounded-[2rem]">
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle className="text-destructive flex items-center gap-2"><AlertTriangle className="h-5 w-5"/> Open a Dispute?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to disapprove this delivery? An admin will review the support chat to mediate. Please ensure you have clearly stated what is missing to the creator first.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDispute(t)} className="rounded-xl bg-destructive">Yes, Open Dispute</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            )}
                                            <Button variant="outline" size="sm" className="rounded-xl font-bold" asChild>
                                                <Link href={`/marketplace/listing/${t.listingId}`}><Eye className="h-4 w-4 mr-2" /> View Assets</Link>
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : <div className="text-center py-10 italic text-muted-foreground border-2 border-dashed rounded-3xl font-medium">No acquisitions yet.</div>}
                </CardContent>
            </Card>

            <div className="bg-gradient-to-br from-primary/10 via-transparent to-accent/5 shadow-2xl border-primary/20 rounded-[2.5rem] overflow-hidden p-8">
                <HustleGenerator />
            </div>
        </div>

        <div className="lg:col-span-4 space-y-12">
            <Card className="shadow-xl rounded-[2.5rem] border-primary/10 overflow-hidden">
                <CardHeader className="bg-muted/30"><CardTitle className="text-lg flex items-center gap-2 font-black"><Briefcase className="h-5 w-5 text-primary"/>Saved Ideas</CardTitle></CardHeader>
                <CardContent className="p-4 pt-4">
                    <div className="space-y-3">
                    {savedHustles.length > 0 ? savedHustles.map((hustle) => (
                        <Link key={hustle.name} href={`/hustle/${slugify(hustle.name)}`} className="block group">
                            <div className="border p-4 rounded-2xl hover:bg-primary/5 hover:border-primary/30 transition-all flex justify-between items-center">
                                <p className="font-bold text-sm">{hustle.name}</p>
                                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0" />
                            </div>
                        </Link>
                    )) : <p className="text-center text-xs text-muted-foreground py-8 italic font-medium">No saved ideas yet.</p>}
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-xl rounded-[2.5rem] border-accent/10 overflow-hidden">
                <CardHeader className="bg-muted/30"><CardTitle className="text-lg flex items-center gap-2 text-accent font-black"><MessageSquare className="h-5 w-5"/>Active Conversations</CardTitle></CardHeader>
                <CardContent className="p-4 pt-4">
                    {(isBuyerChatsLoading || isSellerChatsLoading) ? <Skeleton className="h-10 w-full rounded-xl" /> : allChats.length > 0 ? (
                        <div className="space-y-3">
                            {allChats.map(chat => (
                                <Link key={chat.id} href={`/chats/${chat.id}`} className="block group">
                                    <div className="border p-4 rounded-2xl hover:bg-accent/5 hover:border-accent/30 transition-all">
                                        <div className="flex justify-between items-start">
                                            <p className="font-bold text-sm">{chat.hustleName}</p>
                                            <Badge variant="outline" className="text-[8px] font-black uppercase text-accent border-accent/20">LIVE</Badge>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground line-clamp-1 mt-1 italic font-medium opacity-70">Last msg: {chat.lastMessage}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : <p className="text-center text-xs text-muted-foreground py-8 italic font-medium">No active support channels.</p>}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
