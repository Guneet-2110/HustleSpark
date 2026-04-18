"use client";

import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, orderBy, limit, onSnapshot, updateDoc, doc, writeBatch } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    link: string;
    read: boolean;
    createdAt: any;
}

export function NotificationsBell() {
    const firestore = useFirestore();
    const { user } = useUser();
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        if (!firestore || !user) return;
        const q = query(
            collection(firestore, 'notifications'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc'),
            limit(20)
        );
        const unsub = onSnapshot(q, (snap) => {
            setNotifications(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification)));
        });
        return () => unsub();
    }, [firestore, user]);

    // Close on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleOpen = async () => {
        setOpen(!open);
        // Mark all as read when opening
        if (!open && unreadCount > 0 && firestore && user) {
            const batch = writeBatch(firestore);
            notifications.filter(n => !n.read).forEach(n => {
                batch.update(doc(firestore, 'notifications', n.id), { read: true });
            });
            await batch.commit();
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        setOpen(false);
        router.push(notification.link);
    };

    const getIcon = (type: string) => {
        const icons: Record<string, string> = {
            purchase: '💰',
            delivery: '📦',
            confirmation: '✅',
            dispute: '⚠️',
            approved: '🚀',
            message: '💬',
            review: '⭐',
        };
        return icons[type] || '🔔';
    };

    const formatTime = (ts: any) => {
        if (!ts?.toDate) return '';
        const diff = Date.now() - ts.toDate().getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    if (!user) return null;

    return (
        <div ref={ref} className="relative">
            <button
                onClick={handleOpen}
                className="relative p-2 rounded-xl hover:bg-muted transition-colors"
            >
                <Bell className="h-5 w-5 text-muted-foreground" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-12 w-80 bg-background border rounded-2xl shadow-2xl z-50 overflow-hidden">
                    <div className="p-4 border-b flex items-center justify-between">
                        <p className="font-black text-sm">Notifications</p>
                        {unreadCount > 0 && (
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                                {unreadCount} new
                            </span>
                        )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <Bell className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <button
                                    key={n.id}
                                    onClick={() => handleNotificationClick(n)}
                                    className={`w-full text-left p-4 border-b last:border-0 hover:bg-muted/50 transition-colors ${!n.read ? 'bg-primary/5' : ''}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-xl shrink-0">{getIcon(n.type)}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm truncate">{n.title}</p>
                                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.message}</p>
                                            <p className="text-[10px] text-muted-foreground/60 mt-1">{formatTime(n.createdAt)}</p>
                                        </div>
                                        {!n.read && (
                                            <div className="h-2 w-2 bg-primary rounded-full shrink-0 mt-1" />
                                        )}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}