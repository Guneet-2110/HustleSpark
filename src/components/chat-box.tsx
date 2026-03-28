
"use client";

import { useState, useRef, useEffect } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, User as UserIcon, Loader2, ShieldCheck } from 'lucide-react';

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
        addDoc(messagesRef, {
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
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Loading secure channel...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-card rounded-[2.5rem] border shadow-2xl overflow-hidden border-primary/20">
            <div className="flex-shrink-0 bg-primary/5 px-6 py-3 border-b border-primary/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Escrow Protected Conversation</span>
                </div>
                <Badge variant="outline" className="text-[8px] border-green-500/30 text-green-500 font-black uppercase">Encrypted</Badge>
            </div>
            
            <div className="flex-1 min-h-0 relative">
                <ScrollArea className="h-full w-full">
                    <div className="p-6 space-y-4">
                        {messages?.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-2xl p-4 text-sm shadow-sm ${
                                        msg.senderId === currentUserId
                                            ? 'bg-primary text-primary-foreground rounded-tr-none'
                                            : msg.senderId === 'system' 
                                                ? 'bg-accent/10 border border-accent/20 text-accent font-bold italic text-center w-full max-w-none'
                                                : 'bg-muted rounded-tl-none'
                                    }`}
                                >
                                    <p className="leading-relaxed break-words">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>
            </div>

            <form onSubmit={handleSendMessage} className="flex-shrink-0 p-6 bg-muted/30 border-t flex gap-3">
                <Input
                    placeholder="Ask a question or provide delivery info..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="h-14 rounded-2xl bg-background shadow-inner border-2 focus:ring-primary"
                />
                <Button type="submit" size="icon" className="h-14 w-14 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 flex-shrink-0" disabled={!newMessage.trim()}>
                    <Send className="h-6 w-6" />
                </Button>
            </form>
        </div>
    );
}
