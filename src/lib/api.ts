

import { databases, storage, account } from './appwrite';
import { ID, Query, Role, Permission } from 'appwrite';
import type { Models } from 'appwrite';
import type { Project, User } from './types';
import { getReviewCountByProject } from './reviews';

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const PROJECTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_COLLECTION_ID!;
const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!;
const RESUME_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_RESUME_BUCKET_ID!;
const PROFILE_PICTURES_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_PROFILE_PICTURES_BUCKET_ID!;


// --- User Functions ---

export async function getAppwriteUser() {
    try {
        return await account.get();
    } catch (error) {
        return null;
    }
}

export async function updateUserPreferences(prefs: Partial<User>) {
    try {
        const currentUser = await account.get();
        
        const updatedData: { [key: string]: any } = {};
        
        const validKeys = ['bio', 'careerPath', 'linkedinUrl', 'portfolioUrl', 'contactEmail', 'phoneNumber', 'skills', 'softSkills', 'contribution', 'resumeFileId', 'avatarUrl'];

        for (const key of validKeys) {
            if (key in prefs) {
                const value = (prefs as any)[key];
                // we allow empty strings to clear a field.
                if (value !== null && value !== undefined) {
                    updatedData[key] = value;
                }
            }
        }

        if (Object.keys(updatedData).length > 0) {
            await databases.updateDocument(DB_ID, USERS_COLLECTION_ID, currentUser.$id, updatedData);
        }
        
    } catch (error) {
        console.error('Failed to update user preferences', error);
        throw error;
    }
}


export async function getPublicUser(username: string): Promise<User | null> {
    if (!username) {
        console.warn('getPublicUser called with undefined username');
        return null;
    }
    try {
        const response = await databases.listDocuments(
            DB_ID,
            USERS_COLLECTION_ID,
            [Query.equal('username', username), Query.limit(1)]
        );

        if (response.documents.length > 0) {
            const userDoc = response.documents[0];
            return {
                id: userDoc.$id,
                name: userDoc.name,
                username: userDoc.username,
                email: userDoc.email,
                avatarUrl: userDoc.avatarUrl,
                bio: userDoc.bio,
                githubUrl: userDoc.githubUrl,
                skills: userDoc.skills || [],
                softSkills: userDoc.softSkills || [],
                contribution: userDoc.contribution || '',
                linkedinUrl: userDoc.linkedinUrl,
                portfolioUrl: userDoc.portfolioUrl,
                contactEmail: userDoc.contactEmail,
                phoneNumber: userDoc.phoneNumber,
                resumeFileId: userDoc.resumeFileId,
                careerPath: userDoc.careerPath,
            };
        }
        
        return null;
    } catch (e) {
        console.error("Error fetching public user:", e);
        return null;
    }
}


export async function mapAppwriteUserToUser(appwriteUser: Models.User<Models.Preferences>): Promise<User> {
    const username = appwriteUser.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    
    try {
        // This will throw a 404 if the doc doesn't exist, which we catch.
        const userDoc = await databases.getDocument(DB_ID, USERS_COLLECTION_ID, appwriteUser.$id);
        
        return {
            id: userDoc.$id,
            name: userDoc.name,
            username: userDoc.username,
            email: userDoc.email,
            avatarUrl: userDoc.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userDoc.name)}&background=random`,
            bio: userDoc.bio,
            githubUrl: userDoc.githubUrl,
            skills: userDoc.skills || [],
            softSkills: userDoc.softSkills || [],
            contribution: userDoc.contribution || '',
            linkedinUrl: userDoc.linkedinUrl,
            portfolioUrl: userDoc.portfolioUrl,
            contactEmail: userDoc.contactEmail,
            phoneNumber: userDoc.phoneNumber,
            resumeFileId: userDoc.resumeFileId,
            careerPath: userDoc.careerPath,
        };

    } catch (error: any) {
        if (error.code === 404) {
             const newUserDoc = {
                username: username,
                name: appwriteUser.name,
                email: appwriteUser.email,
                avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(appwriteUser.name)}&background=random`,
                bio: 'Welcome to your new profile! You can edit this bio in your dashboard.',
                githubUrl: `https://github.com/${username}`,
                skills: [],
                softSkills: [],
                contribution: '',
                linkedinUrl: '',
                portfolioUrl: '',
                contactEmail: '',
                phoneNumber: '',
                resumeFileId: '',
                careerPath: 'software_engineering',
             };
             await databases.createDocument(
                DB_ID,
                USERS_COLLECTION_ID,
                appwriteUser.$id,
                newUserDoc,
                [
                    Permission.read(Role.any()),
                    Permission.update(Role.user(appwriteUser.$id)),
                ]
            );
            return { id: appwriteUser.$id, ...newUserDoc };
        } else {
            console.error("Error ensuring user document exists:", error);
            throw error; // Re-throw other errors
        }
    }
}

