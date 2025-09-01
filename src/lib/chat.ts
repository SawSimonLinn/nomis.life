
'use server';

import { databases, ID, Permission, Role } from '@/lib/appwrite';
import type { Models } from 'appwrite';

export const sendMessage = async (
  roomId: string,
  userId: string,
  username: string,
  message: string
): Promise<Models.Document> => {
  try {
    const doc = await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_CHATS_COLLECTION_ID!,
      ID.unique(),
      {
        roomId,
        userId,
        username,
        message,
        timestamp: new Date().toISOString(),
      },
      [
        Permission.read(Role.users()),
        Permission.update(Role.user(userId)),
        Permission.delete(Role.user(userId)),
      ]
    );
    return doc;
  } catch (error: any) {
    console.error('Failed to send message:', error.message || error);
    throw new Error('Failed to send message');
  }
};
