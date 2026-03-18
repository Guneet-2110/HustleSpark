
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import { ChatBox } from '@/components/chat-box';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

export default function ChatPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isUserLoading } = useAuth();
    const firestore = useFirestore();
    const chatId = params.chatId as string;

    const chatDocRef = useMemoFirebase(() => {
        if (!firestore || !chatId) return null;
        return doc(firestore, 'chats', chatId);
    }, [firestore, chatId]);

    const { data: chat, isLoading: isChatLoading } = useDoc(chatDocRef);

    if (isUserLoading || isChatLoading) {
        return <div className="container py-20 text-center">Loading conversation...</div>;
    }

    if (!user) {
        router.push('/login');
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
        <div className="container py-12 max-w-4xl h-[calc(100vh-140px)] flex flex-col">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" onClick={() => router.push('/profile')} className="rounded-full">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-black flex items-center gap-2">
                        <MessageCircle className="h-6 w-6 text-primary" />
                        {chat.hustleName}
                    </h1>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                        Live Venture Support
                    </p>
                </div>
            </div>

            <div className="flex-1 min-h-0">
                <ChatBox chatId={chatId} currentUserId={user.uid} />
            </div>
        </div>
    );
}
