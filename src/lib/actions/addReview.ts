// src/lib/actions/addReview.ts
import { ID, databases, Permission, Role } from '@/lib/appwrite';

export async function addReview({ projectId, userId, username, avatar, rating, comment }: {
  projectId: string;
  userId: string;
  username: string;
  avatar: string;
  rating: number;
  comment: string;
}) {
  return await databases.createDocument(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
    process.env.NEXT_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID!,
    ID.unique(),
    {
      projectId,
      userId,
      username,
      avatar,
      rating,
      comment,
    },
    [
      Permission.read(Role.any()),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ]
  );
}

export async function updateReview(reviewId: string, data: { rating: number; comment: string }) {
  return databases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID!,
      reviewId,
      data
  );
}

export async function deleteReview(reviewId: string) {
  return databases.deleteDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID!,
      reviewId
  );
}