
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useEffect, useState, useMemo, useTransition } from "react";
import { Trash2, MessageSquare, Briefcase, Package, ShieldCheck, Store, Loader2, ArrowRight, ShieldAlert, ShoppingBag, Eye, CheckCircle, AlertTriangle } from "lucide-react";
import { slugify } from "@/lib/utils";
import { HustleGenerator } from "@/components/hustle-generator";
import { useToast } from "@/hooks/use-toast";
import { collection, query, where, doc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function ProfilePage() {
  const { user: localUser, isLoggedIn, upgradeToPremium, savedHustles } = useAuth();
  const { user: firebaseUser, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [isResetting, startReset] = useTransition();

  useEffect(() => {
    setMounted(true);
  }, []);

  const buyerChatsQuery = useMemoFirebase(() => {
    if (!firestore || !firebaseUser) return null;
    return query(collection(firestore, 'chats'), where('buyerId', '==', firebaseUser.uid));
  }, [firestore, firebaseUser]);

  const sellerChatsQuery = useMemoFirebase(() => {
    if (!firestore || !firebaseUser) return null;
    return query(collection(firestore, 'chats'), where('sellerId', '==', firebaseUser.uid));
  }, [firestore, firebaseUser]);

  const { data: rawBuyerChats, isLoading: isBchatsLoading } = useCollection(buyerChatsQuery);
  const { data: rawSellerChats, isLoading: isSchatsLoading } = useCollection(sellerChatsQuery);
  
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

  const isOwner = firebaseUser?.email === 'guneet.ar2010@gmail.com';
  const isDeveloper = isOwner || localUser?.email === 'tester@gmail.com';

  const handleResetSystem = () => {
    if (!firestore || !isOwner) return;
    
    const password = window.prompt("Enter Owner Password to PURGE ALL DATA (Fresh Restart):");
    if (password !== '0wNERGun##t') {
        toast({ variant: "destructive", title: "Access Denied", description: "Incorrect owner password." });
        return;
    }

    startReset(async () => {
        try {
            const collections = ['marketplace_listings', 'chats', 'transactions'];
            for (const colName of collections) {
                const snapshot = await getDocs(collection(firestore, colName));
                const deletePromises = snapshot.docs.map(itemDoc => 
                    deleteDoc(doc(firestore, colName, itemDoc.id))
                );
                await Promise.all(deletePromises);
                
                // Also purge subcollections for chats
                if (colName === 'chats') {
                    for (const chatDoc of snapshot.docs) {
                        const messages = await getDocs(collection(firestore, 'chats', chatDoc.id, 'messages'));
                        const msgDeletes = messages.docs.map(m => deleteDoc(doc(firestore, 'chats', chatDoc.id, 'messages', m.id)));
                        await Promise.all(msgDeletes);
                    }
                }
            }
            
            toast({
                title: "System Reset Successful",
                description: "All ventures, chats, and records have been purged for testing."
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Reset Failed",
                description: error.message || "Could not purge system data."
            });
        }
    });
  };

  const handleMarkAsDelivered = async (transaction: any) => {
      if (!firestore) return;
      try {
          await updateDoc(doc(firestore, 'transactions', transaction.id), { status: 'pending_confirmation' });
          toast({ title: "Marked as Delivered", description: "The buyer has been notified." });
      } catch (e) {
          toast({ variant: 'destructive', title: "Update Failed" });
      }
  };

  const handleConfirmReceipt = async (transaction: any) => {
      if (!firestore) return;
      try {
          await updateDoc(doc(firestore, 'transactions', transaction.id), { status: 'completed' });
          toast({ title: "Venture Acquired!", description: "Funds released to creator." });
      } catch (e) {
          toast({ variant: 'destructive', title: "Update Failed" });
      }
  };

  const handleDispute = async (transaction: any) => {
      if (!firestore) return;
      try {
          await updateDoc(doc(firestore, 'transactions', transaction.id), { status: 'disputed' });
          toast({ variant: 'destructive', title: "Dispute Opened", description: "Admin notified." });
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
        <p className="mt-4 text-muted-foreground font-black uppercase tracking-widest text-xs">Synchronizing Dashboard...</p>
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
                {isOwner && (
                    <Button 
                        variant="destructive" 
                        onClick={handleResetSystem} 
                        disabled={isResetting}
                        className="rounded-2xl h-12 font-black shadow-xl px-6 active:scale-95 transition-all"
                    >
                        {isResetting ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <Trash2 className="mr-2 h-5 w-5" />}
                        MASTER RESET
                    </Button>
                )}
                <Button variant="outline" asChild className="rounded-2xl h-12 font-bold"><Link href="/marketplace"><ShoppingBag className="mr-2 h-5 w-5"/> Explore</Link></Button>
                {isDeveloper && !isOwner && (
                    <Button variant="outline" onClick={() => upgradeToPremium(365)} className="rounded-2xl h-12 font-black border-2 border-primary/20">
                        <ShieldAlert className="mr-2 h-5 w-5 text-primary" /> Activate Dev Premium
                    </Button>
                )}
            </div>
        </div>

      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-12">
            <Card className="shadow-xl rounded-[2.5rem] border-primary/20 overflow-hidden bg-card/50">
                <CardHeader className="bg-primary/5 border-b">
                    <CardTitle className="flex items-center gap-2 text-xl font-black"><Store className="h-6 w-6 text-primary"/> Marketplace Listings</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    {isMyListingsLoading ? <Skeleton className="h-20 w-full" /> : myListings && myListings.length > 0 ? (
                        <div className="space-y-4">
                            {myListings.map((l) => (
                                <div key={l.id} className="p-4 border rounded-2xl bg-background/50 flex justify-between items-center">
                                    <div>
                                        <p className="font-black text-lg">{l.hustleName}</p>
                                        <Badge variant="secondary" className="text-[10px] mt-1 font-bold">{l.status.toUpperCase()}</Badge>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" asChild className="rounded-xl font-bold"><Link href={`/marketplace/listing/${l.id}`}>View</Link></Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteListing(l.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : <div className="text-center py-10 italic text-muted-foreground">No ventures listed.</div>}
                </CardContent>
            </Card>

            <Card className="shadow-xl rounded-[2.5rem] border-primary/10 overflow-hidden bg-card/50">
                <CardHeader className="bg-primary/5 border-b">
                    <CardTitle className="flex items-center gap-2 text-xl font-black"><Package className="h-6 w-6 text-primary"/> Venture Sales (Creator)</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    {isSalesLoading ? <Skeleton className="h-20 w-full" /> : sales && sales.length > 0 ? (
                        <div className="space-y-4">
                            {sales.map((t) => {
                                const chat = allChats.find(c => c.listingId === t.listingId);
                                return (
                                    <div key={t.id} className="p-4 border rounded-2xl bg-background/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                        <div>
                                            <p className="font-black text-lg">{t.hustleName}</p>
                                            <Badge variant="outline" className="text-[10px] font-bold uppercase">{t.status.replace('_', ' ')}</Badge>
                                        </div>
                                        <div className="flex gap-2">
                                            {chat && (
                                                <Button variant="secondary" size="sm" className="rounded-xl font-bold" asChild>
                                                    <Link href={`/chats/${chat.id}`}><MessageSquare className="h-4 w-4 mr-2" /> Chat Buyer</Link>
                                                </Button>
                                            )}
                                            {t.status === 'pending_delivery' && (
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild><Button size="sm" className="rounded-xl font-bold">Mark Delivered</Button></AlertDialogTrigger>
                                                    <AlertDialogContent className="rounded-[2rem]">
                                                        <AlertDialogHeader><AlertDialogTitle>Double Check Delivery</AlertDialogTitle><AlertDialogDescription>Have you sent all assets to the buyer via chat?</AlertDialogDescription></AlertDialogHeader>
                                                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleMarkAsDelivered(t)}>Confirm Sent</AlertDialogAction></AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : <div className="text-center py-10 italic text-muted-foreground">No sales recorded.</div>}
                </CardContent>
            </Card>

            <Card className="shadow-xl rounded-[2.5rem] border-accent/10 overflow-hidden bg-card/50">
                <CardHeader className="bg-accent/5 border-b">
                    <CardTitle className="flex items-center gap-2 text-xl font-black text-accent"><ShieldCheck className="h-6 w-6"/> Acquired Ventures (Buyer)</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    {isPurchasesLoading ? <Skeleton className="h-20 w-full" /> : purchases && purchases.length > 0 ? (
                        <div className="space-y-4">
                            {purchases.map((t) => {
                                const chat = allChats.find(c => c.listingId === t.listingId);
                                return (
                                    <div key={t.id} className="p-4 border rounded-2xl bg-background/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                        <div>
                                            <p className="font-black text-lg">{t.hustleName}</p>
                                            <Badge variant="outline" className="text-[10px] uppercase">{t.status.replace('_', ' ')}</Badge>
                                        </div>
                                        <div className="flex gap-2">
                                            {chat && (
                                                <Button variant="secondary" size="sm" className="rounded-xl font-bold" asChild>
                                                    <Link href={`/chats/${chat.id}`}><MessageSquare className="h-4 w-4 mr-2" /> Chat Creator</Link>
                                                </Button>
                                            )}
                                            {t.status === 'pending_confirmation' && (
                                                <div className="flex gap-2">
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild><Button size="sm" className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold">Confirm Receipt</Button></AlertDialogTrigger>
                                                        <AlertDialogContent className="rounded-[2rem]">
                                                            <AlertDialogHeader><AlertDialogTitle>Approve Delivery?</AlertDialogTitle><AlertDialogDescription>Releasing funds to creator.</AlertDialogDescription></AlertDialogHeader>
                                                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleConfirmReceipt(t)} className="bg-green-600">Yes, Approve</AlertDialogAction></AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild><Button variant="outline" size="sm" className="text-destructive rounded-xl font-bold">Report Issue</Button></AlertDialogTrigger>
                                                        <AlertDialogContent className="rounded-[2rem]">
                                                            <AlertDialogHeader><AlertDialogTitle>Dispute Delivery?</AlertDialogTitle><AlertDialogDescription>Open a support ticket for this acquisition.</AlertDialogDescription></AlertDialogHeader>
                                                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDispute(t)} className="bg-destructive">Dispute</AlertDialogAction></AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            )}
                                            <Button variant="outline" size="sm" asChild className="rounded-xl font-bold"><Link href={`/marketplace/listing/${t.listingId}`}>View Listing</Link></Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : <div className="text-center py-10 italic text-muted-foreground">No acquisitions.</div>}
                </CardContent>
            </Card>

            <div className="bg-gradient-to-br from-primary/10 via-transparent to-accent/5 shadow-2xl border-primary/20 rounded-[2.5rem] overflow-hidden p-8">
                <HustleGenerator />
            </div>
        </div>

        <div className="lg:col-span-4 space-y-12">
            <Card className="shadow-xl rounded-[2.5rem] border-primary/10 overflow-hidden">
                <CardHeader className="bg-muted/30"><CardTitle className="text-lg font-black flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary"/>Saved Ideas</CardTitle></CardHeader>
                <CardContent className="p-4 pt-4">
                    <div className="space-y-3">
                    {savedHustles.length > 0 ? savedHustles.map((h) => (
                        <Link key={h.name} href={`/hustle/${slugify(h.name)}`} className="block group border p-4 rounded-2xl hover:bg-primary/5 transition-all flex justify-between items-center">
                            <p className="font-bold text-sm">{h.name}</p>
                            <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0" />
                        </Link>
                    )) : <p className="text-center text-xs text-muted-foreground py-8 italic font-medium">No saved ideas.</p>}
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-xl rounded-[2.5rem] border-accent/10 overflow-hidden">
                <CardHeader className="bg-muted/30"><CardTitle className="text-lg font-black flex items-center gap-2 text-accent"><MessageSquare className="h-5 w-5"/>Active Support</CardTitle></CardHeader>
                <CardContent className="p-4 pt-4">
                    {(isBchatsLoading || isSchatsLoading) ? <Skeleton className="h-10 w-full" /> : allChats.length > 0 ? (
                        <div className="space-y-3">
                            {allChats.map(c => (
                                <Link key={c.id} href={`/chats/${c.id}`} className="block border p-4 rounded-2xl hover:bg-accent/5 transition-all">
                                    <p className="font-bold text-sm">{c.hustleName}</p>
                                    <p className="text-[10px] text-muted-foreground line-clamp-1 mt-1 italic">{c.lastMessage}</p>
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
