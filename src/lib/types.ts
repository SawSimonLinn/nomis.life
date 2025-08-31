
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
}
