
'use client';

import { useState, useEffect } from 'react';
import { Bell, Eye, MessageSquare } from 'lucide-react';
import { getNotifications, markNotificationAsRead } from '@/lib/notifications';
import { getAppwriteUser, mapAppwriteUserToUser } from '@/lib/api';
import type { Notification, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export default function Notifications() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const fetchNotifications = async (userId: string) => {
    setIsLoading(true);
    const fetchedNotifications = await getNotifications(userId);
    setNotifications(fetchedNotifications);
    setIsLoading(false);
  };
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const appwriteUser = await getAppwriteUser();
        if (appwriteUser) {
          const mappedUser = await mapAppwriteUserToUser(appwriteUser);
          setCurrentUser(mappedUser);
          fetchNotifications(mappedUser.id);
        } else {
            setIsLoading(false);
        }
      } catch (e) {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleMarkAsRead = async (notification: Notification) => {
    if (!notification.isRead) {
      await markNotificationAsRead(notification.$id);
      // Optimistically update the UI
      setNotifications(prev => 
        prev.map(n => n.$id === notification.$id ? { ...n, isRead: true } : n)
      );
    }
  };

  return (
    <DropdownMenu onOpenChange={(open) => {
        if(open && currentUser) {
            // Re-fetch every time to get the latest notifications
            fetchNotifications(currentUser.id);
        }
    }}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
          <span className="sr-only">Toggle notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isLoading ? (
            <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
        ) : notifications.length === 0 ? (
          <DropdownMenuItem disabled>You have no notifications</DropdownMenuItem>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem 
                key={notification.$id} 
                className={cn("cursor-pointer", !notification.isRead && "bg-primary/10")}
                onSelect={() => handleMarkAsRead(notification)}
              >
                   <div className="flex items-start gap-3 py-2 w-full">
                     <div className="w-5 h-5 flex items-center justify-center">
                        {!notification.isRead && <div className="w-2 h-2 rounded-full bg-primary" />}
                     </div>
                     <div className="flex-shrink-0 mt-1">
                        {notification.type === 'review' ? <MessageSquare className="h-4 w-4 text-green-500" /> : <Eye className="h-4 w-4 text-blue-500" />}
                     </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.$createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
