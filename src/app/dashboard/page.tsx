"use client";

import { useState, useEffect } from "react";
import type { Project, User } from "@/lib/types";
import { getAppwriteUser, mapAppwriteUserToUser } from "@/lib/api";
import { getUserProjects, deleteProject } from "@/lib/api";
import type { Models } from "appwrite";
import { account } from "@/lib/appwrite"; // <-- Add this import for the account object
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  GitBranch,
  TrendingUp,
  CalendarDays,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ProjectForm from "@/components/project-form";
import ProfileForm from "@/components/profile-form"; // Import the new ProfileForm
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { useAuthSession } from "@/hooks/useAuthSession";

function DashboardStats({ projects }: { projects: Project[] }) {
  if (!projects.length) {
    return null;
  }

  const totalProjects = projects.length;
  const totalViews = projects.reduce((sum, p) => sum + (p.views || 0), 0);
  const lastUpdated = new Date(
    Math.max(...projects.map((p) => new Date(p.$updatedAt).getTime()))
  );

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          <GitBranch className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalProjects}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Project Views
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalViews.toLocaleString()}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatDistanceToNow(lastUpdated, { addSuffix: true })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [appwriteUser, setAppwriteUser] =
    useState<Models.User<Models.Preferences> | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const { user: authUser, loading: authLoading } = useAuthSession();

  const fetchUserAndProjects = async () => {
    setLoading(true);
    try {
      const fetchedAppwriteUser = await getAppwriteUser();
      if (fetchedAppwriteUser) {
        setAppwriteUser(fetchedAppwriteUser);
        const mappedUser = await mapAppwriteUserToUser(fetchedAppwriteUser);
        setUser(mappedUser);
        const userProjects = await getUserProjects(fetchedAppwriteUser.$id);
        setProjects(userProjects);
      }
    } catch (error) {
      console.error("Error fetching data for dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   fetchUserAndProjects();
  // }, []);

  // useEffect(() => {
  //   const init = async () => {
  //     const session = await account.getSession("current").catch(() => null);
  //     if (session) {
  //       fetchUserAndProjects(); // or mapAppwriteUserToUser
  //     } else {
  //       console.log("👻 Still a guest — no session yet");
  //     }
  //   };
  //   init();
  // }, []);

  useEffect(() => {
    if (!authLoading && authUser) {
      fetchUserAndProjects(); // only fetch when confirmed logged in
    }
  }, [authUser, authLoading]);

  const refetchProjects = async () => {
    if (appwriteUser) {
      const userProjects = await getUserProjects(appwriteUser.$id);
      setProjects(userProjects);
    }
  };

  const handleAddProject = () => {
    setEditingProject(null);
    setIsDialogOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsDialogOpen(true);
  };

  const confirmDeleteProject = async () => {
    if (projectToDelete) {
      try {
        await deleteProject(projectToDelete.$id);
        // Optionally delete images from storage here if needed
        setProjects(projects.filter((p) => p.$id !== projectToDelete.$id));
      } catch (error) {
        console.error("Failed to delete project", error);
      }
    }
    setProjectToDelete(null);
    setDeleteConfirmation("");
  };

  const onFormSubmit = () => {
    setIsDialogOpen(false);
    setEditingProject(null);
    refetchProjects();
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!authUser || !user || !appwriteUser) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12 text-center">
        <p>Please log in to view your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-headline">Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your public portfolio here.
        </p>
      </div>

      <DashboardStats projects={projects} />

      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="projects">My Projects</TabsTrigger>
          <TabsTrigger value="profile">My Profile</TabsTrigger>
        </TabsList>
        <TabsContent value="projects">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Projects</CardTitle>
                <CardDescription>
                  Add, edit, or remove your showcase projects.
                </CardDescription>
              </div>
              <Dialog
                open={isDialogOpen}
                onOpenChange={(isOpen) => {
                  setIsDialogOpen(isOpen);
                  if (!isOpen) {
                    setEditingProject(null);
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button onClick={handleAddProject}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingProject ? "Edit Project" : "Add New Project"}
                    </DialogTitle>
                    <DialogDescription>
                      Fill in the details for your project. Click save when
                      you're done.
                    </DialogDescription>
                  </DialogHeader>
                  <ProjectForm
                    project={editingProject}
                    onSubmitSuccess={onFormSubmit}
                    user={appwriteUser}
                  />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Tech</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.$id}>
                      <TableCell className="font-medium">
                        {project.title}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                          {(project.views || 0).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {project.techStack.slice(0, 3).map((tech) => (
                            <Badge key={tech} variant="secondary">
                              {tech}
                            </Badge>
                          ))}
                          {project.techStack.length > 3 && (
                            <Badge variant="outline">...</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditProject(project)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog
                          onOpenChange={(open) => {
                            if (!open) {
                              setProjectToDelete(null);
                              setDeleteConfirmation("");
                            }
                          }}
                        >
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setProjectToDelete(project)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Are you absolutely sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete your project from our
                                servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="space-y-2">
                              <Label htmlFor="delete-confirm">
                                To confirm, type "delete" below
                              </Label>
                              <Input
                                id="delete-confirm"
                                value={deleteConfirmation}
                                onChange={(e) =>
                                  setDeleteConfirmation(e.target.value)
                                }
                              />
                            </div>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={confirmDeleteProject}
                                disabled={
                                  deleteConfirmation.toLowerCase() !== "delete"
                                }
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="profile">
          <ProfileForm user={user} onProfileUpdate={fetchUserAndProjects} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
