
import Image from 'next/image';
import Link from 'next/link';
import type { Project } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Github, Link as LinkIcon, Eye } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const projectUrl = `/${project.user.username}/${project.slug}`;
  const userUrl = `/${project.user.username}`;
  
  const shortDescription = project.description.length > 150 
    ? project.description.substring(0, 150) + '...' 
    : project.description;

  return (
    <Card className="flex flex-col overflow-hidden h-full">
      <CardHeader className="p-0 relative">
        <Link href={projectUrl}>
          <div className="relative h-48 w-full">
            <Image
              src={project.imageUrls[0]}
              alt={project.title}
              width={1920}
              height={1080}
              className="object-cover w-full h-full"
              data-ai-hint="screenshot project"
            />
             <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-background/80 backdrop-blur-sm text-foreground py-1 px-2 rounded-full text-xs font-medium">
                <Eye className="w-3.5 h-3.5"/>
                <span>{(project.views || 0).toLocaleString()}</span>
            </div>
          </div>
        </Link>
        <div className="absolute bottom-4 left-4 flex items-center gap-2">
          <Link href={userUrl}>
            <Avatar className="h-10 w-10 border-2 border-background">
              <AvatarImage src={project.user.avatarUrl} alt={project.user.name} />
              <AvatarFallback>{project.user.name ? project.user.name.charAt(0) : 'U'}</AvatarFallback>
            </Avatar>
          </Link>
           <div>
             <Link href={userUrl}><p className="text-sm font-bold text-white hover:underline" style={{textShadow: '1px 1px 2px black'}}>{project.user.name}</p></Link>
             <Link href={userUrl}><p className="text-xs text-white hover:underline" style={{textShadow: '1px 1px 2px black'}}>@{project.user.username}</p></Link>
           </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-xl mb-2 hover:text-primary transition-colors">
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
