"use client";

import Link from 'next/link';
import { Button } from './ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Sparkles, User, LogOut, Rocket, Store, Clock, ShieldCheck } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { EscrowTrustDialog } from './escrow-trust-dialog';

export function Header() {
  const { isLoggedIn, logout, user, isPremium, hasUnsavedChanges, setHasUnsavedChanges } = useAuth();
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<{days:number, hours:number, minutes:number, seconds:number, total:number} | null>(null);
  const [isEscrowModalOpen, setIsEscrowModalOpen] = useState(false);

  useEffect(() => {
    const calculate = () => {
        if (!user?.premiumExpiresAt) return null;
        const diff = +new Date(user.premiumExpiresAt) - +new Date();
        if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
        return {
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((diff / 1000 / 60) % 60),
            seconds: Math.floor((diff / 1000) % 60),
            total: diff,
        };
    };

    if (isPremium && user?.premiumExpiresAt) {
        // Initial set to avoid delay
        setTimeLeft(calculate());
        const timer = setInterval(() => setTimeLeft(calculate()), 1000);
        return () => clearInterval(timer);
    } else {
        setTimeLeft(null);
    }
  }, [isPremium, user?.premiumExpiresAt]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    if (hasUnsavedChanges) {
       if (!window.confirm('You have unsaved changes that will be lost. Are you sure you want to leave?')) {
           e.preventDefault();
           return;
       }
    }
    setHasUnsavedChanges(false);
    router.push(url);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href={isLoggedIn ? "/profile" : "/"} onClick={(e) => handleLinkClick(e, isLoggedIn ? "/profile" : "/")} className="mr-6 flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-bold">HustleSpark</span>
        </Link>
        <nav className="flex flex-1 items-center space-x-4">
          <Link href="/marketplace" onClick={(e) => handleLinkClick(e, '/marketplace')} className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary flex items-center gap-1">
            <Store className="h-4 w-4" />
            Marketplace
          </Link>
          {isPremium && timeLeft && timeLeft.total > 0 && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary animate-pulse">
                <Clock className="h-3 w-3" />
                <span>{timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s</span>
            </div>
          )}
        </nav>
        <div className="flex items-center justify-end space-x-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsEscrowModalOpen(true)}
            className="flex items-center gap-2 active:scale-95 transition-transform"
          >
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="hidden sm:inline">Escrow Protection</span>
          </Button>
          {isLoggedIn ? (
            <>
              <Button variant="ghost" asChild className="active:scale-95 transition-transform touch-manipulation">
                <Link href="/profile" onClick={(e) => handleLinkClick(e, '/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </Button>
              <Button variant="outline" onClick={handleLogout} className="active:scale-95 transition-transform touch-manipulation">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
             <>
                <Button variant="ghost" asChild className="active:scale-95 transition-transform touch-manipulation">
                    <Link href="/login">Login</Link>
                </Button>
                <Button asChild className="group active:scale-95 transition-transform touch-manipulation hover:shadow-lg hover:shadow-primary/30 transition-shadow duration-300">
                  <Link href="/login?tab=signup">
                    Sign Up
                    <Rocket className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-12"/>
                  </Link>
                </Button>
            </>
          )}
        </div>
      </div>
      <EscrowTrustDialog open={isEscrowModalOpen} onOpenChange={setIsEscrowModalOpen} />
    </header>
  );
}
