'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';
import { slugify } from '@/lib/utils';
import type { HustleIdea } from '@/ai/flows/generate-hustle-ideas';
import { useAuth } from '@/hooks/use-auth';

interface HustleCardProps {
  hustle: HustleIdea;
}

export function HustleCard({ hustle }: HustleCardProps) {
  const slug = slugify(hustle.name);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const router = useRouter();
  const { savedHustles, isPremium, saveHustle } = useAuth();

  const alreadySaved = savedHustles?.some(h => h.name === hustle.name);

  const handleHustleClick = (e: React.MouseEvent) => {
    // If already saved just navigate
    if (alreadySaved) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('currentHustle', JSON.stringify(hustle));
      }
      return;
    }
    // If free user and no hustle saved yet — show confirmation before saving
    if (!isPremium && (!savedHustles || savedHustles.length === 0)) {
      e.preventDefault();
      setShowConfirm(true);
      return;
    }
    // Premium users just navigate
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('currentHustle', JSON.stringify(hustle));
    }
  };

  const handleConfirm = async () => {
    await saveHustle(hustle);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('currentHustle', JSON.stringify(hustle));
    }
    setShowConfirm(false);
    router.push(`/hustle/${slug}`);
  };

  return (
    <>
      <Link href={`/hustle/${slug}`} onClick={handleHustleClick} className="block h-full">
        <Card className="h-full flex flex-col transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/20">
          <CardHeader className="flex-grow">
            <CardTitle className="text-xl">{hustle.name}</CardTitle>
            <CardDescription className="pt-2">{hustle.description}</CardDescription>
          </CardHeader>
          <CardFooter>
            <div className="flex items-center text-sm font-medium text-primary">
              Explore Idea
              <ArrowRight className="ml-2 h-4 w-4" />
            </div>
          </CardFooter>
        </Card>
      </Link>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-[2.5rem] shadow-2xl border border-primary/20 p-8 max-w-md w-full space-y-4">
            <div className="text-center space-y-2">
              <p className="text-3xl">⚠️</p>
              <h3 className="text-xl font-black">This is a one-time choice!</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                As a free user you can only pick <span className="font-black text-foreground">one hustle</span>. Once you select <span className="font-black text-foreground">"{hustle.name}"</span> the other ideas will be removed and you cannot go back. Choose wisely!
              </p>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-3 text-center">
              <p className="text-[11px] font-black text-orange-600">Upgrade to Premium to save and work on unlimited hustles at the same time.</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-2xl font-bold" onClick={() => setShowConfirm(false)}>
                Go Back
              </Button>
              <Button className="flex-1 rounded-2xl font-black" onClick={handleConfirm}>
                Yes, Pick This Hustle
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
