
'use client';

import { useEffect, useState, useRef } from 'react';
import { client, databases, Query } from '@/lib/appwrite';
import type { Models } from 'appwrite';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

export function ChatRoom({ roomId }: { roomId: string }) {
  const [messages, setMessages] = useState<Models.Document[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    const loadMessages = async () => {
      setLoading(true);
      try {
        const res = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_CHATS_COLLECTION_ID!,
          [Query.equal('roomId', roomId), Query.orderAsc('timestamp'), Query.limit(50)]
        );
        console.log('Loaded messages:', res.documents);
        setMessages(res.documents);
      } catch (error) {
        console.error("Failed to load messages", error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();

    const unsubscribe = client.subscribe(
      `databases.${process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!}.collections.${process.env.NEXT_PUBLIC_APPWRITE_CHATS_COLLECTION_ID!}.documents`,
      (response) => {
        const newMessage = response.payload as Models.Document;
        if (newMessage.roomId === roomId) {
          // Avoid adding duplicates from the subscription event
          setMessages((prev) => {
            if (prev.find((m) => m.$id === newMessage.$id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
        }
      }
    );

    return () => unsubscribe();
  }, [roomId]);
  
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-40" />
            </div>
          </div>
        ))}
      </div>
    );
  }


  return (
    <div className="h-full overflow-y-auto space-y-4 pr-4">
      {messages.length === 0 ? (
         <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <p className="font-semibold">No messages yet!</p>
            <p className="text-sm">Be the first to start the conversation.</p>
        </div>
      ) : (
         messages.map((msg) => (
            <div key={msg.$id} className="flex items-start gap-2.5">
               <Avatar className="w-8 h-8 border">
                 <AvatarImage src={`https://github.com/${msg.username}.png`} alt={msg.username}/>
                 <AvatarFallback>{msg.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1 w-full">
                 <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <span className="text-sm font-semibold text-foreground">{msg.username}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                        {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                    </span>
                 </div>
                 <div className="leading-snug p-2 bg-muted rounded-lg">
                    <p className="text-sm font-normal text-foreground/90">{msg.message}</p>
                 </div>
              </div>
            </div>
          ))
      )}
       <div ref={messagesEndRef} />
    </div>
  );
}
