
'use client';

import { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import { getUserProjects, getPublicUser, getResumeDownloadUrl, getProjectsWithReviewCounts } from '@/lib/api';
import type { Project, User } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProjectCard from '@/components/project-card';
import { Github, Linkedin, Mail, Sparkles, Phone, Globe, Download, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const CAREER_PATHS: { [key: string]: string } = {
    software_engineering: 'Software Engineering',
    data_science: 'Data Science',
    qa_engineering: 'QA Engineering',
    cyber_security: 'Cybersecurity',
    ui_ux: 'UI/UX Design',
    product_management: 'Product Management',
    devops: 'DevOps / Cloud',
};

export default function PortfolioPage() {
  const params = useParams();
  const usernameFromUrl = params.username as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProjects, setUserProjects] = useState<Project[]>([]);


  useEffect(() => {
    const fetchUserAndProjects = async () => {
      setLoading(true);
      try {
        const publicUser = await getPublicUser(usernameFromUrl);
        if (publicUser) {
           setUser(publicUser);
           const rawProjects = await getUserProjects(publicUser.id);
           const projectsWithReviews = await getProjectsWithReviewCounts(rawProjects);
           setUserProjects(projectsWithReviews);
        } else {
           setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    if (usernameFromUrl) {
        fetchUserAndProjects();
    }
  }, [usernameFromUrl]);

  if (loading) {
    return (
       <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          <aside className="w-full md:w-1/3 lg:w-1/4">
            <div className="sticky top-24 flex flex-col items-center md:items-start text-center md:text-left p-6 bg-card rounded-lg shadow-sm">
                <Skeleton className="h-32 w-32 rounded-full mb-4" />
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-6 w-32 mb-4" />
                <Skeleton className="h-12 w-full mb-6" />
            </div>
          </aside>
          <main className="w-full md:w-2/3 lg:w-3/4">
             <h2 className="text-4xl font-bold mb-8 font-headline">Projects</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <Skeleton className="h-96 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>
            <Skeleton className="h-24 w-full" />
          </main>
        </div>
      </div>
    )
  }

  if (!user) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col md:flex-row gap-8 md:gap-12">
        <aside className="w-full md:w-1/3 lg:w-1/4">
          <div className="sticky top-24 flex flex-col items-center md:items-start text-center md:text-left p-6 bg-card rounded-lg shadow-sm">
            <Avatar className="h-32 w-32 mb-4 border-4 border-primary">
              <AvatarImage src={user.avatarUrl} alt={user.name} className="object-cover" />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <h1 className="text-3xl font-bold font-headline">{user.name}</h1>
            <p className="text-lg text-muted-foreground">@{user.username}</p>
             {user.careerPath && (
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Briefcase className="w-4 h-4"/>
                    <span>{CAREER_PATHS[user.careerPath]}</span>
                </div>
            )}
            <p className="text-foreground/80 my-4">{user.bio}</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
              <Button asChild variant="outline" size="sm">
                <a href={user.githubUrl} target="_blank" rel="noopener noreferrer">
                  <Github /> GitHub
                </a>
              </Button>
              {user.linkedinUrl && (
                 <Button asChild variant="outline" size="sm">
                    <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer">
                        <Linkedin /> LinkedIn
                    </a>
                </Button>
              )}
               {user.portfolioUrl && (
                 <Button asChild variant="outline" size="sm">
                    <a href={user.portfolioUrl} target="_blank" rel="noopener noreferrer">
                        <Globe /> Portfolio
                    </a>
                </Button>
              )}
               {user.contactEmail && (
                 <Button asChild variant="outline" size="sm">
                    <a href={`mailto:${user.contactEmail}`}>
                        <Mail /> Email
                    </a>
                </Button>
              )}
               {user.phoneNumber && (
                 <Button asChild variant="outline" size="sm">
                    <a href={`tel:${user.phoneNumber}`}>
                        <Phone /> Phone
                    </a>
                </Button>
              )}
            </div>
             {user.resumeFileId && (
                <div className="flex flex-col sm:flex-row gap-2 w-full mb-6">
                    <Button asChild className="w-full">
                        <a href={getResumeDownloadUrl(user.resumeFileId)} download>
                            <Download/> Download Resume
                        </a>
                    </Button>
                </div>
            )}


            <div className="w-full text-left space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 font-headline">Hard Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>

              {user.softSkills && user.softSkills.length > 0 && (
                 <div>
                    <h3 className="text-xl font-semibold mb-3 font-headline">Soft Skills</h3>
                    <div className="flex flex-wrap gap-2">
                    {user.softSkills.map((skill) => (
                        <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                    </div>
                </div>
              )}
            </div>

          </div>
        </aside>

        <main className="w-full md:w-2/3 lg:w-3/4">

          <h2 className="text-4xl font-bold mb-8 font-headline">Projects</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {userProjects.length > 0 ? (
                userProjects.map((project) => (
                    <ProjectCard key={project.$id} project={project} />
                ))
            ) : (
                <p className="text-muted-foreground col-span-2">This user hasn't added any projects yet.</p>
            )}
          </div>

          {user.contribution && (
            <Card className="bg-gradient-to-br from-primary/10 to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl font-headline">
                  <Sparkles className="text-primary"/>
                  What I Bring to the Table
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/80">{user.contribution}</p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
