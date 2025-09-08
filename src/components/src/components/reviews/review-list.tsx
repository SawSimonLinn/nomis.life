
'use client';

import { useState, useEffect } from 'react';
import type { Review, User } from '@/lib/types';
import { getAppwriteUser, mapAppwriteUserToUser } from '@/lib/api';
import { deleteReview } from '@/lib/actions/addReview';

import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Card } from '../ui/card';
import ReviewForm from './review-form';
import { Separator } from '../ui/separator';
import { Star, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';


interface ReviewListProps {
    projectId: string;
    initialReviews: Review[];
    onReviewChange: () => void;
}

export default function ReviewList({ projectId, initialReviews, onReviewChange }: ReviewListProps) {
    const [reviews, setReviews] = useState<Review[]>(initialReviews);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        setReviews(initialReviews);
    }, [initialReviews]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const appwriteUser = await getAppwriteUser();
                if(appwriteUser) {
                    const mappedUser = await mapAppwriteUserToUser(appwriteUser);
                    setCurrentUser(mappedUser);
                }
            } catch (e) {
                setCurrentUser(null);
            }
        };
        fetchUser();
    }, []);

    const handleFormSuccess = () => {
        setEditingReviewId(null);
        onReviewChange();
    };

    const handleDelete = async (reviewId: string) => {
        try {
            await deleteReview(reviewId);
            toast({ title: 'Review deleted' });
            onReviewChange();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not delete review.'});
        }
    };
  
    return (
        <div className="space-y-6">
            {currentUser ? (
                <ReviewForm 
                    projectId={projectId} 
                    user={currentUser}
                    onSuccess={onReviewChange}
                />
            ) : (
                <div className="text-center text-sm text-muted-foreground p-4 border rounded-lg">
                    <Link href="/signin" className="text-primary underline">Sign in</Link> to leave a review.
                </div>
            )}

            <Separator />
            
            <div className="space-y-4">
                <h3 className="font-semibold text-lg">All Reviews ({reviews.length})</h3>
                {reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    No reviews yet. Be the first to leave one!
                </p>
                ) : (
                reviews.map((review: Review) => (
                    <Card key={review.$id} className="p-4">
                        {editingReviewId === review.$id ? (
                             <ReviewForm
                                projectId={projectId}
                                user={currentUser!}
                                review={review}
                                onSuccess={handleFormSuccess}
                                onCancel={() => setEditingReviewId(null)}
                            />
                        ) : (
                            <div className="flex items-start gap-4">
                                <Link href={`/${review.username}`}>
                                    <Avatar className="h-10 w-10 border">
                                        <AvatarImage src={review.avatar} alt={review.username} />
                                        <AvatarFallback>{review.username.charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                </Link>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <div className='flex items-center gap-2'>
                                            <Link href={`/${review.username}`}>
                                                <span className="text-sm font-semibold hover:underline">{review.username}</span>
                                            </Link>
                                            <span className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(review.$createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                         {currentUser?.id === review.userId && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => setEditingReviewId(review.$id)}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        <span>Edit</span>
                                                    </DropdownMenuItem>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                                <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                                                                <span className="text-destructive">Delete</span>
                                                            </DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This action cannot be undone. This will permanently delete your review.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction  onClick={() => handleDelete(review.$id)}>
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-0.5 my-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                                    ))}
                                    </div>
                                    <p className="text-sm text-foreground/90 whitespace-pre-wrap">{review.comment}</p>
                                </div>
                            </div>
                        )}
                    </Card>
                ))
                )}
            </div>
        </div>
    );
}
