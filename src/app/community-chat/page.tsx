
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
      try {
        setLoading(true);
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
    <div className="container mx-auto px-4 py-8 md:py-12 flex flex-col flex-grow">
      <div className="max-w-4xl mx-auto w-full flex flex-col flex-grow">
        <Card className="flex flex-col flex-grow h-full">
          <CardHeader className="border-b">
            <CardTitle className="text-3xl font-headline flex items-center gap-3">
              <MessagesSquare className="h-7 w-7 text-primary" />
              Community Live Chat
            </CardTitle>
            <CardDescription>
              Welcome! This is a shared space for all users to connect and chat in real-time.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col flex-grow space-y-4 overflow-hidden p-4">
            <div className="flex-grow overflow-hidden">
              <ChatRoom roomId={COMMUNITY_ROOM_ID} currentUserId={currentUser?.id} />
            </div>

            <div className="pt-2">
              {loading ? (
                <Skeleton className="h-10 w-full" />
              ) : currentUser ? (
                <MessageInput
                  roomId={COMMUNITY_ROOM_ID}
                  userId={currentUser.id}
                  username={currentUser.username}
                />
              ) : (
                <div className="text-center text-sm text-muted-foreground">
                  <Link href="/signin" className="text-primary underline">
                    Sign in
                  </Link>{' '}
                  to join the conversation.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
