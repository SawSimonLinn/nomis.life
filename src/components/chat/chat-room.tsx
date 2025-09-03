
'use client';

import { useState, useEffect, useRef } from 'react';
import { getMessages, subscribeToRoom, ChatMessage } from '@/lib/chat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ChatRoomProps {
  roomId: string;
  currentUserId?: string;
}

export function ChatRoom({ roomId, currentUserId }: ChatRoomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      const initialMessages = await getMessages(roomId);
      setMessages(initialMessages);
      setLoading(false);
    };

    fetchMessages();

    const handleNewMessage = (newMessage: ChatMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    };

    const unsubscribe = subscribeToRoom(roomId, handleNewMessage);

    return () => {
      unsubscribe();
    };
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-12 w-1/2 ml-auto" />
        <Skeleton className="h-12 w-2/3" />
      </div>
    );
  }

  return (
    <div className="space-y-4 h-[50vh] overflow-y-auto w-full px-2">
      {messages.length === 0 ? (
        <div className="text-center text-muted-foreground">
          No messages yet. Be the first to say something!
        </div>
      ) : (
        messages.map((msg) => {
          const isCurrentUser = msg.userId === currentUserId;
          return (
            <div
              key={msg.$id}
              className={cn(
                'flex items-start gap-3 animate-fade-in-up',
                isCurrentUser && 'justify-end flex-row-reverse'
              )}
            >
              <Link href={`/${msg.username}`}>
                <Avatar className="h-8 w-8 border">
                   <AvatarImage src={`https://github.com/${msg.username}.png`} alt={msg.username} />
                  <AvatarFallback>
                    {msg.username?.charAt(0).toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className={cn('flex-1 min-w-0', isCurrentUser && 'text-right')}>
                <div
                  className={cn(
                    'flex items-center gap-2',
                    isCurrentUser && 'flex-row-reverse'
                  )}
                >
                  <Link href={`/${msg.username}`}>
                    <p className="text-sm font-semibold hover:underline">
                      {msg.username}
                    </p>
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(msg.$createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <div
                  className={cn(
                    'mt-1 inline-block text-sm p-2 rounded-lg break-words whitespace-pre-wrap max-w-full',
                    isCurrentUser
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground/90 text-left'
                  )}
                >
                  {msg.message}
                </div>
              </div>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