export async function getAllUsersExceptMe(): Promise<User[]> {
    try {
        const currentUser = await getAppwriteUser();
        if (!currentUser) return [];

        const response = await databases.listDocuments(
            DB_ID,
            USERS_COLLECTION_ID,
            [Query.notEqual('$id', currentUser.$id)]
        );

        return response.documents as unknown as User[];
    } catch (error) {
        console.error('Failed to fetch users', error);
        return [];
    }
}


// --- Project Functions ---

export async function getProjectById(projectId: string): Promise<Project | null> {
    try {
        const doc = await databases.getDocument(DB_ID, PROJECTS_COLLECTION_ID, projectId);
        const project = doc as unknown as Project;

        // Manually fetch and attach the user object.
        const userDoc = await databases.getDocument(DB_ID, USERS_COLLECTION_ID, project.userId);
        project.user = {
            id: userDoc.$id,
            name: userDoc.name,
            username: userDoc.username,
            avatarUrl: userDoc.avatarUrl,
        };

        return project;
    } catch (error) {
        console.error(`Failed to fetch project by ID ${projectId}:`, error);
        return null;
    }
}


async function getProjects(queries: string[] = []): Promise<{ projects: Project[], total: number }> {
    try {
        const response = await databases.listDocuments(DB_ID, PROJECTS_COLLECTION_ID, queries);
        
        const projects = await Promise.all(response.documents.map(async (doc) => {
            const project = doc as unknown as Project;

            let userDoc;
            try {
                userDoc = await databases.getDocument(DB_ID, USERS_COLLECTION_ID, project.userId);
                 project.user = {
                    id: project.userId,
                    name: doc.developerName,
                    username: userDoc.username, 
                    avatarUrl: userDoc.avatarUrl,
                };
            } catch (error) {
                console.warn(`Could not find user document for userId: ${project.userId}. Project: ${project.title}`);
                // Assign a fallback user object so the app doesn't crash
                 project.user = {
                    id: project.userId,
                    name: doc.developerName,
                    username: 'unknown', 
                    avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.developerName)}`,
                };
            }

            if (project.imageIds && project.imageIds.length > 0) {
                const projectImageBucketId = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID!;
                project.imageUrls = project.imageIds.map(id => getProjectImageUrl(id, projectImageBucketId));
            } else {
                project.imageUrls = ['https://placehold.co/1920x1080?text=Project+Image'];
            }
            
            return project;
        }));

        // Filter out any null projects that resulted from a missing user document
        const filteredProjects = projects.filter((p): p is Project => p !== null);

        return {
            projects: filteredProjects,
            total: response.total
        };

    } catch (error) {
        console.error('Failed to fetch projects', error);
        return { projects: [], total: 0 };
    }
}

export async function getProjectsWithReviewCounts(projects: Project[]): Promise<Project[]> {
  const updatedProjects = await Promise.all(
    projects.map(async (project) => {
      const reviewCount = await getReviewCountByProject(project.$id);
      return { ...project, reviewCount };
    })
  );

  return updatedProjects;
}


export async function getProjectBySlug(slug: string, username: string): Promise<Project | null> {
    try {
       const user = await getPublicUser(username);
       if (!user) {
           console.warn(`No public user found for username: ${username}`);
           return null;
       }

       const response = await databases.listDocuments(
            DB_ID,
            PROJECTS_COLLECTION_ID,
            [
                Query.equal('slug', slug),
                Query.equal('userId', user.id),
                Query.limit(1)
            ]
        );

       if (response.documents.length === 0) {
           return null;
       }

       const projectDoc = response.documents[0];
       if(!projectDoc) return null;

       const project = projectDoc as unknown as Project;
       
       project.user = {
            id: project.userId,
            username: user.username,
            name: project.developerName,
            avatarUrl: user.avatarUrl,
        };
    
        if (project.imageIds && project.imageIds.length > 0) {
            const projectImageBucketId = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID!;
            project.imageUrls = project.imageIds.map(id => getProjectImageUrl(id, projectImageBucketId));
        } else {
            project.imageUrls = ['https://placehold.co/1920x1080?text=Project+Image'];
        }

       try {
            await databases.updateDocument(DB_ID, PROJECTS_COLLECTION_ID, project.$id, {
                views: (project.views || 0) + 1
            });
       } catch (e) {
           // ignore view count update errors
       }
        
       return project;

    } catch (error) {
        console.error(`Failed to fetch project by slug ${slug}:`, error);
        return null;
    }
}

export async function getUserProjects(userId: string): Promise<Project[]> {
    const { projects } = await getProjects([Query.equal('userId', userId), Query.orderDesc('$createdAt')]);
    return projects;
}

export async function getFeaturedProjects(): Promise<Project[]> {
    const { projects } = await getProjects([Query.limit(6), Query.orderDesc('views')]);
    return projects;
}

export async function getAllProjects(searchQuery: string = '', page: number = 1, limit: number = 9): Promise<{ projects: Project[], total: number }> {
    const offset = (page - 1) * limit;
    const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 0);

    const commonQueries = [
        Query.limit(limit),
        Query.offset(offset),
        Query.orderDesc('views')
    ];

    if (searchTerms.length === 0) {
        return getProjects(commonQueries);
    }
    
    // Since Appwrite doesn't support OR queries across different attributes in this manner,
    // we perform two separate queries and merge the results.
    const titleQuery = getProjects([Query.search('title', searchTerms.join(' ')), ...commonQueries]);
    const nameQuery = getProjects([Query.search('developerName', searchTerms.join(' ')), ...commonQueries]);

    const [titleResults, nameResults] = await Promise.all([titleQuery, nameQuery]);

    const allProjects = [...titleResults.projects, ...nameResults.projects];
    
    // Remove duplicates
    const uniqueProjects = Array.from(new Map(allProjects.map(p => [p.$id, p])).values());
    const total = uniqueProjects.length; // Note: This total is for the current merged result, not a true total from DB for pagination.

    return {
        projects: uniqueProjects,
        total: total,
    };
}


export async function createProject(data: Omit<Project, 'user' | '$id' | '$collectionId' | '$databaseId' | '$createdAt' | '$updatedAt' | '$permissions' | 'imageUrls'>) {
    try {
        const userId = data.userId;
        return await databases.createDocument(
            DB_ID,
            PROJECTS_COLLECTION_ID,
            ID.unique(),
            data,
            [
                Permission.read(Role.any()),
                Permission.update(Role.user(userId)),
                Permission.delete(Role.user(userId)),
            ]
        );
    } catch (error) {
        console.error('Failed to create project', error);
        throw error;
    }
}

export async function updateProject(projectId: string, data: Partial<Omit<Project, 'user' | 'imageUrls' | '$id' | '$collectionId' | '$databaseId' | '$createdAt' | '$updatedAt' | '$permissions' | 'username' | 'reviewCount'>>) {
    try {
        return await databases.updateDocument(
            DB_ID,
            PROJECTS_COLLECTION_ID,
            projectId,
            data
        );
    } catch (error) {
        console.error('Failed to update project', error);
        throw error;
    }
}

export async function deleteProject(projectId: string) {
    try {
        return await databases.deleteDocument(DB_ID, PROJECTS_COLLECTION_ID, projectId);
    } catch (error) {
        console.error('Failed to delete project', error);
        throw error;
    }
}


// --- Storage Functions ---

export async function uploadImage(file: File, bucketId: string): Promise<Models.File> {
    if (!bucketId) {
        throw new Error('A bucketId is required for image upload.');
    }
    try {
        const user = await getAppwriteUser();
        if (!user) throw new Error('User not authenticated for image upload');
        
        return await storage.createFile(
            bucketId,
            ID.unique(),
            file,
            [
                Permission.read(Role.any()),
                Permission.update(Role.user(user.$id)),
                Permission.delete(Role.user(user.$id)),
            ]
        );
    } catch (error) {
        console.error('Failed to upload image', error);
        throw error;
    }
}

export async function deleteImage(fileId: string, bucketId: string) {
    try {
        return await storage.deleteFile(bucketId, fileId);
    } catch (error) {
        console.error('Failed to delete image', error);
        throw error;
    }
}

export function getProjectImageUrl(fileId: string, bucketId: string): string {
    try {
        const url = storage.getFilePreview(bucketId, fileId, 1920, 1080).href;
        return url;
    } catch (error) {
        console.error('Failed to get image URL', error);
        // Return a placeholder if the URL can't be generated
        return `https://placehold.co/1920x1080?text=Error+Loading+Image`;
    }
}

export function getAvatarUrl(fileId: string, bucketId: string): string {
    try {
        const url = storage.getFilePreview(bucketId, fileId, 400, 400).href;
        return url;
    } catch (error) {
        console.error('Failed to get avatar URL', error);
        return `https://placehold.co/400x400?text=Error`;
    }
}


// --- Resume Functions ---
export async function uploadResume(file: File): Promise<Models.File> {
    try {
        const user = await getAppwriteUser();
        if (!user) throw new Error('Not authenticated');

        return await storage.createFile(
            RESUME_BUCKET_ID, 
            ID.unique(), 
            file,
            [
                Permission.read(Role.any()),
                Permission.update(Role.user(user.$id)),
                Permission.delete(Role.user(user.$id)),
            ]
        );
    } catch (error) {
        console.error('Failed to upload resume', error);
        throw error;
    }
}

export async function deleteResume(fileId: string) {
    try {
        return await storage.deleteFile(RESUME_BUCKET_ID, fileId);
    } catch (error) {
        console.error('Failed to delete resume', error);
        throw error;
    }
}

export function getResumeUrl(fileId: string): string {
    try {
        return storage.getFilePreview(RESUME_BUCKET_ID, fileId).href;
    } catch (error) {
        console.error('Failed to get resume URL', error);
        return '#';
    }
}

export function getResumeDownloadUrl(fileId: string): string {
    try {
        return storage.getFileDownload(RESUME_BUCKET_ID, fileId).href;
    } catch (error) {
        console.error('Failed to get resume download URL', error);
        return '#';
    }
}
