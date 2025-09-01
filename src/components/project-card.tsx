
import Image from 'next/image';
import Link from 'next/link';
import type { Project } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Github, Link as LinkIcon, Eye, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const projectUrl = `/${project.user.username}/${project.slug}`;
  
  const shortDescription = project.description.length > 150 
    ? project.description.substring(0, 150) + '...' 
    : project.description;

  return (
    <Card className="flex flex-col overflow-hidden h-full">
      <CardHeader className="p-0">
        <Link href={projectUrl} className="relative block group">
          <Image
            src={project.imageUrls[0]}
            alt={project.title}
            width={1920}
            height={1080}
            className="object-cover w-full h-auto"
            data-ai-hint="screenshot project"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/90 transition-all duration-300"></div>

          <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 text-white">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border-2 border-background">
                  <AvatarImage src={project.user.avatarUrl} alt={project.user.name} />
                  <AvatarFallback>{project.user.name ? project.user.name.charAt(0) : 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs sm:text-sm font-bold group-hover:underline" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.7)'}}>{project.user.name}</p>
                  <p className="text-xs text-white/90 group-hover:underline" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.7)'}}>@{project.user.username}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 text-xs font-medium">
                {(project.reviewCount || 0) > 0 && (
                     <div className="flex items-center gap-1" title={`${project.reviewCount} reviews`}>
                        <MessageSquare className="w-4 h-4"/>
                        <span>{project.reviewCount}</span>
                    </div>
                )}
                <div className="flex items-center gap-1" title={`${project.views || 0} views`}>
                    <Eye className="w-4 h-4"/>
                    <span>{(project.views || 0).toLocaleString()}</span>
                </div>
              </div>

            </div>
          </div>
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg md:text-xl mb-2 hover:text-primary transition-colors">
            <Link href={projectUrl}>{project.title}</Link>
        </CardTitle>
        <div className="flex flex-wrap gap-2 mb-3">
          {project.techStack.slice(0, 4).map((tech) => (
            <Badge key={tech} variant="secondary">
              {tech}
            </Badge>
          ))}
        </div>
        <p className="text-muted-foreground text-sm line-clamp-3">
          {shortDescription}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        {project.demoUrl && (
          <Button asChild variant="outline" className="w-full">
            <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
              <LinkIcon />
              Live Demo
            </a>
          </Button>
        )}
        <Button asChild className="w-full">
          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
            <Github />
            Source Code
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
