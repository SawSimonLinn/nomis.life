

'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Models } from 'appwrite';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2, UploadCloud, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { suggestProjectTech } from '@/ai/flows/ai-tech-generation';
import type { Project, User } from '@/lib/types';
import { rewriteProjectDescription } from '@/ai/flows/project-description-generation';
import { generateProjectDetails } from '@/ai/flows/project-details-generation';
import { createProject, updateProject, uploadImage, deleteImage, getImageUrl, mapAppwriteUserToUser } from '@/lib/api';
import { Separator } from './ui/separator';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// We store File objects for new uploads, and file IDs (strings) for existing images.
type ImageValue = File | string;

const projectFormSchema = z.object({
  title: z.string().min(2, { message: 'Title must be at least 2 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  githubUrl: z.string().url({ message: 'Please enter a valid GitHub URL.' }),
  demoUrl: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
  imageValues: z.array(z.custom<ImageValue>()).min(1, { message: 'Please add at least one image.' }),
  techStack: z.string().min(1, { message: 'Please add at least one tech.' }),
  features: z.string().min(1, { message: 'Please add at least one feature.' }),
  challenges: z.string().min(10, { message: 'Challenges must be at least 10 characters.' }),
  learnings: z.string().min(10, { message: 'Learnings must be at least 10 characters.' }),
});

type ProjectFormData = z.infer<typeof projectFormSchema>;

interface ProjectFormProps {
  project?: Project | null;
  onSubmitSuccess: () => void;
  user: Models.User<Models.Preferences>;
}

export default function ProjectForm({ project, onSubmitSuccess, user }: ProjectFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuggestingTech, setIsSuggestingTech] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isGeneratingDetails, setIsGeneratingDetails] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [mappedUser, setMappedUser] = useState<User | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const projectImageBucketId = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID!;


  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: '',
      description: '',
      githubUrl: '',
      demoUrl: '',
      imageValues: [],
      techStack: '',
      features: '',
      challenges: '',
      learnings: '',
    },
  });

  useEffect(() => {
    const fetchUser = async () => {
      const u = await mapAppwriteUserToUser(user);
      setMappedUser(u);
    }
    fetchUser();

    if (project) {
        form.reset({
            title: project.title || '',
            description: project.description || '',
            githubUrl: project.githubUrl || '',
            demoUrl: project.demoUrl || '',
            imageValues: project.imageIds || [],
            techStack: project.techStack?.join(', ') || '',
            features: project.features?.join(', ') || '',
            challenges: project.challenges || '',
            learnings: project.learnings || '',
        });
        const previews = project.imageIds?.map(id => getImageUrl(id, projectImageBucketId)) || [];
        setImagePreviews(previews);
    } else {
        form.reset({
            title: '',
            description: '',
            githubUrl: '',
            demoUrl: '',
            imageValues: [],
            techStack: '',
            features: '',
            challenges: '',
            learnings: '',
        });
        setImagePreviews([]);
    }
  }, [project, user, form, projectImageBucketId]);

  const githubUrlValue = form.watch('githubUrl');
  const descriptionValue = form.watch('description');
  const imageValues = form.watch('imageValues');

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
        const newFiles = Array.from(files);
        const newPreviews = newFiles.map(file => URL.createObjectURL(file));
        
        form.setValue('imageValues', [...imageValues, ...newFiles], { shouldValidate: true });
        setImagePreviews([...imagePreviews, ...newPreviews]);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImageValues = [...imageValues];
    const newPreviews = [...imagePreviews];
    
    newImageValues.splice(index, 1);
    newPreviews.splice(index, 1);
    
    form.setValue('imageValues', newImageValues, { shouldValidate: true });
    setImagePreviews(newPreviews);
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (event: React.DragEvent, index: number) => {
    event.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newImageValues = [...imageValues];
    const draggedItem = newImageValues.splice(draggedIndex, 1)[0];
    newImageValues.splice(index, 0, draggedItem);
    
    const newPreviews = [...imagePreviews];
    const draggedPreview = newPreviews.splice(draggedIndex, 1)[0];
    newPreviews.splice(index, 0, draggedPreview);
    
    setDraggedIndex(index);
    form.setValue('imageValues', newImageValues, { shouldValidate: true });
    setImagePreviews(newPreviews);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSuggestTech = async () => {
    if (!githubUrlValue) {
      toast({
        variant: 'destructive',
        title: 'GitHub URL required',
        description: 'Please enter a GitHub repository URL to suggest tech.',
      });
      return;
    }
    setIsSuggestingTech(true);
    try {
      const result = await suggestProjectTech({ githubRepoUrl: githubUrlValue });
      if (result.techStack && result.techStack.length > 0) {
        form.setValue('techStack', result.techStack.join(', '));
        toast({
          title: 'Tech suggested!',
          description: 'AI-powered tech has been added. Feel free to edit them.',
        });
      } else {
         toast({
          variant: 'destructive',
          title: 'Could not suggest tech',
          description: 'We were unable to generate tech for this repository.',
        });
      }
    } catch (error: any) {
      console.error('Error suggesting tech:', error);
      const errorMessage = error.message?.includes('503')
        ? 'The AI service is currently overloaded. Please try again in a few moments.'
        : 'Failed to suggest tech. Please try again.';
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: errorMessage,
      });
    } finally {
      setIsSuggestingTech(false);
    }
  };
  
  const handleRewriteDescription = async () => {
    if (!descriptionValue) {
      toast({
        variant: 'destructive',
        title: 'Description required',
        description: 'Please write a description first to have it rewritten by AI.',
      });
      return;
    }
     setIsGeneratingDesc(true);
    try {
      const result = await rewriteProjectDescription({ description: descriptionValue });
      if (result.rewrittenDescription) {
        form.setValue('description', result.rewrittenDescription);
        toast({
          title: 'Description rewritten!',
          description: 'The AI has rewritten the description for you. Feel free to edit it.',
        });
      } else {
         toast({
          variant: 'destructive',
          title: 'Could not rewrite description',
        });
      }
    } catch (error) {
      console.error('Error generating description:', error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Failed to rewrite description. Please try again.',
      });
    } finally {
      setIsGeneratingDesc(false);
    }
  };
  
  const handleGenerateDetails = async () => {
    if (!descriptionValue) {
      toast({
        variant: 'destructive',
        title: 'Description required',
        description: 'Please enter a description to generate details.',
      });
      return;
    }
     setIsGeneratingDetails(true);
    try {
      const result = await generateProjectDetails({ 
        description: descriptionValue,
        careerPath: mappedUser?.careerPath
      });
      if (result) {
        if(result.features) form.setValue('features', result.features.join(', '));
        if(result.challenges) form.setValue('challenges', result.challenges);
        if(result.learnings) form.setValue('learnings', result.learnings);
        toast({
          title: 'Project details generated!',
          description: 'The AI has filled in features, challenges, and learnings.',
        });
      } else {
         toast({
          variant: 'destructive',
          title: 'Could not generate details',
        });
      }
    } catch (error) {
      console.error('Error generating details:', error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Failed to generate project details. Please try again.',
      });
    } finally {
      setIsGeneratingDetails(false);
    }
  };

  const processSubmit = async (data: ProjectFormData) => {
    if (!mappedUser) {
        toast({ variant: 'destructive', title: 'Error', description: 'User data not loaded yet.' });
        return;
    }
    setIsSubmitting(true);
    try {
      const uploadedImageIds: string[] = [];
      
      // Handle image uploads
      for (const value of data.imageValues) {
        if (typeof value === 'string') {
          // This is an existing image ID, keep it.
          uploadedImageIds.push(value);
        } else {
          // This is a new File object, upload it.
          const uploadedFile = await uploadImage(value, projectImageBucketId);
          uploadedImageIds.push(uploadedFile.$id);
        }
      }
      
      // If editing, find images that were removed and delete them from storage.
      if (project) {
        const originalImageIds = project.imageIds || [];
        const removedImageIds = originalImageIds.filter(id => !uploadedImageIds.includes(id));
        await Promise.all(removedImageIds.map(id => deleteImage(id, projectImageBucketId)));
      }

      const payload = {
        title: data.title,
        slug: data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
        description: data.description,
        githubUrl: data.githubUrl,
        demoUrl: data.demoUrl,
        techStack: data.techStack.split(',').map(tag => tag.trim().toLowerCase()).filter(Boolean),
        features: data.features.split(',').map(feature => feature.trim()).filter(Boolean),
        challenges: data.challenges,
        learnings: data.learnings,
        imageIds: uploadedImageIds,
        userId: user.$id,
        developerName: mappedUser.name,
        views: project?.views || 0,
      };

      if (project) {
        await updateProject(project.$id, payload);
        toast({ title: 'Project updated!' });
      } else {
        await createProject(payload);
        toast({ title: 'Project created!' });
      }
      onSubmitSuccess();

    } catch (error) {
      console.error('Failed to save project', error);
      toast({ variant: 'destructive', title: 'Submission failed', description: 'Could not save the project. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(processSubmit)} className="space-y-6 max-h-[80vh] overflow-y-auto p-1 pr-4">
        
        {/* Section 1: Basic Info */}
        <div className="space-y-4 p-2">
            <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Project Title</FormLabel>
                <FormControl>
                    <Input placeholder="My Awesome Project" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Description</FormLabel>
                    <Button type="button" variant="outline" size="sm" onClick={handleRewriteDescription} disabled={isGeneratingDesc || !descriptionValue}>
                        {isGeneratingDesc ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                        <span className="ml-2">Rewrite with AI</span>
                    </Button>
                  </div>
                <FormControl>
                    <Textarea placeholder="A detailed description of your project. The first part will be used as a short summary on project cards." className="resize-none" rows={6} {...field} />
                </FormControl>
                 <FormDescription>Write a draft of your description and let AI rewrite it for you. This will appear on the main project page.</FormDescription>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        
        <Separator />

        {/* Section 2: Links & Media */}
        <div className="space-y-4 p-2">
            <FormField
              control={form.control}
              name="imageValues"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Images</FormLabel>
                   <FormControl>
                    <div>
                      <input
                        type="file"
                        accept="image/jpeg, image/png"
                        multiple
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                        <UploadCloud className="mr-2" />
                        Upload Images
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>Upload one or more images (JPG, PNG). Drag to reorder.</FormDescription>
                   {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      {imagePreviews.map((src, index) => (
                        <div 
                          key={src + index} 
                          className={cn(
                            "relative group rounded-md overflow-hidden cursor-grab",
                            draggedIndex === index && "opacity-50 scale-95"
                          )}
                          draggable
                          onDragStart={() => handleDragStart(index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDragEnd={handleDragEnd}
                        >
                           <Image
                            src={src}
                            alt={`Preview ${index + 1}`}
                            width={200}
                            height={150}
                            className="rounded-md object-cover w-full aspect-[4/3]"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="githubUrl"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>GitHub Repo URL</FormLabel>
                        <FormControl>
                        <Input placeholder="https://github.com/user/repo" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="demoUrl"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Live Demo URL (Optional)</FormLabel>
                        <FormControl>
                        <Input placeholder="https://my-project.com" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
             <FormField
                control={form.control}
                name="techStack"
                render={({ field }) => (
                    <FormItem>
                    <div className="flex items-center justify-between">
                        <FormLabel>Tech Stack (comma-separated)</FormLabel>
                        <Button type="button" variant="outline" size="icon" onClick={handleSuggestTech} disabled={isSuggestingTech || !githubUrlValue}>
                            {isSuggestingTech ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                            <span className="sr-only">Suggest with AI</span>
                        </Button>
                    </div>
                    <FormControl>
                    <Input placeholder="React, Next.js, Tailwind CSS" {...field} />
                    </FormControl>
                    <FormDescription>Enter tech manually, or click the wand to suggest tech based on your GitHub repo.</FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>

        <Separator />

        {/* Section 3: Project Details */}
        <div className="space-y-4 p-2">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Project Details</h3>
                <Button type="button" variant="outline" onClick={handleGenerateDetails} disabled={isGeneratingDetails || !descriptionValue}>
                    {isGeneratingDetails ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                    <span className="ml-2 hidden sm:inline">Generate Details with AI</span>
                    <span className="ml-2 sm:hidden">Generate</span>
                </Button>
            </div>
            <FormDescription>Generate the sections below based on your project description.</FormDescription>
             <FormField
                control={form.control}
                name="features"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Features (comma-separated)</FormLabel>
                    <FormControl>
                        <Textarea placeholder="Interactive chart creation, Supports multiple data sources, ..." className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="challenges"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Challenges</FormLabel>
                    <FormControl>
                        <Textarea placeholder="What were the main challenges you faced?" className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="learnings"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>What I Learned</FormLabel>
                    <FormControl>
                        <Textarea placeholder="What new skills or concepts did you learn?" className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>
       
        <div className="flex justify-end pt-4 pr-2">
          <Button type="submit" disabled={isSubmitting}>
             {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {project ? 'Save Changes' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
