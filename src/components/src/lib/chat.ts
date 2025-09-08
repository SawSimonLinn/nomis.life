
'use client';

import { databases, ID, Query, Permission, Role, client } from './appwrite';
import type { Models } from 'appwrite';



const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const PUBLIC_CHATS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_CHATS_COLLECTION_ID!;

export interface ChatMessage extends Models.Document {
    roomId: string;
    userId: string; 
    username: string;
    message: string;
}


export async function sendMessage(payload: {
    roomId: string;
    userId: string;
    username: string;
    message: string;
}): Promise<Models.Document> {
    try {
        const { roomId, userId, username, message } = payload;

        const chatData = {
            roomId,
            userId,
            username,
            message,
        };

        const permissions = [
            Permission.read(Role.any()),
            Permission.update(Role.user(userId)),
            Permission.delete(Role.user(userId)),
        ];

        const response = await databases.createDocument(
            DB_ID,
            PUBLIC_CHATS_COLLECTION_ID,
            ID.unique(),
            chatData,
            permissions
        );

        return response;
    } catch (error) {
        console.error("Failed to send message:", error);
        throw error;
    }
}


export async function getMessages(roomId: string): Promise<ChatMessage[]> {
    try {
        const response = await databases.listDocuments(
            DB_ID,
            PUBLIC_CHATS_COLLECTION_ID,
            [
                Query.equal('roomId', roomId),
                Query.orderDesc('$createdAt'),
                Query.limit(100) 
            ]
        );
        return response.documents.reverse() as ChatMessage[];
    } catch (error) {
        console.error("Failed to get messages:", error);
        return [];
    }
}

export function subscribeToRoom(roomId: string, callback: (message: ChatMessage) => void) {
    const channel = `databases.${DB_ID}.collections.${PUBLIC_CHATS_COLLECTION_ID}.documents`;

    const unsubscribe = client.subscribe(channel, (response) => {
        const newMessage = response.payload as ChatMessage;
        if (
          response.events.includes('databases.*.collections.*.documents.*.create') &&
          newMessage.roomId === roomId
        ) {
          callback(newMessage);
        }
    });

    return unsubscribe;
}
