import type { Metadata } from 'next';
import QuizList from '@/components/quiz-list';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Quizzes - TutorVerse Lite',
  description: 'Test your knowledge with interactive quizzes.',
};

function QuizListSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-1/3" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}


export default function QuizzesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Subject Quizzes</h1>
      <p className="text-muted-foreground mb-8">
        Challenge yourself and test your understanding with our collection of quizzes. Select a subject to get started!
      </p>
      <Suspense fallback={<QuizListSkeleton />}>
        {/* QuizList component will fetch and display available quizzes */}
        <QuizList />
      </Suspense>
    </div>
  );
}
