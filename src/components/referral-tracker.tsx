'use client';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useFirestore } from '@/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

export function ReferralTracker() {
    const searchParams = useSearchParams();
    const firestore = useFirestore();

    useEffect(() => {
        const ref = searchParams.get('ref');
        if (ref) {
            localStorage.setItem('referralCode', ref);
            if (firestore) {
                const trackClick = async () => {
                    try {
                        const snap = await getDocs(
                            query(collection(firestore, 'referral_links'), where('code', '==', ref))
                        );
                        if (!snap.empty) {
                            const linkDoc = snap.docs[0];
                            await updateDoc(doc(firestore, 'referral_links', linkDoc.id), {
                                clicks: (linkDoc.data().clicks || 0) + 1
                            });
                        }
                    } catch (e) {
                        console.error('Referral tracking error:', e);
                    }
                };
                trackClick();
            }
        }
    }, [searchParams, firestore]);

    return null;
}
