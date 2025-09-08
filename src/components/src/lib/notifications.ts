
'use server';

import { databases, ID, Permission, Role, Query } from '@/lib/appwrite';
import type { Notification, Project } from './types';
import { getProjectById } from './api';
import type { Models } from 'appwrite';

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const NOTIFICATIONS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID!;

async function createNotification(data: Omit<Notification, keyof Models.Document | 'isRead'>) {
    const ownerId = data.userId;
    try {
        await databases.createDocument(
            DB_ID,
            NOTIFICATIONS_COLLECTION_ID,
            ID.unique(),
            { ...data, isRead: false },
            [
                Permission.read(Role.user(ownerId)),
                Permission.update(Role.user(ownerId)),
                Permission.delete(Role.user(ownerId)),
            ]
        );
    } catch (error) {
        console.error('Failed to create notification:', error);
    }
}


export async function notifyProjectView({
  viewerName,
  projectId,
  ownerId,
}: {
  viewerName: string;
  projectId: string;
  ownerId: string;
}) {
  if (!viewerName || viewerName === '' || ownerId === '') return;
  
  const project = await getProjectById(projectId);
  if (!project) {
      console.error(`Project not found for notification: ${projectId}`);
      return;
  }
  
  if (project.user.username === viewerName) return;

  const message = `${viewerName} viewed your project`;

  await createNotification({
      userId: ownerId,
      type: 'view',
      actorName: viewerName,
      message,
      projectId,
      projectSlug: project.slug,
      projectOwnerUsername: project.user.username
  });
}

export async function notifyProjectReview({
  reviewerName,
  projectId,
  ownerId,
}: {
  reviewerName: string;
  projectId: string;
  ownerId: string;
}) {
    const project = await getProjectById(projectId);
    if (!project) {
        console.error(`Project not found for notification: ${projectId}`);
        return;
    }

  const message = `${reviewerName} left a review on your project`;

  await createNotification({
    userId: ownerId,
    type: 'review',
    actorName: reviewerName,
    message,
    projectId,
    projectSlug: project.slug,
    projectOwnerUsername: project.user.username,
  });
}

export async function getNotifications(userId: string): Promise<Notification[]> {
  if (!userId) return [];
  try {
    const response = await databases.listDocuments(
      DB_ID,
      NOTIFICATIONS_COLLECTION_ID,
      [Query.equal('userId', userId), Query.orderDesc('$createdAt'), Query.limit(25)]
    );
    return response.documents as unknown as Notification[];
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return [];
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    await databases.updateDocument(
      DB_ID,
      NOTIFICATIONS_COLLECTION_ID,
      notificationId,
      { isRead: true }
    );
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
  }
}
