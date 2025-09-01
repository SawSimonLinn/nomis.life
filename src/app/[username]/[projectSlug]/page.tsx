
'use client';

import { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import { getProjectBySlug, getUserProjects, getPublicUser } from '@/lib/api';
import { getProjectReviews } from '@/lib/reviews';
import type { Project, User, Review } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Github, Link as LinkIcon, List, Zap, Target, MessageSquare, Star } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import ReviewList from '@/components/reviews/review-list';

export default function ProjectPage() {
  const params = useParams();
  const username = params.username as string;
  const projectSlug = params.projectSlug as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [creator, setCreator] = useState<User | null>(null);
  const [otherProjects, setOtherProjects] = useState<Project[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjectReviews = async (projectId: string) => {
    const projectReviews = await getProjectReviews(projectId);
    setReviews(projectReviews);
  };

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!projectSlug || !username) return;
      setLoading(true);
      try {
        const fetchedProject = await getProjectBySlug(projectSlug, username);
        
        if (!fetchedProject) {
            setProject(null);
        } else {
            setProject(fetchedProject);
            const projectCreator = await getPublicUser(username);
            setCreator(projectCreator);

            if(projectCreator) {
                const allUserProjects = await getUserProjects(projectCreator.id);
                const other = allUserProjects
                    .filter(p => p.$id !== fetchedProject.$id)
                    .slice(0, 2);
                setOtherProjects(other);
            }

            await fetchProjectReviews(fetchedProject.$id);
        }
      } catch (error) {
        console.error("Failed to fetch project data", error);
        
        setProject(null);
      } finally {
        setLoading(false);
        
      }
    };

    fetchProjectData();
  }, [projectSlug, username]);

  if (loading) {
    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="flex flex-col lg:flex-row gap-12">
                <main className="w-full lg:w-2/3">
                    <Card>
                        <Skeleton className="w-full aspect-video" />
                        <CardContent className="p-8">
                            <Skeleton className="h-10 w-3/4 mb-4" />
                            <Skeleton className="h-4 w-1/2 mb-6" />
                            <Skeleton className="h-20 w-full mb-8" />
                            <div className="flex gap-4">
                                <Skeleton className="h-12 w-32" />
                                <Skeleton className="h-12 w-32" />
                            </div>
                        </CardContent>
                    </Card>
                </main>
                <aside className="w-full lg:w-1/3">
                     <Skeleton className="h-64 w-full" />
                </aside>
            </div>
        </div>
    )
  }

  if (!project || !creator) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        <main className="w-full lg:w-2/3 space-y-8">
          <Card className="overflow-hidden">
             {project.imageUrls && project.imageUrls.length > 0 ? (
                <Carousel className="w-full">
                  <CarouselContent>
                    {project.imageUrls.map((url, index) => (
                      <CarouselItem key={index}>
                        <div className="aspect-w-16 aspect-h-9">
                          <Image
                            src={url}
                            alt={`${project.title} screenshot ${index + 1}`}
                            width={1920}
                            height={1080}
                            className="object-cover w-full h-full"
                            data-ai-hint="screenshot project"
                            priority={index === 0}
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10" />
                  <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10" />
                </Carousel>
             ) : (
                <div className="aspect-w-16 aspect-h-9 bg-muted"/>
             )}
            <CardContent className="p-6 md:p-8">
                <h1 className="text-3xl md:text-4xl font-bold font-headline mb-4">{project.title}</h1>

                <div className="flex flex-wrap gap-2 mb-6">
                    {project.techStack.map((tech) => (
                        <Badge key={tech} variant="secondary">{tech}</Badge>
                    ))}
                </div>
                
                <p className="text-foreground/80 mb-8 max-w-3xl whitespace-pre-wrap">{project.description}</p>
                
                <div className="flex flex-wrap gap-4 mb-8">
                    <Button asChild className="w-full sm:w-auto">
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                            <Github />
                            Source Code
                        </a>
                    </Button>
                    {project.demoUrl && (
                        <Button asChild variant="outline" className="w-full sm:w-auto">
                            <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                            <LinkIcon />
                            Live Demo
                            </a>
                        </Button>
                    )}
                </div>

                <Separator className="my-8" />
                
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold font-headline flex items-center gap-2 mb-4"><List/> Features</h2>
                    <ul className="list-disc list-inside space-y-2 text-foreground/80">
                      {project.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                      <h2 className="text-2xl font-bold font-headline flex items-center gap-2 mb-4"><Zap/> Challenges</h2>
                      <p className="text-foreground/80 whitespace-pre-wrap">{project.challenges}</p>
                  </div>
                  <div>
                      <h2 className="text-2xl font-bold font-headline flex items-center gap-2 mb-4"><Target/> What I Learned</h2>
                      <p className="text-foreground/80 whitespace-pre-wrap">{project.learnings}</p>
                  </div>
                </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-headline flex items-center gap-2">
                <MessageSquare/> Reviews & Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
                <ReviewList 
                    projectId={project.$id} 
                    initialReviews={reviews} 
                    onReviewChange={() => fetchProjectReviews(project.$id)}
                />
            </CardContent>
          </Card>

        </main>
        
        <aside className="w-full lg:w-1/3">
          <div className="sticky top-24 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-headline">About the Creator</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <Link href={`/${creator.username}`}>
                    <Avatar className="h-16 w-16 border-2 border-primary">
                      <AvatarImage src={creator.avatarUrl} alt={creator.name} />
                      <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div>
                    <Link href={`/${creator.username}`}>
                      <p className="text-lg font-bold hover:underline">{creator.name}</p>
                    </Link>
                    <Link href={`/${creator.username}`}>
                      <p className="text-sm text-muted-foreground hover:underline">@{creator.username}</p>
                    </Link>
                  </div>
                </div>
                <p className="text-foreground/80 mb-4">{creator.bio}</p>
                <h3 className="text-lg font-semibold mb-3 font-headline">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {creator.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {otherProjects.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-headline">More from {creator.name.split(' ')[0]}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4">
                  {otherProjects.map((p) => (
                     <Link key={p.$id} href={`/${p.user.username}/${p.slug}`} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted">
                        <Image src={p.imageUrls[0]} alt={p.title} width={80} height={60} className="rounded-md object-cover w-[80px] h-[60px]"/>
                        <div>
                            <p className="font-semibold">{p.title}</p>
                            <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                        </div>
                     </Link>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
