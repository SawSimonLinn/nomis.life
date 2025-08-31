'use client';

import { useState } from 'react';
import type { Project } from '@/lib/types';
import { allProjects, getCurrentUser } from '@/lib/data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ProjectForm from '@/components/project-form';
import SkillsForm from '@/components/skills-form';
import { Badge } from '@/components/ui/badge';
import SoftSkillsForm from '@/components/soft-skills-form';
import ContributionForm from '@/components/contribution-form';

export default function DashboardPage() {
  const user = getCurrentUser();
  const [projects, setProjects] = useState<Project[]>(allProjects.filter(p => p.userId === user.id));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const handleAddProject = () => {
    setEditingProject(null);
    setIsDialogOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsDialogOpen(true);
  };
  
  const handleDeleteProject = (projectId: string) => {
    setProjects(projects.filter(p => p.id !== projectId));
  };

  const onFormSubmit = (data: Omit<Project, 'id' | 'user' | 'userId'>) => {
    if (editingProject) {
      // Update project
      setProjects(projects.map(p => p.id === editingProject.id ? { ...p, ...data } : p));
    } else {
      // Add new project
      const newProject: Project = {
        ...data,
        id: `p${Date.now()}`,
        user,
        userId: user.id,
      };
      setProjects([newProject, ...projects]);
    }
    setIsDialogOpen(false);
    setEditingProject(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-headline">Dashboard</h1>
        <p className="text-muted-foreground">Manage your public portfolio here.</p>
      </div>
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
                <CardDescription>Add, edit, or remove your showcase projects.</CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
                  setIsDialogOpen(isOpen);
                  if (!isOpen) {
                    setEditingProject(null);
                  }
                }}>
                <DialogTrigger asChild>
                  <Button onClick={handleAddProject}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingProject ? 'Edit Project' : 'Add New Project'}</DialogTitle>
                    <DialogDescription>
                      Fill in the details for your project. Click save when you're done.
                    </DialogDescription>
                  </DialogHeader>
                  <ProjectForm
                    project={editingProject}
                    onSubmit={onFormSubmit}
                  />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Tech</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.title}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {project.tech.slice(0, 3).map(tech => <Badge key={tech} variant="secondary">{tech}</Badge>)}
                          {project.tech.length > 3 && <Badge variant="outline">...</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEditProject(project)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteProject(project.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="profile">
          <div className="grid grid-cols-1 gap-8">
            <SkillsForm />
            <SoftSkillsForm />
            <ContributionForm />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
