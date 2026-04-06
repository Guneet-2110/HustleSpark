
'use client';

import type { HustleIdea } from '@/ai/flows/generate-hustle-ideas';
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth as useFirebaseInstance, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';

interface UserData {
    email: string;
    isPremium: boolean;
    savedHustles: HustleIdea[];
    premiumExpiresAt?: string | null;
    subscriptionStatus?: string;
}

interface AuthContextType {
  user: UserData | null;
  isLoggedIn: boolean;
  isPremium: boolean;
  generatedHustles: HustleIdea[];
  savedHustles: HustleIdea[];
  isPaymentModalOpen: boolean;
  hasUnsavedChanges: boolean;
  login: (email: string, password?: string) => Promise<string | null>;
  logout: () => void;
  signup: (email: string, password?: string) => Promise<string | null>;
  upgradeToPremium: (days?: number) => void;
  setGeneratedHustles: (hustles: HustleIdea[]) => void;
  saveHustle: (hustle: any) => void;
  unsaveHustle: (hustleName: string) => void;
  setPaymentModalOpen: (isOpen: boolean) => void;
  isHustleSaved: (hustleName: string) => boolean;
  getHustleByName: (hustleName: string) => HustleIdea | undefined;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [generatedHustles, setGeneratedHustlesState] = useState<HustleIdea[]>([]);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const router = useRouter();
  const firebaseAuth = useFirebaseInstance();
  const firestore = useFirestore();

  useEffect(() => {
    let unsubscribeDoc: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(firebaseAuth, (fbUser) => {
      if (fbUser && fbUser.email) {
        const userRef = doc(firestore, 'users', fbUser.uid);
        
        unsubscribeDoc = onSnapshot(userRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data() as UserData;
            const now = new Date();
            const expiryDate = data.premiumExpiresAt ? new Date(data.premiumExpiresAt) : null;
            const premiumStatus = expiryDate ? expiryDate > now : false;

            setUserData({ ...data, isPremium: premiumStatus });
            setIsLoggedIn(true);
            setIsPremium(premiumStatus);
          } else {
            const defaultUser: UserData = {
              email: fbUser.email!,
              isPremium: false,
              savedHustles: []
            };
            setDoc(userRef, {
                ...defaultUser,
                createdAt: serverTimestamp()
            }, { merge: true });
            
            setUserData(defaultUser);
            setIsLoggedIn(true);
            setIsPremium(false);
          }
          setIsInitialized(true);
        }, (error) => {
          console.error("User document subscription error:", error);
          setIsInitialized(true);
        });
      } else {
        if (unsubscribeDoc) unsubscribeDoc();
        setUserData(null);
        setIsLoggedIn(false);
        setIsPremium(false);
        setIsInitialized(true);
      }
    });

    return () => {
        unsubscribeAuth();
        if (unsubscribeDoc) unsubscribeDoc();
    };
  }, [firebaseAuth, firestore]);

  const login = useCallback(async (email: string, password?: string): Promise<string | null> => {
    try {
        await signInWithEmailAndPassword(firebaseAuth, email, password || 'default_pass');
        return null;
    } catch (e: any) {
        return e.message || "Invalid credentials.";
    }
  }, [firebaseAuth]);

  const signup = useCallback(async (email: string, password?: string): Promise<string | null> => {
    try {
        await createUserWithEmailAndPassword(firebaseAuth, email, password || 'default_pass');
        return null;
    } catch (e: any) {
        if (e.code === 'auth/email-already-in-use') {
            return "An account with this email already exists. Please log in.";
        }
        return e.message || "Signup failed.";
    }
  }, [firebaseAuth]);

  const logout = useCallback(async () => {
    try {
        await signOut(firebaseAuth);
    } catch (e) {}
    sessionStorage.clear();
    localStorage.clear();
    setUserData(null);
    setIsLoggedIn(false);
    setIsPremium(false);
    setGeneratedHustlesState([]);
    setHasUnsavedChanges(false);
    router.push('/');
  }, [router, firebaseAuth]);

  const upgradeToPremium = useCallback(async (days = 30) => {
    if (!firebaseAuth.currentUser) return;
    const userRef = doc(firestore, 'users', firebaseAuth.currentUser.uid);
    const snap = await getDoc(userRef);
    const data = snap.data() as UserData;

    const now = new Date();
    const currentExpiry = data?.premiumExpiresAt ? new Date(data.premiumExpiresAt) : now;
    const baseDate = currentExpiry > now ? currentExpiry : now;
    
    const expiry = new Date(baseDate.getTime() + (days * 24 * 60 * 60 * 1000));
    
    await setDoc(userRef, { 
        premiumExpiresAt: expiry.toISOString(),
        subscriptionStatus: 'active'
    }, { merge: true });
  }, [firebaseAuth, firestore]);

  const setGeneratedHustles = useCallback((hustles: HustleIdea[]) => {
    setGeneratedHustlesState(hustles);
  }, []);

  const saveHustle = useCallback(async (hustle: any) => {
    if (!firebaseAuth.currentUser) return;
    const userRef = doc(firestore, 'users', firebaseAuth.currentUser.uid);
    const snap = await getDoc(userRef);
    const data = snap.data();
    const currentSaved = (data?.savedHustles || []) as HustleIdea[];
    
    const exists = currentSaved.some((h: any) => h.name === hustle.name);
    const newSaved = exists
      ? currentSaved.map((h: any) => h.name === hustle.name ? { ...h, ...hustle } : h)
      : [...currentSaved, hustle];
    
    await setDoc(userRef, { savedHustles: newSaved }, { merge: true });
  }, [firebaseAuth, firestore]);

  const unsaveHustle = useCallback(async (hustleName: string) => {
    if (!firebaseAuth.currentUser) return;
    const userRef = doc(firestore, 'users', firebaseAuth.currentUser.uid);
    const snap = await getDoc(userRef);
    const data = snap.data();
    const currentSaved = (data?.savedHustles || []) as HustleIdea[];

    const newSaved = currentSaved.filter((h: any) => h.name !== hustleName);
    await setDoc(userRef, { savedHustles: newSaved }, { merge: true });
  }, [firebaseAuth, firestore]);

  const isHustleSaved = useCallback((name: string) => {
    return (userData?.savedHustles || []).some(h => h.name === name);
  }, [userData]);

  const getHustleByName = useCallback((name: string) => {
    return (userData?.savedHustles || []).find(h => h.name === name);
  }, [userData]);

  // Don't render until Firebase Auth has initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      user: userData, isLoggedIn, isPremium, generatedHustles, 
      savedHustles: userData?.savedHustles || [], 
      isPaymentModalOpen, hasUnsavedChanges, login, logout, signup, 
      upgradeToPremium, setGeneratedHustles, saveHustle, unsaveHustle, 
      setPaymentModalOpen, isHustleSaved, getHustleByName, 
      setHasUnsavedChanges
    }}>
      {children}
    </AuthContext.Provider>
  );
}
