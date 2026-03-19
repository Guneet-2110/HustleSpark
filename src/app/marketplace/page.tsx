"use client";

import { useState, useMemo, useTransition, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Search, Filter, MapPin, DollarSign, Sparkles, Loader2, ShoppingBag, Trash2, ShieldCheck, Clock } from 'lucide-react';
import Link from 'next/link';
import { MarketplaceListingCard } from '@/components/marketplace-listing-card';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, orderBy, query, getDocs, deleteDoc, doc, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { EscrowTrustDialog } from '@/components/escrow-trust-dialog';

export default function MarketplacePage() {
    const { isLoggedIn, user } = useAuth();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isResetting, startReset] = useTransition();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [priceRange, setPriceRange] = useState([0, 5000]);
    const [category, setCategory] = useState('all');
    const [location, setLocation] = useState('');
    const [showTrustModal, setShowTrustModal] = useState(false);

    // Show the trust modal on mount
    useEffect(() => {
        const hasSeenTrust = sessionStorage.getItem('hasSeenMarketplaceTrust');
        if (!hasSeenTrust) {
            setShowTrustModal(true);
            sessionStorage.setItem('hasSeenMarketplaceTrust', 'true');
        }
    }, []);

    const isOwner = user?.email === 'guneet.ar2010@gmail.com';
    const isDeveloper = isOwner || user?.email === 'tester@gmail.com';

    const listingsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        
        // Admin sees everything. Public sees only approved.
        if (isDeveloper) {
            return query(
                collection(firestore, 'marketplace_listings'),
                orderBy('createdAt', 'desc')
            );
        }

        // Public query filtered by status='approved'
        return query(
            collection(firestore, 'marketplace_listings'),
            where('status', '==', 'approved'),
            orderBy('createdAt', 'desc')
        );
    }, [firestore, isDeveloper]);

    const { data: rawListings, isLoading } = useCollection(listingsQuery);

    const filteredListings = useMemo(() => {
        if (!rawListings) return [];
        return rawListings.filter(l => {
            const name = l.hustleName || '';
            const desc = l.description || '';
            const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                desc.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesPrice = (l.price || 0) >= priceRange[0] && (l.price || 0) <= priceRange[1];
            const matchesCategory = category === 'all' || l.category === category;
            const matchesLocation = !location || (l.location || '').toLowerCase().includes(location.toLowerCase());
            return matchesSearch && matchesPrice && matchesCategory && matchesLocation;
        });
    }, [rawListings, searchQuery, priceRange, category, location]);

    const handleResetMarketplace = () => {
        if (!firestore || !isOwner) return;
        
        const password = window.prompt("Enter Owner Password to Purge Marketplace:");
        if (password !== '0wNERGun##t') {
            toast({ variant: "destructive", title: "Access Denied", description: "Incorrect owner password." });
            return;
        }

        startReset(async () => {
            try {
                const listingsRef = collection(firestore, 'marketplace_listings');
                const snapshot = await getDocs(listingsRef);
                
                const deletePromises = snapshot.docs.map(listingDoc => 
                    deleteDoc(doc(firestore, 'marketplace_listings', listingDoc.id))
                );
                
                await Promise.all(deletePromises);
                
                toast({
                    title: "Marketplace Purged",
                    description: "All ventures have been successfully removed."
                });
            } catch (error: any) {
                toast({
                    variant: "destructive",
                    title: "Reset Failed",
                    description: error.message || "Could not delete listings."
                });
            }
        });
    };

    return (
        <div className="container py-12">
            <EscrowTrustDialog open={showTrustModal} onOpenChange={setShowTrustModal} />

            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Venture Marketplace</h1>
                    <p className="text-muted-foreground mt-2 text-lg">Acquire ready-to-launch side hustles from our global creator community.</p>
                </div>
                <div className="flex gap-3">
                    {isDeveloper && (
                        <div className="flex gap-2">
                             <Badge variant="outline" className="h-10 px-4 rounded-xl border-primary/30 text-primary font-bold bg-primary/5 flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4" /> Admin Console Active
                             </Badge>
                            {isOwner && (
                                <Button 
                                    variant="destructive" 
                                    onClick={handleResetMarketplace} 
                                    disabled={isResetting}
                                    className="shadow-lg active:scale-95 transition-transform h-10 rounded-xl"
                                >
                                    {isResetting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                    Reset
                                </Button>
                            )}
                        </div>
                    )}
                    {!isLoggedIn && (
                        <Button asChild size="lg" className="shadow-lg active:scale-95 transition-transform">
                            <Link href="/login?tab=signup">Post a Listing</Link>
                        </Button>
                    )}
                </div>
            </div>

            {isDeveloper && rawListings && rawListings.some(l => l.status === 'pending_approval') && (
                <Alert className="mb-8 border-primary/50 bg-primary/5 rounded-[2rem]">
                    <Clock className="h-5 w-5 text-primary" />
                    <AlertTitle className="font-bold">Pending Approvals</AlertTitle>
                    <AlertDescription>
                        There are ventures awaiting your review. Check the listings below marked as "Pending Review".
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid lg:grid-cols-4 gap-8">
                <Card className="lg:col-span-1 h-fit sticky top-20 border-primary/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Filter className="h-5 w-5"/> Filters</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="search">Search Listings</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    id="search" 
                                    placeholder="Keywords..." 
                                    className="pl-9"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                                    <SelectItem value="Creative Services">Creative Services</SelectItem>
                                    <SelectItem value="E-commerce">E-commerce</SelectItem>
                                    <SelectItem value="Education">Education</SelectItem>
                                    <SelectItem value="Home Services">Home Services</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label>Price Range</Label>
                                <span className="text-xs font-mono font-bold text-primary">${priceRange[0]} - ${priceRange[1]}</span>
                            </div>
                            <Slider 
                                defaultValue={[0, 5000]} 
                                max={5000} 
                                step={50} 
                                value={priceRange}
                                onValueChange={setPriceRange}
                                className="py-4"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    id="location" 
                                    placeholder="City or Remote" 
                                    className="pl-9"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                            </div>
                        </div>

                        <Button variant="outline" className="w-full active:scale-95 transition-transform" onClick={() => {
                            setSearchQuery('');
                            setPriceRange([0, 5000]);
                            setCategory('all');
                            setLocation('');
                        }}>
                            Reset All Filters
                        </Button>
                    </CardContent>
                </Card>

                <div className="lg:col-span-3">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-32">
                            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                            <p className="text-muted-foreground animate-pulse font-medium">Curating the finest ventures...</p>
                        </div>
                    ) : filteredListings.length > 0 ? (
                        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredListings.map(listing => (
                                <div key={listing.id} className="relative group">
                                    {isDeveloper && listing.status === 'pending_approval' && (
                                        <Badge className="absolute top-2 left-2 z-10 bg-orange-500 text-white border-none shadow-xl animate-pulse">
                                            Pending Review
                                        </Badge>
                                    )}
                                    <MarketplaceListingCard listing={listing as any} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-32 border-2 border-dashed rounded-3xl bg-muted/20 border-primary/10">
                            <Sparkles className="h-16 w-16 text-primary/30 mx-auto mb-6" />
                            <h3 className="text-2xl font-bold">No ventures found</h3>
                            <p className="text-muted-foreground mt-2 max-w-xs mx-auto">Try adjusting your search filters or generate your own hustle to list it here!</p>
                        </div>
                    )}
                </div>
            </div>

            <section className="mt-24 py-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-[3rem] border border-primary/10 overflow-hidden relative shadow-2xl">
                <div className="container px-12 flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
                    <div className="max-w-xl">
                        <h2 className="text-4xl font-bold mb-6">Monetize Your Business Blueprints</h2>
                        <p className="text-muted-foreground text-xl mb-8 leading-relaxed">
                            Have you perfected a side hustle? List your strategy, branding, and action plans on our marketplace and keep 90% of every sale.
                        </p>
                        <Button size="lg" className="shadow-2xl h-14 px-10 text-lg active:scale-95 transition-transform" asChild>
                            <Link href="/profile">Post Your Listing Now</Link>
                        </Button>
                    </div>
                    <div className="hidden md:block">
                        <div className="relative h-64 w-64">
                             <DollarSign className="h-48 w-48 text-primary opacity-20 absolute top-0 left-0 animate-bounce" />
                             <ShoppingBag className="h-32 w-32 text-accent opacity-20 absolute bottom-0 right-0 animate-pulse" />
                        </div>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 blur-[120px] -z-0 rounded-full translate-x-1/2 -translate-y-1/2" />
            </section>
        </div>
    );
}
