



import { databases, storage, account } from './appwrite';
import { ID, Query, Role, Permission } from 'appwrite';
import type { Models } from 'appwrite';
import type { Project, User } from './types';
import { getReviewCountByProject } from './reviews';

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const PROJECTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_COLLECTION_ID!;
const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!;
const RESUME_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_RESUME_BUCKET_ID!;
const CHATS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_CHATS_COLLECTION_ID!;
const NOTIFICATIONS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLlection_id!;


// --- User Functions ---

export async function getAppwriteUser() {
    try {
        return await account.get();
    } catch (error) {
        // console.error('Failed to fetch Appwrite user', error);
        return null;
    }
}

async function fetchGitHubProfile() {
  try {
    const session = await account.getSession('current');
    const accessToken = session?.providerAccessToken;

    if (!accessToken) {
      // This can happen for guests, it's not an error.
      return null;
    }

    const res = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
        console.error('Failed to fetch GitHub profile:', res.statusText);
        return null;
    }

    const profile = await res.json();
    return {
      name: profile.name,
      avatarUrl: profile.avatar_url,
      bio: profile.bio,
      githubUrl: profile.html_url,
      username: profile.login,
    };
  } catch (err) {
    console.error('Error fetching GitHub profile:', err);
    return null;
  }
}

export async function updateUserPreferences(prefs: Partial<User>) {
    try {
        const currentUser = await account.get();
        // This call ensures the user document is up-to-date before updating prefs
        const mappedUser = await mapAppwriteUserToUser(currentUser); 

        const updatedData = {
            ...mappedUser,
            ...prefs
        };
        
        await databases.updateDocument(DB_ID, USERS_COLLECTION_ID, currentUser.$id, {
            skills: updatedData.skills,
            softSkills: updatedData.softSkills,
            contribution: updatedData.contribution,
            linkedinUrl: updatedData.linkedinUrl,
            portfolioUrl: updatedData.portfolioUrl,
            contactEmail: updatedData.contactEmail,
            phoneNumber: updatedData.phoneNumber,
            resumeFileId: updatedData.resumeFileId,
            careerPath: updatedData.careerPath,
        });
        
    } catch (error) {
        console.error('Failed to update user preferences', error);
        throw error;
    }
}


