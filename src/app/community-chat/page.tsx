
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { User } from '@/lib/types';
import { getAppwriteUser, mapAppwriteUserToUser } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChatRoom } from '@/components/chat/chat-room';
import { MessageInput } from '@/components/chat/message-input';
import { MessagesSquare } from 'lucide-react';

const COMMUNITY_ROOM_ID = 'general-community-chat';

export default function CommunityChatPage() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            setLoading(true);
            try {
                const appwriteUser = await getAppwriteUser();
                if (appwriteUser) {
                    const mappedUser = await mapAppwriteUserToUser(appwriteUser);
                    setCurrentUser(mappedUser);
                }
            } catch (error) {
                console.error("Failed to fetch current user", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCurrentUser();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8 md:py-12 flex-grow flex flex-col">
           <div className="max-w-4xl mx-auto w-full flex-grow flex flex-col">
             <Card className="flex-grow flex flex-col">
                <CardHeader>
                    <CardTitle className="text-3xl font-headline flex items-center gap-3">
                        <MessagesSquare className="h-8 w-8 text-primary" />
                        Community Live Chat
                    </CardTitle>
                    <CardDescription>
                        Welcome! This is a shared space for all users to connect and chat in real-time.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col">
                    <div className="flex-grow mb-4">
                        <ChatRoom roomId={COMMUNITY_ROOM_ID} />
                    </div>
                    {loading ? (
                        <Skeleton className="h-10 w-full" />
                    ) : currentUser ? (
                        <MessageInput 
                            roomId={COMMUNITY_ROOM_ID} 
                            userId={currentUser.id} 
                            username={currentUser.username} 
                        />
                    ) : (
                        <div className="text-center text-sm text-muted-foreground pt-4">
                            <Link href="/signin" className="text-primary underline">Sign in</Link> to join the conversation.
                        </div>
                    )}
                </CardContent>
             </Card>
           </div>
        </div>
    );
}
