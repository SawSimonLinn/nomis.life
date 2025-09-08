
'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Review, User } from '@/lib/types';
import { addReview, updateReview,  } from '@/lib/actions/addReview';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2 } from 'lucide-react';
import StarRating from './star-rating';
import { rewriteReview } from '@/ai/flows/review-rewriting';
import { useState } from 'react';

const reviewSchema = z.object({
  rating: z.number().min(1, 'Rating is required').max(5),
  comment: z.string().min(10, 'Comment must be at least 10 characters.'),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
    projectId: string;
    user: User;
    review?: Review;
    onSuccess: () => void;
    onCancel?: () => void;
}

export default function ReviewForm({ projectId, user, review, onSuccess, onCancel }: ReviewFormProps) {
  const { toast } = useToast();
  const isEditing = !!review;
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { 
        rating: review?.rating || 0, 
        comment: review?.comment || '' 
    },
  });

  const commentValue = form.watch('comment');

  const handleRewrite = async () => {
    const currentComment = form.getValues('comment');
    if (!currentComment || currentComment.trim().length < 10) {
      toast({
        variant: 'destructive',
        title: 'Comment is too short',
        description: 'Please write a comment of at least 10 characters before using AI.',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await rewriteReview({ comment: currentComment });
      if (result.rewrittenComment) {
        form.setValue('comment', result.rewrittenComment, { shouldValidate: true });
        toast({
          title: 'Review rewritten!',
          description: 'Feel free to edit the generated text before submitting.',
        });
      }
    } catch (error) {
      console.error('Error rewriting review:', error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'The AI could not rewrite your review. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = async (data: ReviewFormData) => {
    try {
      if (isEditing) {
        await updateReview(review.$id, data);
        toast({ title: 'Success', description: 'Your review has been updated!' });
      } else {
        await addReview({
          projectId,
          userId: user.id,
          username: user.username,
          avatar: user.avatarUrl,
          rating: data.rating,
          comment: data.comment,
        });
        toast({ title: 'Success', description: 'Your review has been submitted!' });
      }
      form.reset();
      onSuccess();
    } catch (error: any) {
      console.error('Review submit error:', error.message || error);
  
      if (error.message === 'You cannot review your own project.') {
        toast({
          variant: 'destructive',
          title: 'Oops!',
          description: 'You can’t review your own project.',
        });
        return;
      }
  
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to submit review.',
      });
    }
  };
  

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
       <div className="space-y-2">
            <label className="text-sm font-medium">Your Rating</label>
            <Controller
                name="rating"
                control={form.control}
                render={({ field }) => (
                <StarRating
                    rating={field.value}
                    setRating={(rating) => field.onChange(rating)}
                />
                )}
            />
            {form.formState.errors.rating && <p className="text-sm text-destructive">{form.formState.errors.rating.message}</p>}
       </div>
       <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="comment" className="text-sm font-medium">Your Review</label>
               <Button type="button" variant="outline" size="sm" onClick={handleRewrite} disabled={isGenerating || !commentValue}>
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                  <span className="ml-2">Rewrite with AI</span>
              </Button>
            </div>
            <Textarea
                id="comment"
                placeholder={`What did you think of this project?`}
                {...form.register('comment')}
            />
            {form.formState.errors.comment && <p className="text-sm text-destructive">{form.formState.errors.comment.message}</p>}
       </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="animate-spin mr-2" />}
            {isEditing ? 'Update Review' : 'Submit Review'}
        </Button>
        {isEditing && onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
            </Button>
        )}
      </div>
    </form>
  );
}