export async function getPublicUser(username: string): Promise<User | null> {
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
    const githubProfile = await fetchGitHubProfile();
    const username = githubProfile?.username || appwriteUser.name.toLowerCase().replace(/\s+/g, '-');

    // Default values for new fields can be added here from prefs if they exist
    const prefs = appwriteUser.prefs as User;

    const userData: User = {
      id: appwriteUser.$id,
      name: githubProfile?.name || appwriteUser.name,
      username: username,
      email: appwriteUser.email,
      avatarUrl: githubProfile?.avatarUrl || `https://github.com/${username}.png`,
      bio: githubProfile?.bio || prefs.bio || 'This is a placeholder bio. Update it in your profile dashboard.',
      githubUrl: githubProfile?.githubUrl || `https://github.com/${username}`,
      skills: prefs.skills || [],
      softSkills: prefs.softSkills || [],
      contribution: prefs.contribution || '',
      linkedinUrl: prefs.linkedinUrl,
      portfolioUrl: prefs.portfolioUrl,
      contactEmail: prefs.contactEmail,
      phoneNumber: prefs.phoneNumber,
      resumeFileId: prefs.resumeFileId,
      careerPath: prefs.careerPath,
    };

    try {
        const existingDoc = await databases.getDocument(DB_ID, USERS_COLLECTION_ID, appwriteUser.$id);
        const updatePayload: Partial<User> = {
            username: userData.username,
            name: userData.name,
            avatarUrl: userData.avatarUrl,
            bio: existingDoc.bio || userData.bio, // Prioritize existing bio over default
            githubUrl: userData.githubUrl,
            linkedinUrl: existingDoc.linkedinUrl || userData.linkedinUrl,
            portfolioUrl: existingDoc.portfolioUrl || userData.portfolioUrl,
            contactEmail: existingDoc.contactEmail || userData.contactEmail,
            phoneNumber: existingDoc.phoneNumber || userData.phoneNumber,
            resumeFileId: existingDoc.resumeFileId || userData.resumeFileId,
            careerPath: existingDoc.careerPath || userData.careerPath || 'software_engineering',
            skills: existingDoc.skills && existingDoc.skills.length > 0 ? existingDoc.skills : userData.skills,
            softSkills: existingDoc.softSkills && existingDoc.softSkills.length > 0 ? existingDoc.softSkills : userData.softSkills,
            contribution: existingDoc.contribution || userData.contribution,
        };
        await databases.updateDocument(DB_ID, USERS_COLLECTION_ID, appwriteUser.$id, updatePayload);
        // Merge existing doc data with new data
        return { ...userData, ...existingDoc, ...updatePayload };

    } catch (error: any) {
        if (error.code === 404) {
             const createPayload = {
                username: userData.username,
                name: userData.name,
                avatarUrl: userData.avatarUrl,
                bio: userData.bio,
                githubUrl: userData.githubUrl,
                email: userData.email,
                skills: userData.skills,
                softSkills: userData.softSkills,
                contribution: userData.contribution,
                linkedinUrl: userData.linkedinUrl,
                portfolioUrl: userData.portfolioUrl,
                contactEmail: userData.contactEmail,
                phoneNumber: userData.phoneNumber,
                resumeFileId: userData.resumeFileId,
                careerPath: userData.careerPath || 'software_engineering',
             };
             await databases.createDocument(
                DB_ID,
                USERS_COLLECTION_ID,
                appwriteUser.$id,
                createPayload,
                [
                    Permission.read(Role.any()),
                    Permission.update(Role.user(appwriteUser.$id)),
                ]
            );
        } else {
            console.error("Error ensuring user document exists:", error);
        }
    }
    
    return userData;
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


async function getProjects(queries: string[] = []): Promise<Project[]> {
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
                    avatarUrl: userDoc.avatarUrl || `https://github.com/${userDoc.username}.png`,
                };
            } catch (error) {
                console.warn(`Could not find user document for userId: ${project.userId}. Project: ${project.title}`);
                // Assign a fallback user object so the app doesn't crash
                 project.user = {
                    id: project.userId,
                    name: doc.developerName,
                    username: 'unknown', 
                    avatarUrl: `https://github.com/github.png`,
                };
            }

            if (project.imageIds && project.imageIds.length > 0) {
                project.imageUrls = project.imageIds.map(getImageUrl);
            } else {
                project.imageUrls = ['https://placehold.co/1920x1080?text=Project+Image'];
            }
            
            return project;
        }));

        // Filter out any null projects that resulted from a missing user document
        return projects.filter((p): p is Project => p !== null);

    } catch (error) {
        console.error('Failed to fetch projects', error);
        return [];
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
            project.imageUrls = project.imageIds.map(id => getImageUrl(id));
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
    return getProjects([Query.equal('userId', userId), Query.orderDesc('$createdAt')]);
}

export async function getFeaturedProjects(): Promise<Project[]> {
    return getProjects([Query.limit(6), Query.orderDesc('views')]);
}

export async function getAllProjects(searchQuery: string = ''): Promise<Project[]> {
    if (!searchQuery) {
        return getProjects([Query.limit(20), Query.orderDesc('views')]);
    }
    
    try {
        const searchTerms = searchQuery.split(' ').filter(term => term.length > 0);
        
        const titleQueries = searchTerms.map(term => Query.search('title', term));
        const developerNameQueries = searchTerms.map(term => Query.search('developerName', term));

        const queries = [
            Query.or([
                ...titleQueries,
                ...developerNameQueries,
            ]),
            Query.orderDesc('views'),
        ];

        return getProjects(queries);

    } catch (error) {
        console.error("Error searching projects:", error);
        return [];
    }
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

export async function uploadImage(file: File): Promise<Models.File> {
    const storageBucketId = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID!;
    try {
        const user = await getAppwriteUser();
        if (!user) throw new Error('User not authenticated for image upload');
        
        return await storage.createFile(
            storageBucketId,
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

export async function deleteImage(fileId: string) {
    const storageBucketId = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID!;
    try {
        return await storage.deleteFile(storageBucketId, fileId);
    } catch (error) {
        console.error('Failed to delete image', error);
        throw error;
    }
}

export function getImageUrl(fileId: string): string {
    const storageBucketId = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID!;
    try {
        const url = storage.getFilePreview(storageBucketId, fileId, 1920, 1080).href;
        return url;
    } catch (error) {
        console.error('Failed to get image URL', error);
        // Return a placeholder if the URL can't be generated
        return `https://placehold.co/1920x1080?text=Error+Loading+Image`;
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
