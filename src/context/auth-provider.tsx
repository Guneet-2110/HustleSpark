
'use client';

import type { HustleIdea } from '@/ai/flows/generate-hustle-ideas';
import React, { createContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth as useFirebaseInstance } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

interface User {
    email: string;
    isPremium: boolean;
    savedHustles: HustleIdea[];
    premiumExpiresAt?: string | null;
}

interface UserRecord {
    passwordHash: string;
    user: User;
}

interface AuthContextType {
  user: User | null;
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
  doesUserExist: (email: string) => boolean;
  getHustleByName: (hustleName: string) => HustleIdea | undefined;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

const USERS_STORAGE_KEY = 'hustleSparkUsers_v2';

// Helper to interact with local user cache
const getUsersFromStorage = (): Record<string, UserRecord> => {
    try {
        if (typeof window === 'undefined') return {};
        const storedData = localStorage.getItem(USERS_STORAGE_KEY);
        return storedData ? JSON.parse(storedData) : {};
    } catch (error) {
        return {};
    }
}

const saveUsersToStorage = (users: Record<string, UserRecord>) => {
    try {
        if (typeof window === 'undefined') return;
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (error) {}
}

/**
 * AuthProvider - Manages user state and synchronization.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [generatedHustles, setGeneratedHustlesState] = useState<HustleIdea[]>([]);
  const [savedHustles, setSavedHustles] = useState<HustleIdea[]>([]);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const router = useRouter();
  const firebaseAuth = useFirebaseInstance();
  
  const userRef = useRef<User | null>(null);
  userRef.current = user;

  const syncStateFromUser = useCallback((userData: User | null) => {
    if (!userData) {
      setUser(null);
      setIsLoggedIn(false);
      setIsPremium(false);
      setSavedHustles([]);
      return;
    }

    const now = new Date();
    const expiryDate = userData.premiumExpiresAt ? new Date(userData.premiumExpiresAt) : null;
    const premiumStatus = expiryDate ? expiryDate > now : false;

    const mergedUser = { ...userData, isPremium: premiumStatus };
    setUser(mergedUser);
    setIsLoggedIn(true);
    setIsPremium(premiumStatus);
    setSavedHustles(userData.savedHustles || []);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (fbUser) => {
        if (fbUser && fbUser.email) {
            const users = getUsersFromStorage();
            const userRecord = users[fbUser.email];
            if (userRecord) {
                syncStateFromUser(userRecord.user);
            } else {
                const newUser: User = { email: fbUser.email, isPremium: false, savedHustles: [] };
                users[fbUser.email] = { passwordHash: '', user: newUser };
                saveUsersToStorage(users);
                syncStateFromUser(newUser);
            }
        } else {
            syncStateFromUser(null);
        }
        setIsInitialized(true);
    });
    return () => unsubscribe();
  }, [firebaseAuth, syncStateFromUser]);

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
        return e.message || "Signup failed.";
    }
  }, [firebaseAuth]);

  const logout = useCallback(async () => {
    try {
        await signOut(firebaseAuth);
    } catch (e) {}
    // Clear session but leave localStorage for user profiles (which mimics a real DB for this demo)
    sessionStorage.clear();
    setUser(null);
    setIsLoggedIn(false);
    setIsPremium(false);
    setSavedHustles([]);
    setGeneratedHustlesState([]);
    setHasUnsavedChanges(false);
    router.push('/');
  }, [router, firebaseAuth]);

  const upgradeToPremium = useCallback((days = 30) => {
    const currentUser = userRef.current;
    if (currentUser) {
        const users = getUsersFromStorage();
        const now = new Date();
        const expiry = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
        const updatedUser = { ...currentUser, premiumExpiresAt: expiry.toISOString(), isPremium: true };
        if (users[currentUser.email]) {
            users[currentUser.email].user = updatedUser;
            saveUsersToStorage(users);
        }
        syncStateFromUser(updatedUser);
    }
  }, [syncStateFromUser]);

  const setGeneratedHustles = useCallback((hustles: HustleIdea[]) => {
    setGeneratedHustlesState(hustles);
  }, []);

  const isHustleSaved = useCallback((name: string) => {
    return savedHustles.some(h => h.name === name);
  }, [savedHustles]);

  const saveHustle = useCallback((hustle: any) => {
    const currentUser = userRef.current;
    if (!currentUser) return;
    const users = getUsersFromStorage();
    if (!users[currentUser.email]) return;

    const currentSaved = users[currentUser.email].user.savedHustles || [];
    const exists = currentSaved.some((h: any) => h.name === hustle.name);
    
    const newSaved = exists
      ? currentSaved.map((h: any) => h.name === hustle.name ? { ...h, ...hustle } : h)
      : [...currentSaved, hustle];
    
    const updatedUser = { ...users[currentUser.email].user, savedHustles: newSaved };
    users[currentUser.email].user = updatedUser;
    saveUsersToStorage(users);
    syncStateFromUser(updatedUser);
  }, [syncStateFromUser]);

  const unsaveHustle = useCallback((hustleName: string) => {
    const currentUser = userRef.current;
    if (!currentUser) return;
    const users = getUsersFromStorage();
    if (!users[currentUser.email]) return;

    const newSaved = (users[currentUser.email].user.savedHustles || []).filter((h: any) => h.name !== hustleName);
    const updatedUser = { ...users[currentUser.email].user, savedHustles: newSaved };
    users[currentUser.email].user = updatedUser;
    saveUsersToStorage(users);
    syncStateFromUser(updatedUser);
  }, [syncStateFromUser]);

  const getHustleByName = useCallback((name: string) => {
    return savedHustles.find(h => h.name === name);
  }, [savedHustles]);

  const doesUserExist = useCallback((email: string) => {
    return !!getUsersFromStorage()[email];
  }, []);

  if (!isInitialized) return null;

  return (
    <AuthContext.Provider value={{
      user, isLoggedIn, isPremium, generatedHustles, savedHustles, 
      isPaymentModalOpen, hasUnsavedChanges, login, logout, signup, 
      upgradeToPremium, setGeneratedHustles, saveHustle, unsaveHustle, 
      setPaymentModalOpen, isHustleSaved, doesUserExist, getHustleByName, 
      setHasUnsavedChanges
    }}>
      {children}
    </AuthContext.Provider>
  );
}
