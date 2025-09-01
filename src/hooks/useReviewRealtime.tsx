// hooks/useReviewRealtime.ts
'use client';

import { useEffect } from 'react';
import { Client } from 'appwrite';
import type { Models } from 'appwrite';
import type { Review } from '@/lib/types';

interface UseReviewRealtimeProps {
  projectId: string;
  collectionId: string;
  databaseId: string;
  projectIdFilter: string;
  onNewReview: (review: Review) => void;
}

export function useReviewRealtime({
  projectId,
  collectionId,
  databaseId,
  projectIdFilter,
  onNewReview,
}: UseReviewRealtimeProps) {
  useEffect(() => {
    if (!projectIdFilter) return;

    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(projectId);

    const unsubscribe = client.subscribe(
      [`databases.${databaseId}.collections.${collectionId}.documents`],
      (response) => {
        if (
          response.events.includes('databases.*.collections.*.documents.*.create')
        ) {
          const newReview = response.payload as Models.Document;

          // Filter by projectId to only handle relevant reviews
          if (newReview.projectId === projectIdFilter) {
            onNewReview(newReview as Review);
          }
        }
      }
    );

    return () => {
      unsubscribe(); // Clean up
    };
  }, [collectionId, databaseId, projectId, projectIdFilter, onNewReview]);
}
