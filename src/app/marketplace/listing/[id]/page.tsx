
"use client";

import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { doc, setDoc, serverTimestamp, updateDoc, deleteDoc } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, ArrowLeft, Rocket, Check, MessageSquare, ArrowRight, Briefcase, Target, Globe, Heart, ShieldCheck, Loader2, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useState, useTransition, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { StripeCheckout } from '@/components/stripe-checkout';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import placeholders from '@/app/lib/placeholder-images.json';
import { EscrowTrustBanner } from '@/components/escrow-trust-banner';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function MarketplaceListingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isApproving, startApproving] = useTransition();
    const [isDeleting, startDeleting] = useTransition();

    const listingId = params.id as string;
    
    const memoizedDocRef = useMemoFirebase(() => {
        if (!firestore || !listingId) return null;
        return doc(firestore, 'marketplace_listings', listingId);
    }, [firestore, listingId]);

    const { data: listing, isLoading: isListingLoading } = useDoc(memoizedDocRef);

    // Site Administrator privileges check
    const isAdmin = user?.email === 'guneet.ar2010@gmail.com' || user?.email === 'tester@gmail.com';

    const handleApprove = () => {
        if (!firestore || !listingId || !isAdmin) return;
        startApproving(async () => {
            try {
                const docRef = doc(firestore, 'marketplace_listings', listingId);
                await updateDoc(docRef, { status: 'approved' });
                toast({ title: "Venture Approved", description: "The listing is now live for all users." });
            } catch (error: any) {
                toast({ variant: 'destructive', title: "Approval Failed", description: error.message });
            }
        });
    };

    const handleDelete = () => {
        if (!firestore || !listingId) return;
        const isOwner = listing?.userId === user?.uid;
        if (!isAdmin && !isOwner) return;

        startDeleting(async () => {
            try {
                const docRef = doc(firestore, 'marketplace_listings', listingId);
                await deleteDoc(docRef);
                toast({ title: "Listing Removed", description: "The venture has been permanently deleted." });
                router.push('/marketplace');
            } catch (error: any) {
                toast({ variant: 'destructive', title: "Deletion Failed", description: error.message });
            }
        });
    }

    if (isListingLoading || isUserLoading) {
        return (
            <div className="container py-20 text-center space-y-4">
                <Loader2 className="animate-spin h-10 w-10 mx-auto text-primary" />
                <p className="font-bold text-muted-foreground">Syncing venture data...</p>
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="container py-20 text-center">
                <h2 className="text-2xl font-bold">Listing not found</h2>
                <Button variant="link" onClick={() => router.back()}>Go back</Button>
            </div>
        );
    }

    const total = listing.price || 0;
    const flyerUrl = listing.flyerUrl || placeholders.listings.default.url;
    const isOwner = listing.userId === user?.uid;

    return (
        <div className="container py-12 max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <Button variant="ghost" onClick={() => router.back()} className="rounded-full group">
                    <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Marketplace
                </Button>
                
                {(isAdmin || isOwner) && (
                    <div className="flex gap-2">
                         {isAdmin && listing.status === 'pending_approval' && (
                             <AlertDialog>
                                 <AlertDialogTrigger asChild>
                                     <Button disabled={isApproving} className="rounded-2xl h-12 px-8 font-black bg-orange-500 hover:bg-orange-600 shadow-xl text-white">
                                         {isApproving ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
                                         Approve Venture
                                     </Button>
                                 </AlertDialogTrigger>
                                 <AlertDialogContent className="rounded-[2.5rem]">
                                     <AlertDialogHeader>
                                         <AlertDialogTitle>Are you sure you want to approve this?</AlertDialogTitle>
                                         <AlertDialogDescription>
                                             Once approved, this venture will be visible to all users on the marketplace.
                                         </AlertDialogDescription>
                                     </AlertDialogHeader>
                                     <AlertDialogFooter>
                                         <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                         <AlertDialogAction onClick={handleApprove} className="rounded-xl bg-orange-500">Approve Listing</AlertDialogAction>
                                     </AlertDialogFooter>
                                 </AlertDialogContent>
                             </AlertDialog>
                         )}
                         <AlertDialog>
                             <AlertDialogTrigger asChild>
                                 <Button variant="destructive" disabled={isDeleting} className="rounded-2xl h-12 px-8 font-black shadow-xl">
                                     {isDeleting ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <Trash2 className="mr-2 h-5 w-5" />}
                                     Remove Listing
                                 </Button>
                             </AlertDialogTrigger>
                             <AlertDialogContent className="rounded-[2.5rem]">
                                 <AlertDialogHeader>
                                     <AlertDialogTitle>Permanently delete this venture?</AlertDialogTitle>
                                     <AlertDialogDescription>
                                         This action cannot be undone. This listing will be removed from all results.
                                     </AlertDialogDescription>
                                 </AlertDialogHeader>
                                 <AlertDialogFooter>
                                     <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                     <AlertDialogAction onClick={handleDelete} className="rounded-xl bg-destructive text-white">Confirm Removal</AlertDialogAction>
                                 </AlertDialogFooter>
                             </AlertDialogContent>
                         </AlertDialog>
                    </div>
                )}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="relative aspect-video rounded-[2.5rem] overflow-hidden border shadow-2xl bg-muted">
                        <Image src={flyerUrl} alt={listing.hustleName} fill className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute bottom-8 left-8 flex items-center gap-6">
                            {listing.logoUrl && (
                                <div className="h-20 w-20 rounded-2xl bg-white/10 backdrop-blur-xl overflow-hidden p-3 border border-white/20 shadow-2xl">
                                    <Image src={listing.logoUrl} alt="Logo" width={80} height={80} className="object-contain" />
                                </div>
                            )}
                            <div>
                                <h1 className="text-4xl font-black text-white tracking-tight">{listing.hustleName}</h1>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge className="bg-primary/20 text-white border-white/10">{listing.category}</Badge>
                                    <span className="text-white/60 text-sm font-bold flex items-center gap-1">
                                        <MapPin className="h-3 w-3" /> {listing.location || 'Remote'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Card className="rounded-[2.5rem] shadow-xl border-primary/10">
                        <CardHeader><CardTitle className="text-2xl flex items-center gap-2"><Rocket className="h-6 w-6 text-primary"/> Strategic Blueprint</CardTitle></CardHeader>
                        <CardContent className="space-y-8">
                            <div className="space-y-3">
                                <h4 className="font-black text-xs uppercase tracking-widest text-primary flex items-center gap-2">
                                    <Globe className="h-4 w-4" /> About us
                                </h4>
                                <p className="text-lg text-muted-foreground leading-relaxed italic">"{listing.pitch || listing.description}"</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8 pt-8 border-t">
                                <div className="space-y-3">
                                    <h4 className="font-black text-xs uppercase tracking-widest text-primary flex items-center gap-2">
                                        <Briefcase className="h-4 w-4" /> What we do
                                    </h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{listing.experience || 'Proprietary venture strategy and branding.'}</p>
                                </div>
                                <div className="space-y-3">
                                    <h4 className="font-black text-xs uppercase tracking-widest text-primary flex items-center gap-2">
                                        <Target className="h-4 w-4" /> Our goal
                                    </h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{listing.whoIHelp || 'To empower new entrepreneurs with elite starting assets.'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="rounded-[2.5rem] shadow-2xl border-primary/20 sticky top-24 overflow-hidden">
                        <div className="bg-primary/5 p-8 text-center border-b border-primary/10">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Acquisition Price</p>
                            <h2 className="text-5xl font-black tracking-tighter">${listing.price?.toLocaleString()}</h2>
                        </div>
                        <CardContent className="p-8 space-y-6">
                            <div className="space-y-3 bg-muted/30 p-6 rounded-2xl border">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Venture Inclusions</p>
                                <ul className="text-sm space-y-3 font-medium">
                                    <li className="flex items-center gap-3"><Check className="h-5 w-5 text-green-500 bg-green-500/10 p-1 rounded-full" /> IP & Ownership Rights</li>
                                    <li className="flex items-center gap-3"><Check className="h-5 w-5 text-green-500 bg-green-500/10 p-1 rounded-full" /> Full Branding Kit</li>
                                    <li className="flex items-center gap-3"><Check className="h-5 w-5 text-green-500 bg-green-500/10 p-1 rounded-full" /> 4-Week Launch Roadmap</li>
                                    <li className="flex items-center gap-3"><MessageSquare className="h-5 w-5 text-accent bg-accent/10 p-1 rounded-full" /> Post-Sale Chat Support</li>
                                </ul>
                            </div>
                            <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
                                <DialogTrigger asChild>
                                    <Button disabled={listing.status !== 'approved'} className="w-full h-16 text-xl font-black rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-95 group">
                                        {listing.status === 'approved' ? 'Acquire Venture' : 'Reviewing...'}
                                        {listing.status === 'approved' && <ArrowRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-1" />}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                                    <div className="bg-background max-h-[90vh] flex flex-col">
                                        <DialogHeader className="p-8 pb-4">
                                            <DialogTitle className="text-2xl font-black">Secure Acquisition</DialogTitle>
                                            <DialogDescription className="font-medium">
                                                Review and finalize your acquisition of "<span className="text-primary">{listing.hustleName}</span>".
                                            </DialogDescription>
                                        </DialogHeader>
                                        
                                        <ScrollArea className="flex-1 px-8 pb-8">
                                            <div className="space-y-6 py-4">
                                                <EscrowTrustBanner />

                                                <StripeCheckout
                                                    amount={total}
                                                    listingId={listingId}
                                                    sellerEmail={listing.paypalEmail}
                                                    hustleName={listing.hustleName}
                                                    buyerId={user?.uid || ""}
                                                    onSuccess={() => setIsCheckoutOpen(false)}
                                                />
                                            </div>
                                        </ScrollArea>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
