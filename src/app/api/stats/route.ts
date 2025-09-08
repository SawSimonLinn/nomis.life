
import { NextResponse } from 'next/server';
import { databases } from '@/lib/appwrite';

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const PROJECTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_COLLECTION_ID!;
const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!;

export async function GET() {
  try {
    // Fetch total users
    const usersResponse = await databases.listDocuments(
        DB_ID, 
        USERS_COLLECTION_ID,
        []
    );
    const totalUsers = usersResponse.total;

    // Fetch all projects to sum views
    const projectsResponse = await databases.listDocuments(
        DB_ID, 
        PROJECTS_COLLECTION_ID,
        []
    );
    const totalProjects = projectsResponse.total;
    const totalViews = projectsResponse.documents.reduce((sum, p) => sum + (p.views || 0), 0);

    return NextResponse.json({
      totalProjects,
      totalUsers,
      totalViews,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
