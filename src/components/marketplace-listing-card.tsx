
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, ShoppingCart, Percent, User, Calendar, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import placeholders from '@/app/lib/placeholder-images.json';

interface MarketplaceListingCardProps {
    listing: {
        id: string;
        hustleName: string;
        description: string;
        price: number;
        category: string;
        location: string;
        flyerUrl?: string;
        logoUrl?: string;
        paypalEmail: string;
        createdAt?: any;
        userId?: string;
    };
}

export function MarketplaceListingCard({ listing }: MarketplaceListingCardProps) {
    const flyerUrl = listing.flyerUrl || placeholders.listings.default.url;
    const dateStr = listing.createdAt?.seconds 
        ? new Date(listing.createdAt.seconds * 1000).toLocaleDateString()
        : 'Recently listed';

    return (
        <Card className="flex flex-col h-full overflow-hidden hover:shadow-2xl transition-all duration-500 group border-primary/10 bg-card/50 backdrop-blur-sm">
            <div className="relative aspect-[16/10] overflow-hidden">
                <Image 
                    src={flyerUrl} 
                    alt={listing.hustleName} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60" />
                <div className="absolute top-3 right-3">
                    <Badge className="font-bold shadow-2xl bg-primary text-primary-foreground px-3 py-1 text-sm border-none">
                        ${listing.price?.toLocaleString()}
                    </Badge>
                </div>
                {listing.logoUrl && (
                    <div className="absolute bottom-3 left-3 h-12 w-12 rounded-xl border border-white/20 shadow-2xl overflow-hidden bg-white/10 backdrop-blur-md">
                         <Image src={listing.logoUrl} alt="Logo" fill className="object-cover p-1" />
                    </div>
                )}
            </div>
            <CardHeader className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-bold py-0.5 px-2 bg-primary/5">{listing.category}</Badge>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                        <MapPin className="h-3 w-3 text-primary"/> 
                        {listing.location || 'Remote'}
                    </div>
                </div>
                <CardTitle className="text-xl line-clamp-1 group-hover:text-primary transition-colors">{listing.hustleName}</CardTitle>
                <CardDescription className="line-clamp-3 text-sm leading-relaxed text-muted-foreground/80">
                    {listing.description}
                </CardDescription>
            </CardHeader>
            <CardFooter className="p-5 pt-0 mt-auto border-t border-primary/5 bg-primary/[0.02]">
                <div className="w-full flex flex-col gap-4 pt-4">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {dateStr}</span>
                        <span className="flex items-center gap-1"><User className="h-3 w-3" /> Expert Creator</span>
                    </div>
                    <Button asChild className="w-full h-12 shadow-xl group-hover:shadow-primary/20 transition-all active:scale-95 touch-manipulation font-bold">
                        <Link href={`/marketplace/listing/${listing.id}`}>
                            View Full Venture
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
