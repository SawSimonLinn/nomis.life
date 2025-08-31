
'use client';

import { useState } from 'react';
import { sendMessage } from '@/lib/chat';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SendHorizonal, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MessageInputProps {
  roomId: string;
  userId: string;
  username: string;
}

export function MessageInput({ roomId, userId, username }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSending(true);
    try {
      await sendMessage(roomId, userId, username, message);
      setMessage('');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Message failed',
        description: 'Could not send your message. Please try again.',
      });
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form onSubmit={handleSend} className="flex items-center gap-2 mt-4">
      <Input
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={isSending}
        autoComplete="off"
      />
      <Button type="submit" size="icon" disabled={isSending || !message.trim()}>
        {isSending ? <Loader2 className="animate-spin" /> : <SendHorizonal />}
        <span className="sr-only">Send Message</span>
      </Button>
    </form>
  );
}
