"use client";

import { useParams, useRouter } from 'next/navigation';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { ChatBox } from '@/components/chat-box';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageCircle, Loader2 } from 'lucide-react';
import { doc } from 'firebase/firestore';
import { useEffect } from 'react';

export default function ChatPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const chatId = params.chatId as string;

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login');
        }
    }, [user, isUserLoading, router]);

    const chatDocRef = useMemoFirebase(() => {
        if (!firestore || !chatId) return null;
        return doc(firestore, 'chats', chatId);
    }, [firestore, chatId]);

    const { data: chat, isLoading: isChatLoading } = useDoc(chatDocRef);

    if (isUserLoading || isChatLoading) {
        return (
            <div className="container py-32 text-center space-y-4">
                <Loader2 className="animate-spin h-10 w-10 mx-auto text-primary" />
                <p className="font-black text-muted-foreground uppercase tracking-widest text-xs">Opening Secure Channel...</p>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    if (!chat) {
        return (
            <div className="container py-20 text-center">
                <h2 className="text-2xl font-bold">Conversation not found</h2>
                <Button variant="link" onClick={() => router.push('/profile')}>Back to Profile</Button>
            </div>
        );
    }

    return (
        <div className="container py-4 md:py-8 max-w-5xl h-[calc(100vh-80px)] flex flex-col">
            <div className="flex flex-shrink-0 items-center gap-4 mb-4 md:mb-6">
                <Button variant="ghost" size="icon" onClick={() => router.push('/profile')} className="rounded-full hover:bg-primary/10">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="min-w-0">
                    <h1 className="text-lg md:text-2xl font-black flex items-center gap-2 truncate">
                        <MessageCircle className="h-5 w-5 md:h-6 md:w-6 text-primary flex-shrink-0" />
                        <span className="truncate">{chat.hustleName}</span>
                    </h1>
                    <p className="text-[9px] md:text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                        Escrow Protected Support
                    </p>
                </div>
            </div>

            <div className="flex-1 min-h-0">
                <ChatBox chatId={chatId} currentUserId={user.uid} />
            </div>
        </div>
    );
}