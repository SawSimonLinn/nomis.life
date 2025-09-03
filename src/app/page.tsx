
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getFeaturedProjects, getAllProjects, getProjectsWithReviewCounts } from '@/lib/api';
import type { Project } from '@/lib/types';
import ProjectCard from '@/components/project-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

const chatBubbles = [
  {
    id: 1,
    text: "🚀 Just launched my first project!",
    position: "top-20 left-20",
    duration: 6,
  },
  {
    id: 2,
    text: "✅ Anyone up for code review?",
    position: "bottom-60 right-12",
    duration: 3,
  },
  {
    id: 3,
    text: "Loved this project! 💕",
    position: "bottom-40 md:left-60 left-20",
    duration: 5,
  },
  { id: 4, text: "Clean UI 🔥", position: "top-60 left-80", duration: 4 },
  {
    id: 5,
    text: "Let's connect! 🤝",
    position: "top-40 md:right-60 right-20",
    duration: 6,
  },
];

function TimedBubble({ id, text, position, duration, delay }: any) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let showTimeout: NodeJS.Timeout;
    let hideTimeout: NodeJS.Timeout;
    let interval: NodeJS.Timeout;

    const loop = () => {
      setVisible(true);
      hideTimeout = setTimeout(() => setVisible(false), 4000); // show for 4s
    };

    showTimeout = setTimeout(() => {
      loop();
      interval = setInterval(loop, 12000); // repeat every 12s
    }, delay); // initial delay

    return () => {
      clearTimeout(showTimeout);
      clearTimeout(hideTimeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={id}
          className={`absolute ${position} bg-white dark:bg-zinc-900 px-4 py-2 rounded-lg shadow text-sm text-black dark:text-white`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: [-5, 5, -5] }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 1.2 },
            y: { duration: duration, repeat: Infinity },
          }}
        >
          {text}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Hero() {
  const { theme } = useTheme();

  return (
    <section className="relative w-full min-h-[85vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden bg-background">
      {/* === Floating Developer Avatars === */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.img
          src="https://picsum.photos/seed/dev2/100/100"
          alt="dev1"
          className="absolute top-10 left-10 w-12 h-12 rounded-full border-2 border-white dark:border-zinc-900 shadow-lg"
          data-ai-hint="avatar"
          initial={{ y: 0 }}
          animate={{ y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 4 }}
        />

        <motion.img
          src="https://picsum.photos/seed/dev3/100/100"
          alt="dev1"
          className="absolute bottom-40 right-10 w-12 h-12 rounded-full border-2 border-white dark:border-zinc-900 shadow-lg"
          data-ai-hint="avatar"
          initial={{ y: 0 }}
          animate={{ y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 6 }}
        />
        <motion.img
          src="https://picsum.photos/seed/dev4/100/100"
          alt="dev2"
          className="absolute bottom-20 md:left-60 left-20 w-14 h-14 rounded-full border-2 border-white dark:border-zinc-900 shadow-lg"
          data-ai-hint="avatar"
          initial={{ y: 0 }}
          animate={{ y: [0, 25, 0] }}
          transition={{ repeat: Infinity, duration: 9 }}
        />
      </div>

      {/* === Floating Chat Bubbles (timed display) === */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {chatBubbles.map((bubble, index) => (
          <TimedBubble key={bubble.id} {...bubble} delay={index * 2000} />
        ))}
      </div>

      {/* === Hero Text Content === */}
      <motion.div
        className="relative z-10 max-w-2xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 text-foreground">
          Build. Share. Connect.
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-6">
          Whether you're a software engineer, data scientist, UI/UX designer, QA
          tester, or just exploring tech — showcase your work, get feedback, and
          grow with a supportive community.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="#projects">
            <Button size="lg" className="text-base px-6 py-3">
              Explore Projects
            </Button>
          </Link>
          <Link href="/community-chat">
            <Button size="lg" variant="outline" className="text-base px-6 py-3">
              Join the Community
            </Button>
          </Link>
        </div>

        <p className="text-sm text-muted-foreground mt-4">
          This platform is for everyone in tech — no matter your role or
          experience level.
        </p>
      </motion.div>
    </section>
  );
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      let rawProjects;
      if (searchQuery) {
        rawProjects = await getAllProjects(searchQuery);
      } else {
        rawProjects = await getFeaturedProjects();
      }
      const projectsWithReviews = await getProjectsWithReviewCounts(rawProjects);
      setProjects(projectsWithReviews);
      setLoading(false);
    };

    const handler = setTimeout(() => {
        fetchProjects();
    }, 300);

    return () => {
        clearTimeout(handler);
    };
  }, [searchQuery]);

  return (
    <>
      <Hero />
      <div id="projects" className="container mx-auto px-4 py-8 md:py-16">
        <section className="mb-16">
            <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Search for developers or projects..."
                className="pl-10 pr-10 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
             {searchQuery && (
                <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground hover:text-foreground"
                    aria-label="Clear search"
                >
                    <X />
                </button>
            )}
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
    </>
  );
}
