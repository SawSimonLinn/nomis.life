"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X, Loader2, Users, GitBranch, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getAllProjects, getProjectsWithReviewCounts } from "@/lib/api";
import { suggestProjectTech } from "@/ai/flows/ai-tag-generation";
import type { Project } from "@/lib/types";
import ProjectCard from "@/components/project-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";

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
    position: "md:bottom-60 bottom-32 right-12",
    duration: 3,
  },
  {
    id: 3,
    text: "Loved this project! 💕",
    position: "md:bottom-40 md:left-60 bottom-20 left-20",
    duration: 5,
  },
  {
    id: 4,
    text: "Clean UI 🔥",
    position: "md:top-60 md:left-80 top-40 left-10",
    duration: 4,
  },
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
  }, [delay]);

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

function Stats() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalUsers: 0,
    totalViews: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats");
        const data = await response.json();
        if (response.ok) {
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center gap-8 mt-8">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center gap-4 sm:gap-8 mt-8 text-sm sm:text-base text-muted-foreground">
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-primary" />
        <span className="font-semibold text-foreground">
          {stats.totalUsers.toLocaleString()}+
        </span>
        <span>Developers</span>
      </div>
      <div className="flex items-center gap-2">
        <GitBranch className="w-5 h-5 text-primary" />
        <span className="font-semibold text-foreground">
          {stats.totalProjects.toLocaleString()}+
        </span>
        <span>Projects</span>
      </div>
      <div className="flex items-center gap-2">
        <Eye className="w-5 h-5 text-primary" />
        <span className="font-semibold text-foreground">
          {stats.totalViews.toLocaleString()}+
        </span>
        <span>Views</span>
      </div>
    </div>
  );
}

function Hero() {
  const { theme } = useTheme();

  return (
    <section className="relative w-full min-h-[85vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden bg-background">
      {/* === Floating Developer Avatars === */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.img
          src="https://sfo.cloud.appwrite.io/v1/storage/buckets/68bd02730011014a5153/files/68bedcf4000dca51ab66/view?project=68b27c3800334aeed97c&mode=admin"
          alt="dev1"
          className="absolute top-10 left-10 w-12 h-12 rounded-full border-2 border-white dark:border-zinc-900 shadow-lg"
          data-ai-hint="avatar"
          initial={{ y: 0 }}
          animate={{ y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 4 }}
        />

        <motion.img
          src="https://avatars.githubusercontent.com/u/150866883?v=4"
          alt="dev1"
          className="absolute md:bottom-40 bottom-14 right-10 w-12 h-12 rounded-full border-2 border-white dark:border-zinc-900 shadow-lg"
          data-ai-hint="avatar"
          initial={{ y: 0 }}
          animate={{ y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 6 }}
        />
        <motion.img
          src="https://sfo.cloud.appwrite.io/v1/storage/buckets/68bd02730011014a5153/files/68bee25c0029b9450ed3/view?project=68b27c3800334aeed97c&mode=admin"
          alt="dev2"
          className="object-cover absolute bottom-20 md:left-60 left-10 w-14 h-14 rounded-full border-2 border-white dark:border-zinc-900 shadow-lg"
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
        <p className="text-md md:text-xl text-muted-foreground mb-6">
          <span className="hidden md:inline">
            Whether you're a software engineer, data scientist, UI/UX designer,
            QA tester, or just exploring tech —
          </span>{" "}
          Share your projects, get feedback, and grow with a supportive
          community.
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

        <Stats />
      </motion.div>
    </section>
  );
}

const PROJECTS_PER_PAGE = 6;

function ProjectPagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const handlePrevious = () => {
    if (page > 1) onPageChange(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) onPageChange(page + 1);
  };

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={handlePrevious}
            className={
              page === 1 ? "pointer-events-none opacity-50" : undefined
            }
          />
        </PaginationItem>
        {pageNumbers.map((p) => (
          <PaginationItem key={p}>
            <PaginationLink
              onClick={() => onPageChange(p)}
              isActive={p === page}
            >
              {p}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            onClick={handleNext}
            className={
              page === totalPages ? "pointer-events-none opacity-50" : undefined
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [totalProjects, setTotalProjects] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [popularSearches, setPopularSearches] = useState<string[]>([
    "AI Project",
    "Portfolio Site",
    "SaaS Platform",
    "Mobile App",
    "Data Analytics",
    "Game Dev",
  ]);

  const totalPages = Math.ceil(totalProjects / PROJECTS_PER_PAGE);

  const fetchProjects = async (page: number, query: string) => {
    setIsSearching(true);
    const response = await getAllProjects(query, page, PROJECTS_PER_PAGE);

    const projectsWithReviews = await getProjectsWithReviewCounts(
      response.projects
    );
    setProjects(projectsWithReviews);
    setTotalProjects(response.total);

    if (page === 1 && query === "") {
      const projectTitles = response.projects.map((p) => p.title);
      try {
        const result = await suggestProjectTech({ projectTitles });
        if (result.tech && result.tech.length > 0) {
          setPopularSearches(result.tech);
        }
      } catch (error) {
        console.warn("Could not fetch dynamic popular searches:", error);
      }
    }

    setLoading(false);
    setIsSearching(false);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setCurrentPage(1); // Reset page on new search
      fetchProjects(1, searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  useEffect(() => {
    if (!loading) {
      fetchProjects(currentPage, searchQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const projectsElement = document.getElementById("projects");
    if (projectsElement) {
      projectsElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handlePopularSearch = (term: string) => {
    setSearchQuery(term);
  };

  return (
    <>
      <Hero />
      <div
        id="projects"
        className="container mx-auto px-4 py-8 md:py-16 scroll-mt-20"
      >
        <section className="mb-12 text-center">
          <h2 className="text-3xl font-bold font-headline mb-4">
            Explore the Community
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Find projects by title, discover talented developers by name, or see
            what's trending.
          </p>
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for projects or developers..."
              className="pl-10 pr-10 text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {isSearching ? (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground animate-spin" />
            ) : (
              searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X />
                </button>
              )
            )}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <span className="text-sm text-muted-foreground">Popular:</span>
            {popularSearches.map((term) => (
              <Badge
                key={term}
                variant="secondary"
                className="cursor-pointer hover:bg-primary/20"
                onClick={() => handlePopularSearch(term)}
              >
                {term}
              </Badge>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold font-headline mb-8 text-center">
            {searchQuery
              ? `Search Results for "${searchQuery}"`
              : "All Projects"}
          </h2>
          {loading || isSearching ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
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
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project: Project, index: number) => (
                  <ProjectCard
                    key={project.$id}
                    project={project}
                    rank={
                      searchQuery
                        ? undefined
                        : index + 1 + (currentPage - 1) * PROJECTS_PER_PAGE
                    }
                  />
                ))}
              </div>
              <div className="mt-12 text-center">
                <ProjectPagination
                  page={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          ) : (
            <div className="text-center text-muted-foreground py-16">
              <h3 className="text-2xl font-semibold mb-2">No Projects Found</h3>
              <p>Try a different search term or check back later.</p>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
