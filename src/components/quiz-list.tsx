'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Play } from 'lucide-react';
import Link from 'next/link';
import { getQuizzes, type Quiz } from '@/services/quiz'; // Assuming service exists
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from './ui/skeleton';
import { cn } from '@/lib/utils'; // Import cn utility

// Re-using skeleton from quizzes/page.tsx for consistency during loading
function QuizListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
       {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-lg" /> // Added rounded-lg
       ))}
    </div>
  );
}


export default function QuizList() {
   const { data: quizzes, isLoading, error } = useQuery<Quiz[]>({
     queryKey: ['quizzes'],
     queryFn: getQuizzes,
   });

   if (isLoading) {
     return <QuizListSkeleton />;
   }

   if (error) {
     return <p className="text-destructive">Failed to load quizzes. Please try again later.</p>;
   }

   if (!quizzes || quizzes.length === 0) {
       return (
        <Card className="text-center p-8">
           <CardHeader>
                <CardTitle>No Quizzes Available Yet</CardTitle>
                 <CardDescription>
                     Check back soon for interactive quizzes!
                 </CardDescription>
            </CardHeader>
         </Card>
       )
   }


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {quizzes.map((quiz) => (
        <Card key={quiz.id} className={cn(
            "flex flex-col group", // Added group class
            "transition-transform duration-300 ease-in-out", // Added transition classes
            "hover:scale-105 hover:shadow-xl" // Added hover effect classes
        )}>
          <CardHeader className="pb-4"> {/* Reduced bottom padding */}
            <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-5 w-5 text-accent" />
                 <CardTitle className="text-xl">{quiz.title}</CardTitle>
            </div>
            <CardDescription>{quiz.description}</CardDescription>
             <CardDescription className="text-xs pt-1">
                 {quiz.questionCount} Questions
            </CardDescription>
          </CardHeader>
           <CardFooter className="mt-auto pt-0 pb-4 px-4"> {/* Adjusted padding */}
            {/* Link to actual quiz page e.g., /quizzes/[quizId] */}
            <Button asChild className="w-full">
               <Link href={`/quizzes/${quiz.id}`}>
                 {/* Removed unnecessary span wrapper */}
                 <Play className="mr-2 h-4 w-4 inline-block" />
                 Start Quiz
               </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
