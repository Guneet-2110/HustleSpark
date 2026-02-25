"use client";

import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, ShoppingCart, Globe, Calendar, ArrowLeft, ShieldCheck, Briefcase, Target, Rocket, Check } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { PaypalButton } from '@/components/paypal-button';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import placeholders from '@/app/lib/placeholder-images.json';

export default function MarketplaceListingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const firestore = useFirestore();
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    const listingId = params.id as string;
    
    const memoizedDocRef = useMemoFirebase(() => {
        if (!firestore || !listingId) return null;
        return doc(firestore, 'marketplace_listings', listingId);
    }, [firestore, listingId]);

    const { data: listing, isLoading } = useDoc(memoizedDocRef);

    if (isLoading) {
        return (
            <div className="container py-20 space-y-8">
                <Skeleton className="h-10 w-1/3" />
                <div className="grid lg:grid-cols-3 gap-8">
                    <Skeleton className="lg:col-span-2 h-[400px]" />
                    <Skeleton className="h-[400px]" />
                </div>
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

    return (
        <div className="container py-12 max-w-6xl">
            <Button variant="ghost" onClick={() => router.back()} className="mb-8">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Marketplace
            </Button>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="relative aspect-video rounded-3xl overflow-hidden border">
                        <Image src={flyerUrl} alt={listing.hustleName} fill className="object-cover" />
                        <div className="absolute bottom-6 left-6 flex items-center gap-4">
                            {listing.logoUrl && (
                                <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-md overflow-hidden p-2">
                                    <Image src={listing.logoUrl} alt="Logo" width={64} height={64} className="object-contain" />
                                </div>
                            )}
                            <div>
                                <h1 className="text-3xl font-bold text-white">{listing.hustleName}</h1>
                                <p className="text-white/80">{listing.category} • {listing.location}</p>
                            </div>
                        </div>
                    </div>

                    <Card className="rounded-3xl">
                        <CardHeader><CardTitle className="text-2xl flex items-center gap-2"><Rocket className="h-6 w-6"/> Pitch</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            <p className="text-lg text-muted-foreground">{listing.pitch}</p>
                            <div className="grid md:grid-cols-2 gap-6 pt-6 border-t">
                                <div className="space-y-2">
                                    <h4 className="font-bold flex items-center gap-2"><Briefcase className="h-4 w-4" /> Experience</h4>
                                    <p className="text-sm text-muted-foreground">{listing.experience}</p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-bold flex items-center gap-2"><Target className="h-4 w-4" /> Target</h4>
                                    <p className="text-sm text-muted-foreground">{listing.whoIHelp}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="rounded-3xl shadow-xl border-primary/20 sticky top-24">
                        <CardHeader>
                            <CardTitle className="text-center text-3xl font-black">${listing.price?.toLocaleString()}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2 bg-primary/5 p-4 rounded-2xl border">
                                <ul className="text-sm space-y-2">
                                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Ownership Rights</li>
                                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Brand Assets</li>
                                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Launch Strategy</li>
                                </ul>
                            </div>
                            <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
                                <DialogTrigger asChild>
                                    <Button className="w-full h-16 text-lg font-bold">Acquire Now</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader><DialogTitle>Secure Checkout</DialogTitle></DialogHeader>
                                    <PaypalButton amount={total} onSuccess={() => {
                                        setIsCheckoutOpen(false);
                                        toast({ title: "Success!" });
                                        router.push('/profile');
                                    }} />
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}