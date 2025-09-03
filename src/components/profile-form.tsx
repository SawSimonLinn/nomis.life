
'use client';

import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/types';
import { SKILLS_LIST, SOFT_SKILLS_LIST, CAREER_SKILLS } from '@/lib/constants';
import { updateUserPreferences, uploadResume, deleteResume, getResumeUrl } from '@/lib/api';
import { generateContribution } from '@/ai/flows/contribution-generation';
import { Loader2, Wand2, FileText, Trash2, UploadCloud, Briefcase } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const CAREER_PATHS = {
    software_engineering: 'Software Engineering',
    data_science: 'Data Science',
    qa_engineering: 'QA Engineering',
    cyber_security: 'Cybersecurity',
    ui_ux: 'UI/UX Design',
    product_management: 'Product Management',
    devops: 'DevOps / Cloud',
};

const profileFormSchema = z.object({
  careerPath: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
  contactEmail: z.string().email().optional().or(z.literal('')),
  phoneNumber: z.string().optional().or(z.literal('')),
  skills: z.array(z.string()).refine((value) => value.length > 0, {
    message: 'You have to select at least one hard skill.',
  }),
  softSkills: z
    .array(z.string())
    .min(3, { message: 'Please select at least 3 soft skills.' })
    .max(5, { message: 'You can select a maximum of 5 soft skills.' }),
  contribution: z.string().min(10, {
    message: 'Your contribution statement must be at least 10 characters.',
  }).max(500, {
    message: 'Your contribution statement must not be longer than 500 characters.',
  }),
  resumeFileId: z.string().optional(),
  newResume: z.custom<File>().optional(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  user: User;
  onProfileUpdate: () => void;
}

export default function ProfileForm({ user, onProfileUpdate }: ProfileFormProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      skills: user.skills || [],
      softSkills: user.softSkills || [],
      contribution: user.contribution || '',
      linkedinUrl: user.linkedinUrl || '',
      portfolioUrl: user.portfolioUrl || '',
      contactEmail: user.contactEmail || '',
      phoneNumber: user.phoneNumber || '',
      resumeFileId: user.resumeFileId || '',
      careerPath: user.careerPath || '',
    },
  });
  
  useEffect(() => {
    form.reset({
      skills: user.skills || [],
      softSkills: user.softSkills || [],
      contribution: user.contribution || '',
      linkedinUrl: user.linkedinUrl || '',
      portfolioUrl: user.portfolioUrl || '',
      contactEmail: user.contactEmail || '',
      phoneNumber: user.phoneNumber || '',
      resumeFileId: user.resumeFileId || '',
      careerPath: user.careerPath || '',
    });
  }, [user, form]);

  const selectedSoftSkillsCount = form.watch('softSkills')?.length || 0;
  const contributionValue = form.watch('contribution');
  const careerPath = form.watch('careerPath');

  const relevantSkills = careerPath ? CAREER_SKILLS[careerPath] : SKILLS_LIST;

  async function onSubmit(data: ProfileFormData) {
    try {
      let resumeFileId = data.resumeFileId;

      if (data.newResume) {
        // If there was an old resume, delete it
        if (user.resumeFileId) {
            await deleteResume(user.resumeFileId);
        }
        // Upload the new one
        const uploadedFile = await uploadResume(data.newResume);
        resumeFileId = uploadedFile.$id;
      }

      await updateUserPreferences({
          ...data,
          resumeFileId: resumeFileId
      });
      toast({
        title: "Profile Updated",
        description: "Your profile details have been successfully updated.",
      });
      onProfileUpdate(); // Callback to refetch data on the parent component
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Update Failed",
        description: "There was an error updating your profile. Please try again.",
      });
      console.error('Failed to update profile:', error);
    }
  }

  async function handleGenerateContribution() {
      const keywords = form.getValues('contribution');

      if (!keywords || keywords.trim().length < 3) {
        toast({
            variant: 'destructive',
            title: 'Keywords required',
            description: 'Please enter a few keywords in the text area to generate a statement.',
        });
        return;
      }
      
      setIsGenerating(true);
      try {
        const result = await generateContribution({ keywords });
        if(result.contribution) {
            form.setValue('contribution', result.contribution, { shouldValidate: true });
            toast({
                title: 'Statement generated!',
                description: 'The AI has rewritten your contribution statement. Feel free to edit it.',
            });
        }
      } catch (error) {
        console.error('Error generating contribution:', error);
        toast({
            variant: 'destructive',
            title: 'Generation Failed',
            description: 'There was an error generating your statement. Please try again.',
        });
      } finally {
        setIsGenerating(false);
      }
  }

  const handleRemoveResume = async () => {
    if (user.resumeFileId) {
        try {
            await deleteResume(user.resumeFileId);
            await updateUserPreferences({ resumeFileId: '' });
            form.setValue('resumeFileId', '');
            toast({ title: 'Resume removed' });
            onProfileUpdate();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not remove resume.' });
        }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

         <Card>
            <CardHeader>
                <CardTitle>Career Goal</CardTitle>
                <CardDescription>Select your target career path. This helps tailor your experience and skill selection.</CardDescription>
            </CardHeader>
            <CardContent>
                 <FormField
                    control={form.control}
                    name="careerPath"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Career Path</FormLabel>
                         <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Select your career path..." />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {Object.entries(CAREER_PATHS).map(([key, value]) => (
                                    <SelectItem key={key} value={key}>{value}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>

         <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Provide ways for others to connect with you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="linkedinUrl"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>LinkedIn Profile URL</FormLabel>
                        <FormControl>
                            <Input placeholder="https://linkedin.com/in/your-profile" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="portfolioUrl"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Personal Portfolio URL</FormLabel>
                        <FormControl>
                            <Input placeholder="https://your-portfolio.com" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Public Contact Email</FormLabel>
                        <FormControl>
                            <Input placeholder="your-public-email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Phone Number (Optional)</FormLabel>
                        <FormControl>
                            <Input placeholder="+1 (123) 456-7890" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
          </CardContent>
        </Card>

         <Card>
            <CardHeader>
                <CardTitle>Resume</CardTitle>
                <CardDescription>Upload your resume as a PDF. This will be visible on your public profile.</CardDescription>
            </CardHeader>
            <CardContent>
                 <FormField
                    control={form.control}
                    name="newResume"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Resume PDF</FormLabel>
                            {user.resumeFileId ? (
                                <div className="flex items-center gap-4">
                                    <a href={getResumeUrl(user.resumeFileId)} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-2">
                                        <FileText />
                                        View Current Resume
                                    </a>
                                    <Button type="button" variant="outline" size="sm" onClick={() => resumeInputRef.current?.click()}>Change</Button>
                                    <Button type="button" variant="destructive" size="sm" onClick={handleRemoveResume}>Remove</Button>
                                </div>
                            ) : (
                                <FormControl>
                                    <Button type="button" variant="outline" onClick={() => resumeInputRef.current?.click()}>
                                        <UploadCloud />
                                        Upload PDF
                                    </Button>
                                </FormControl>
                            )}
                             <input 
                                type="file"
                                accept=".pdf"
                                ref={resumeInputRef}
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if(file) {
                                        field.onChange(file)
                                        toast({title: "File selected", description: `${file.name}. Click "Save All Changes" to upload.`})
                                    }
                                }}
                             />
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hard Skills</CardTitle>
            <CardDescription>Select the technical skills you want to showcase on your profile. The list changes based on your career path.</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {relevantSkills.map((item) => (
                      <FormField
                        key={item}
                        control={form.control}
                        name="skills"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, item])
                                    : field.onChange(field.value?.filter((value) => value !== item));
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">{item}</FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                   <FormMessage className="pt-4" />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Soft Skills</CardTitle>
                <CardDescription>Select 3 to 5 interpersonal skills you want to highlight.</CardDescription>
            </CardHeader>
            <CardContent>
                <FormField
                    control={form.control}
                    name="softSkills"
                    render={() => (
                        <FormItem>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {SOFT_SKILLS_LIST.map((item) => (
                                <FormField
                                    key={item}
                                    control={form.control}
                                    name="softSkills"
                                    render={({ field }) => {
                                    const isChecked = field.value?.includes(item);
                                    const canCheckMore = selectedSoftSkillsCount < 5;
                                    return (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                            checked={isChecked}
                                            disabled={!isChecked && !canCheckMore}
                                            onCheckedChange={(checked) => {
                                                return checked
                                                ? field.onChange([...field.value, item])
                                                : field.onChange(field.value?.filter((value) => value !== item));
                                            }}
                                            />
                                        </FormControl>
                                        <FormLabel className="font-normal">{item}</FormLabel>
                                        </FormItem>
                                    );
                                    }}
                                />
                                ))}
                            </div>
                            <FormMessage className="pt-4" />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>What I Bring to the Table</CardTitle>
                <CardDescription>Enter a few keywords or a short phrase and let AI write a professional statement for you.</CardDescription>
            </CardHeader>
            <CardContent>
                <FormField
                    control={form.control}
                    name="contribution"
                    render={({ field }) => (
                        <FormItem>
                        <div className="flex items-center justify-between">
                            <FormLabel>Your Statement</FormLabel>
                             <Button type="button" variant="outline" size="sm" onClick={handleGenerateContribution} disabled={isGenerating || !contributionValue}>
                                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                                <span className="ml-2">Generate with AI</span>
                            </Button>
                        </div>
                        <FormControl>
                            <Textarea
                            placeholder="e.g., 'Bridging technical and non-technical gaps, creative problem solving, fast learner.'"
                            className="resize-none"
                            rows={5}
                            {...field}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
        
        <div className="flex justify-end">
            <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="animate-spin mr-2" />}
                {form.formState.isSubmitting ? 'Saving...' : 'Save All Changes'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
