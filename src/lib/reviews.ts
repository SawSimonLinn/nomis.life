
'use server';

import { databases, Query } from '@/lib/appwrite';
import type { Review } from './types';

export async function getReviewCountByProject(projectId: string): Promise<number> {
  try {
    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID!,
      [Query.equal('projectId', projectId)]
    );
    return response.total;
  } catch (error) {
    console.error(`Could not fetch review count for project: ${projectId}`, error);
    return 0;
  }
}


export async function getProjectReviews(projectId: string): Promise<Review[]> {
  try {
    const res = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID!,
      [Query.equal('projectId', projectId), Query.orderDesc('$createdAt')]
    );
    return res.documents as unknown as Review[];
  } catch (err) {
    console.error('Failed to fetch reviews:', err);
    return [];
  }
}
