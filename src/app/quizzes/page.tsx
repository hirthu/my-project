import type { Metadata } from 'next';
import QuizList from '@/components/quiz-list';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Practice Quizzes - TutorVerse', // Updated title
  description: 'Test your knowledge with interactive quizzes on TutorVerse.', // Updated description
};

function QuizListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Added grid layout */}
       {[...Array(6)].map((_, i) => ( // Increased skeleton count for grid
          <Skeleton key={i} className="h-40 w-full rounded-lg" /> // Added rounded-lg
       ))}
    </div>
  );
}


export default function QuizzesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Subject Quizzes</h1>
      <p className="text-muted-foreground mb-8 max-w-2xl"> {/* Added max-width */}
        Challenge yourself, test your understanding, and prepare for success with our collection of quizzes. Select a subject to get started!
      </p>
      <Suspense fallback={<QuizListSkeleton />}>
        {/* QuizList component will fetch and display available quizzes */}
        <QuizList />
      </Suspense>

      {/* Placeholder for future Quiz features */}
       {/* <div className="mt-12 p-6 bg-muted/50 rounded-lg">
         <h2 className="text-2xl font-semibold mb-4">Coming Soon: More Ways to Learn!</h2>
         <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Adaptive quizzes that adjust to your skill level</li>
            <li>Gamified challenges and leaderboards</li>
            <li>Skill-tree based progress tracking</li>
         </ul>
       </div> */}
    </div>
  );
}
