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
  signup: (email: string, password?: string, extraData?: { dateOfBirth?: string, isMinor?: boolean }) => Promise<string | null>;
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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const router = useRouter();
  const firebaseAuth = useFirebaseInstance();
  const firestore = useFirestore();

  useEffect(() => {
    let unsubscribeDoc: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(firebaseAuth, (fbUser) => {
      if (fbUser && fbUser.email && fbUser.emailVerified) {
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
        }, (error) => {
          console.error("User document subscription error:", error);
        });
      } else {
        if (unsubscribeDoc) unsubscribeDoc();
        setUserData(null);
        setIsLoggedIn(false);
        setIsPremium(false);
      }
    });

    return () => {
        unsubscribeAuth();
        if (unsubscribeDoc) unsubscribeDoc();
    };
  }, [firebaseAuth, firestore]);

  const login = useCallback(async (email: string, password?: string): Promise<string | null> => {
    try {
        const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password || 'default_pass');
        if (!userCredential.user.emailVerified) {
            await signOut(firebaseAuth);
            return "EMAIL_NOT_VERIFIED";
        }
        return null;
    } catch (e: any) {
        return e.message || "Invalid credentials.";
    }
  }, [firebaseAuth]);

  const signup = useCallback(async (email: string, password?: string, extraData?: { dateOfBirth?: string, isMinor?: boolean }): Promise<string | null> => {
    try {
        const { sendEmailVerification } = await import('firebase/auth');
        const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password || 'default_pass');
        
        const userRef = doc(firestore, 'users', userCredential.user.uid);
        const referralCode = typeof window !== 'undefined' ? localStorage.getItem('referralCode') : null;
        await setDoc(userRef, {
            email: email,
            isPremium: false,
            savedHustles: [],
            createdAt: serverTimestamp(),
            ...(extraData?.dateOfBirth && { dateOfBirth: extraData.dateOfBirth }),
            ...(extraData?.isMinor !== undefined && { isMinor: extraData.isMinor }),
            ...(referralCode && { referredBy: referralCode, firstPurchaseCredited: false }),
        }, { merge: true });
        if (referralCode) {
            try {
                const { collection: col, query: q, where: w, getDocs: gd, updateDoc: ud, doc: d } = await import('firebase/firestore');
                const snap = await gd(q(col(firestore, 'referral_links'), w('code', '==', referralCode)));
                if (!snap.empty) {
                    await ud(d(firestore, 'referral_links', snap.docs[0].id), {
                        signups: (snap.docs[0].data().signups || 0) + 1
                    });
                }
            } catch (e) {
                console.error('Referral signup tracking error:', e);
            }
        }
        await sendEmailVerification(userCredential.user);
        await signOut(firebaseAuth);
        return "VERIFY_EMAIL";
    } catch (e: any) {
        if (e.code === 'auth/email-already-in-use') {
            return "An account with this email already exists. Please log in.";
        }
        return e.message || "Signup failed.";
    }
  }, [firebaseAuth, firestore]);

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

  // Credit referral on first purchase only
  if (data?.referredBy && data?.firstPurchaseCredited === false) {
      try {
          const { collection: col, query: q, where: w, getDocs: gd, updateDoc: ud, doc: d } = await import('firebase/firestore');
          const refSnap = await gd(q(col(firestore, 'referral_links'), w('code', '==', data.referredBy)));
          if (!refSnap.empty) {
              const linkDoc = refSnap.docs[0];
              const purchaseAmount = days === 30 ? 15 : days === 60 ? 30 : days === 90 ? 45 : 60;
              const commission = purchaseAmount * 0.10;
              await ud(d(firestore, 'referral_links', linkDoc.id), {
                  totalRevenue: (linkDoc.data().totalRevenue || 0) + purchaseAmount,
                  payoutDue: (linkDoc.data().payoutDue || 0) + commission,
                  conversions: (linkDoc.data().conversions || 0) + 1,
              });
              await setDoc(userRef, { firstPurchaseCredited: true }, { merge: true });
          }
      } catch (e) {
          console.error('Referral commission error:', e);
      }
  }
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
