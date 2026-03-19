
"use client";

import { useState, useRef, useEffect } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, User as UserIcon, Loader2 } from 'lucide-react';

interface ChatBoxProps {
    chatId: string;
    currentUserId: string;
}

export function ChatBox({ chatId, currentUserId }: ChatBoxProps) {
    const firestore = useFirestore();
    const [newMessage, setNewMessage] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    const messagesQuery = useMemoFirebase(() => {
        if (!firestore || !chatId) return null;
        return query(
            collection(firestore, 'chats', chatId, 'messages'),
            orderBy('createdAt', 'asc')
        );
    }, [firestore, chatId]);

    const { data: messages, isLoading } = useCollection(messagesQuery);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim() || !firestore) return;

        const messageText = newMessage;
        setNewMessage('');

        const messagesRef = collection(firestore, 'chats', chatId, 'messages');
        const chatRef = doc(firestore, 'chats', chatId);

        // Add message
        await addDoc(messagesRef, {
            text: messageText,
            senderId: currentUserId,
            createdAt: serverTimestamp()
        });

        // Update last message in parent doc
        updateDoc(chatRef, {
            lastMessage: messageText,
            updatedAt: serverTimestamp()
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-card rounded-3xl border shadow-xl overflow-hidden">
            <ScrollArea className="flex-1 p-6">
                <div className="space-y-4">
                    {messages?.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-2xl p-4 text-sm shadow-sm ${
                                    msg.senderId === currentUserId
                                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                                        : 'bg-muted rounded-tl-none'
                                }`}
                            >
                                <p className="leading-relaxed">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            <form onSubmit={handleSendMessage} className="p-4 bg-muted/30 border-t flex gap-2">
                <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="h-12 rounded-2xl bg-background shadow-inner border-2"
                />
                <Button type="submit" size="icon" className="h-12 w-12 rounded-2xl shadow-lg transition-all hover:scale-105" disabled={!newMessage.trim()}>
                    <Send className="h-5 w-5" />
                </Button>
            </form>
        </div>
    );
}
