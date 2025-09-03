// src/lib/actions/addReview.ts
'use server';

import { ID, databases, Permission, Role } from '@/lib/appwrite';
import { notifyProjectReview } from '../notifications';

interface AddReviewPayload {
  projectId: string;
  userId: string;
  username: string;
  avatar: string;
  rating: number;
  comment: string;
}

export async function addReview(payload: AddReviewPayload) {
  const { projectId, userId, username, avatar, rating, comment } = payload;
  
  // 🔍 Fetch the project to get the owner ID
  const project = await databases.getDocument(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
    process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_COLLECTION_ID!,
    projectId
  );

  const projectOwnerId = project.userId;

  // 🚫 Prevent reviewing your own project
  if (projectOwnerId === userId) {
    throw new Error('You cannot review your own project.');
  }

  // ✅ Create the review
  const review = await databases.createDocument(
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
    }
  );

  // 🔔 Create notification for project owner
  await notifyProjectReview({
    reviewerName: username,
    projectId: projectId,
    ownerId: projectOwnerId,
  });

  return review;
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
