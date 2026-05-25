"use client";

import { createNotification } from '@/lib/notifications';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useState, useTransition, useEffect } from 'react';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, ArrowLeft, Rocket, Check, MessageSquare, ArrowRight, Briefcase, Target, Globe, Heart, ShieldCheck, Loader2, Trash2, Flag, Star } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { StripeCheckout } from '@/components/stripe-checkout';
import { useToast } from '@/hooks/use-toast';
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
    const [isReporting, startReporting] = useTransition();
const [showReportDialog, setShowReportDialog] = useState(false);
const [reportReason, setReportReason] = useState('');

    const listingId = params.id as string;
    
    const memoizedDocRef = useMemoFirebase(() => {
        if (!firestore || !listingId) return null;
        return doc(firestore, 'marketplace_listings', listingId);
    }, [firestore, listingId]);

    const { data: listing, isLoading: isListingLoading } = useDoc(memoizedDocRef);

    // Site Administrator privileges check
    const isAdmin = user?.email === 'guneet.ar2010@gmail.com' || user?.email === 'tester@gmail.com';

    const [reviews, setReviews] = useState<any[]>([]);
    const [avgRating, setAvgRating] = useState<number | null>(null);

    useEffect(() => {
        if (!firestore || !listingId) return;
        const fetchReviews = async () => {
            const snap = await getDocs(
                query(collection(firestore, 'reviews'), where('listingId', '==', listingId))
            );
            if (snap.size > 0) {
                const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                setReviews(data);
                const total = data.reduce((sum, r) => sum + (r.rating || 0), 0);
                setAvgRating(Math.round((total / data.length) * 10) / 10);
            }
        };
        fetchReviews();
    }, [firestore, listingId]);

    const handleApprove = () => {
        if (!firestore || !listingId || !isAdmin) return;
        startApproving(async () => {
            try {
                const docRef = doc(firestore, 'marketplace_listings', listingId);
                await updateDoc(docRef, { status: 'approved' });
                await createNotification(firestore, listing.userId, 'approved',
                    '🚀 Listing Approved!',
                    `Your listing "${listing.hustleName}" is now live on the marketplace!`,
                    `/marketplace/listing/${listingId}`
                );
                toast({ title: "Listing Approved", description: "The listing is now live for all users." });
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

    const handleReport = () => {
        if (!reportReason.trim()) {
            toast({ variant: 'destructive', title: 'Reason Required', description: 'Please describe the issue.' });
            return;
        }
        startReporting(async () => {
            try {
                const { getFunctions, httpsCallable } = await import('firebase/functions');
                const functions = getFunctions();
                const notify = httpsCallable(functions, 'sendSaleNotification');
                await notify({
                    hustleName: listing.hustleName,
                    totalAmount: listing.price,
                    sellerEmail: listing.paypalEmail,
                    buyerEmail: user?.email || 'Anonymous',
                    listingId: listingId,
                    status: `🚨 LISTING REPORTED BY USER - REASON: ${reportReason}`,
                });
                setShowReportDialog(false);
                setReportReason('');
                toast({ title: "Report Submitted", description: "Our team will review this listing within 24 hours." });
            } catch (error: any) {
                toast({ variant: 'destructive', title: "Report Failed", description: error.message });
            }
        });
    };

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
    const isBuyer = !isOwner && !isAdmin;
    

    return (
        <div className="container py-12 max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <Button variant="ghost" onClick={() => router.back()} className="rounded-full group">
                    <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Marketplace
                </Button>
                
                {(isAdmin || isOwner) && (
                    <div className="flex flex-col gap-3">
                        {isAdmin && (
                            <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 flex items-center gap-3">
                                <ShieldCheck className="h-5 w-5 text-orange-500 shrink-0" />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-orange-500">Admin Only — PayPal Payout Email</p>
                                    <p className="font-bold text-sm mt-0.5">{listing.paypalEmail || 'Not provided'}</p>
                                </div>
                            </div>
                        )}
                        <div className="flex gap-2">
                         {isAdmin && listing.status === 'pending_approval' && (
                             <AlertDialog>
                                 <AlertDialogTrigger asChild>
                                     <Button disabled={isApproving} className="rounded-2xl h-12 px-8 font-black bg-orange-500 hover:bg-orange-600 shadow-xl text-white">
                                         {isApproving ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
                                         Approve Listing
                                     </Button>
                                 </AlertDialogTrigger>
                                 <AlertDialogContent className="rounded-[2.5rem]">
                                     <AlertDialogHeader>
                                         <AlertDialogTitle>Are you sure you want to approve this?</AlertDialogTitle>
                                         <AlertDialogDescription>
                                             Once approved, this listing will be visible to all users on the marketplace.
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
                                     <AlertDialogTitle>Permanently delete this listing?</AlertDialogTitle>
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
                                    <p className="text-sm text-muted-foreground leading-relaxed">{listing.experience || 'Services and expertise provided by the creator.'}</p>
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

                    {/* REVIEWS SECTION */}
                    <Card className="rounded-[2.5rem] shadow-lg border-primary/10 overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b">
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                                    <span>Reviews</span>
                                    {avgRating && <span className="text-lg font-black text-yellow-500">{avgRating}</span>}
                                </div>
                                <span className="text-xs font-bold text-muted-foreground">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {reviews.length === 0 ? (
                                <div className="text-center py-8">
                                    <Star className="h-8 w-8 mx-auto text-muted-foreground/20 mb-2" />
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No reviews yet</p>
                                    <p className="text-xs text-muted-foreground mt-1">Be the first to purchase and review!</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {reviews.map((review) => (
                                        <div key={review.id} className="p-4 bg-muted/30 rounded-2xl border space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1">
                                                    {[1,2,3,4,5].map((star) => (
                                                        <Star key={star} className={`h-4 w-4 ${star <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground/30'}`} />
                                                    ))}
                                                </div>
                                                <span className="text-[10px] text-muted-foreground font-bold">
                                                    {review.createdAt?.toDate ? new Date(review.createdAt.toDate()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                                                </span>
                                            </div>
                                            {review.review && (
                                                <p className="text-sm text-muted-foreground leading-relaxed italic">"{review.review}"</p>
                                            )}
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{review.buyerEmail?.split('@')[0]}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
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
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">What You Get</p>
                                <ul className="text-sm space-y-3 font-medium">
                                    <li className="flex items-center gap-3"><Check className="h-5 w-5 text-green-500 bg-green-500/10 p-1 rounded-full" /> Access to Creator's Service</li>
                                    <li className="flex items-center gap-3"><Check className="h-5 w-5 text-green-500 bg-green-500/10 p-1 rounded-full" /> Direct Communication with Creator</li>
                                    <li className="flex items-center gap-3"><Check className="h-5 w-5 text-green-500 bg-green-500/10 p-1 rounded-full" /> Secure Escrow Payment</li>
                                    <li className="flex items-center gap-3"><MessageSquare className="h-5 w-5 text-accent bg-accent/10 p-1 rounded-full" /> Post-Purchase Chat Support</li>
                                </ul>
                            </div>
                            {isBuyer && listing.status === 'approved' && (
    <button 
        onClick={() => setShowReportDialog(true)}
        className="w-full text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-destructive transition-colors flex items-center justify-center gap-1 py-2"
    >
        <Flag className="h-3 w-3" /> Report This Listing
    </button>
)}
                            <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
                                <DialogTrigger asChild>
                                    <Button disabled={listing.status !== 'approved'} className="w-full h-16 text-xl font-black rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-95 group">
                                        {listing.status === 'approved' ? 'Hire This Hustle' : 'Reviewing...'}
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
            <AlertDialog open={showReportDialog} onOpenChange={setShowReportDialog}>
    <AlertDialogContent className="rounded-[2.5rem]">
        <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black">Report This Listing</AlertDialogTitle>
            <AlertDialogDescription>
                Describe why this listing violates HustleSpark policies. Our team will review within 24 hours.
            </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-3 py-2">
            <Label className="font-bold text-sm">Reason for Report</Label>
            <Textarea 
                placeholder="e.g. This listing is fraudulent, misleading, or contains stolen content..."
                className="rounded-xl min-h-[100px]"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
            />
        </div>
        <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction 
                onClick={handleReport} 
                disabled={isReporting}
                className="rounded-xl bg-destructive text-white"
            >
                {isReporting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                Submit Report
            </AlertDialogAction>
        </AlertDialogFooter>
    </AlertDialogContent>
</AlertDialog>
        </div>
    );
}