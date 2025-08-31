
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getFeaturedProjects, getAllProjects, getAppwriteUser } from '@/lib/api';
import type { Project } from '@/lib/types';
import ProjectCard from '@/components/project-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      setLoadingAuth(true);
      try {
        const user = await getAppwriteUser();
        setIsLoggedIn(!!user);
      } catch (error) {
        setIsLoggedIn(false);
      } finally {
        setLoadingAuth(false);
      }
    };
    checkLoginStatus();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      let fetchedProjects;
      // if (searchQuery) {
        fetchedProjects = await getAllProjects(searchQuery);
      // } else {
      //   fetchedProjects = await getFeaturedProjects();
      // }
      setProjects(fetchedProjects);
      setLoading(false);
    };

    // Debounce search query
    const handler = setTimeout(() => {
        fetchProjects();
    }, 300);

    return () => {
        clearTimeout(handler);
    };
  }, [searchQuery]);

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight mb-4">
          Your GitHub, Your Portfolio. Instantly.
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Nomis.Life turns your GitHub profile into a sleek, professional portfolio. No setup, no design work. Just log in and share your work with the world.
        </p>
        {loadingAuth ? (
          <Skeleton className="h-12 w-48 mx-auto" />
        ) : (
          <Button size="lg" asChild>
            <Link href="/dashboard">
              {isLoggedIn ? 'Go to Dashboard' : 'Get Started for Free'}
            </Link>
          </Button>
        )}
      </section>

      <section className="mb-16">
        <div className="relative max-w-2xl mx-auto mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for developers or projects..."
            className="pl-10 text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold font-headline mb-8 text-center">
          {searchQuery ? `Search Results for "${searchQuery}"` : 'Featured Projects'}
        </h2>
        {loading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {[...Array(3)].map((_, i) => (
                <Card key={i}>
                    <Skeleton className="h-48 w-full" />
                    <CardContent className="p-4">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2 mb-4" />
                        <Skeleton className="h-12 w-full" />
                    </CardContent>
                </Card>
             ))}
           </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project: Project) => (
              <ProjectCard key={project.$id} project={project} />
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-16">
            <h3 className="text-2xl font-semibold mb-2">No Projects Found</h3>
            <p>Try a different search term or check out all projects.</p>
          </div>
        )}
      </section>
    </div>
  );
}
