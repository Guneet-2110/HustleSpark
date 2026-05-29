import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

export type HustleTier = {
    label: string;
    badge: string;
    color: string;
    min: number;
    max: number;
};

export const HUSTLE_TIERS: HustleTier[] = [
    { label: 'Starter', badge: '🥉', color: 'text-orange-400', min: 0, max: 299 },
    { label: 'Rising Hustler', badge: '🥈', color: 'text-slate-400', min: 300, max: 599 },
    { label: 'Pro Hustler', badge: '🥇', color: 'text-yellow-500', min: 600, max: 849 },
    { label: 'Elite Hustler', badge: '💎', color: 'text-cyan-400', min: 850, max: 1000 },
];

export function getTier(score: number): HustleTier {
    return HUSTLE_TIERS.find(t => score >= t.min && score <= t.max) || HUSTLE_TIERS[0];
}

export function useHustleScore(userId: string | undefined, hustles: any[]) {
    const firestore = useFirestore();
    const [score, setScore] = useState(0);
    const [breakdown, setBreakdown] = useState({
        sales: 0,
        reviews: 0,
        roadmap: 0,
        daysActive: 0,
        disputes: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!firestore || !userId) {
            setIsLoading(false);
            return;
        }

        const calculate = async () => {
            setIsLoading(true);
            try {
                // 1. SALES — 30pts per completed sale, max 300
                const salesSnap = await getDocs(
                    query(collection(firestore, 'transactions'),
                        where('sellerId', '==', userId),
                        where('status', '==', 'completed')
                    )
                );
                const salesScore = Math.min(salesSnap.size * 30, 300);

                // 2. REVIEWS — avg rating * 40, max 200
                const reviewsSnap = await getDocs(
                    query(collection(firestore, 'reviews'), where('sellerId', '==', userId))
                );
                let reviewsScore = 0;
                if (reviewsSnap.size > 0) {
                    const avgRating = reviewsSnap.docs.reduce((sum, d) => sum + (d.data().rating || 0), 0) / reviewsSnap.size;
                    reviewsScore = Math.min(Math.round(avgRating * 40), 200);
                }

                // 3. ROADMAP — avg completion % across all saved hustles * 150
                let roadmapScore = 0;
                if (hustles.length > 0) {
                    const totalProgress = hustles.reduce((sum, h) => sum + (h.trackerData?.progress || 0), 0);
                    const avgProgress = totalProgress / hustles.length;
                    roadmapScore = Math.min(Math.round((avgProgress / 100) * 150), 150);
                }

                // 4. DAYS ACTIVE — 1pt per day since first hustle saved, max 150
                let daysScore = 0;
                const startDates = hustles
                    .filter(h => h.trackerData?.startedAt)
                    .map(h => new Date(h.trackerData.startedAt).getTime());
                if (startDates.length > 0) {
                    const earliest = Math.min(...startDates);
                    const days = Math.floor((Date.now() - earliest) / (1000 * 60 * 60 * 24));
                    daysScore = Math.min(days, 150);
                }

                // 5. DISPUTES — -50 per lost dispute, max penalty 100
                const disputesSnap = await getDocs(
                    query(collection(firestore, 'transactions'),
                        where('sellerId', '==', userId),
                        where('status', '==', 'disputed')
                    )
                );
                const disputePenalty = Math.min(disputesSnap.size * 50, 100);

                const total = Math.max(0, salesScore + reviewsScore + roadmapScore + daysScore - disputePenalty);

                setScore(Math.min(total, 1000));
                setBreakdown({
                    sales: salesScore,
                    reviews: reviewsScore,
                    roadmap: roadmapScore,
                    daysActive: daysScore,
                    disputes: -disputePenalty,
                });
            } catch (e) {
                console.error('Hustle score error:', e);
            } finally {
                setIsLoading(false);
            }
        };

        calculate();
    }, [firestore, userId, hustles.length]);

    return { score, breakdown, tier: getTier(score), isLoading };
}