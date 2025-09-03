
import type { Models } from "appwrite";

export interface User {
  id: string;
  name: string;
  username: string;
  bio: string;
  avatarUrl: string;
  githubUrl: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  contactEmail?: string;
  phoneNumber?: string;
  email?: string; // This is the login email, may not be public
  skills: string[];
  softSkills?: string[];
  contribution?: string;
  resumeFileId?: string;
  careerPath?: string;
}

export interface Project extends Models.Document {
  userId: string;
  developerName: string;
  title: string;
  slug: string;
  description: string;
  githubUrl: string;
  demoUrl?: string;
  techStack: string[];
  imageIds: string[];
  imageUrls: string[]; // for client-side use
  user: { // This is embedded data for display convenience
      id: string;
      name: string;
      username: string;
      avatarUrl: string;
  };
  features: string[];
  challenges: string;
  learnings: string;
  views: number;
  reviewCount?: number;
}

export interface Review extends Models.Document {
    projectId: string;
    userId: string;
    username: string;
    avatar: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export interface ChatMessage extends Models.Document {
    roomId: string;
    userId: string;
    username: string;
    message: string;
}

export type NotificationType = 'view' | 'review';

export interface Notification extends Models.Document {
  userId: string; // The ID of the user who should receive the notification
  type: NotificationType;
  actorName: string; // The username of the person who performed the action
  message: string;
  projectId: string;
  projectSlug: string;
  projectOwnerUsername: string;
  isRead: boolean;
}
