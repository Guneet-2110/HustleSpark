
"use client";

import { useDoc, useFirestore, useMemoFirebase, useAuth } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, ArrowLeft, Rocket, Check, MessageSquare, ArrowRight, Briefcase, Target, Globe, Heart } from 'lucide-react';
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
    const { user } = useAuth();
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    const listingId = params.id as string;
    
    const memoizedDocRef = useMemoFirebase(() => {
        if (!firestore || !listingId) return null;
        return doc(firestore, 'marketplace_listings', listingId);
    }, [firestore, listingId]);

    const { data: listing, isLoading } = useDoc(memoizedDocRef);

    const handleAcquisitionSuccess = async () => {
        setIsCheckoutOpen(false);
        if (firestore && user && listing) {
            // Initialize chat between buyer and seller
            const chatId = `${listingId}_${user.uid}`;
            const chatRef = doc(firestore, 'chats', chatId);
            
            await setDoc(chatRef, {
                listingId,
                hustleName: listing.hustleName,
                buyerId: user.uid,
                sellerId: listing.userId,
                updatedAt: serverTimestamp(),
                lastMessage: 'Venture acquired! Start the conversation.'
            }, { merge: true });

            toast({ 
                title: "Venture Acquired!", 
                description: "Transaction initialized. Communication channel opened." 
            });
            router.push(`/chats/${chatId}`);
        } else {
            router.push('/profile');
        }
    };

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
            <Button variant="ghost" onClick={() => router.back()} className="mb-8 rounded-full group">
                <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Marketplace
            </Button>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="relative aspect-video rounded-[2.5rem] overflow-hidden border shadow-2xl">
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
                                        <MapPin className="h-3 w-3" /> {listing.location}
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
                                    <Globe className="h-4 w-4" /> About Us
                                </h4>
                                <p className="text-lg text-muted-foreground leading-relaxed italic">"{listing.pitch}"</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8 pt-8 border-t">
                                <div className="space-y-3">
                                    <h4 className="font-black text-xs uppercase tracking-widest text-primary flex items-center gap-2">
                                        <Briefcase className="h-4 w-4" /> What We Do
                                    </h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{listing.experience}</p>
                                </div>
                                <div className="space-y-3">
                                    <h4 className="font-black text-xs uppercase tracking-widest text-primary flex items-center gap-2">
                                        <Heart className="h-4 w-4" /> Our Goal
                                    </h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{listing.whoIHelp}</p>
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
                                    <Button className="w-full h-16 text-xl font-black rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-95 group">
                                        Acquire Now
                                        <ArrowRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="rounded-[2.5rem]">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl font-black">Secure Handshake</DialogTitle>
                                        <DialogDescription className="font-medium">
                                            You are acquiring "<span className="text-primary">{listing.hustleName}</span>". Funds will be held in escrow until delivery.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <PaypalButton 
                                     amount={total} 
                                     payeeEmail={listing.paypalEmail}
                                     listingId={listingId}
                                     sellerId={listing.userId}
                                     hustleName={listing.hustleName}
                                     onSuccess={handleAcquisitionSuccess} 
                                    />
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
