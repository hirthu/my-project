import type { Metadata } from 'next';
import AICompanionChat from '@/components/ai-companion-chat';

export const metadata: Metadata = {
  title: 'AI Learning Tools - TutorVerse', // Updated title
  description: 'Engage with AI: Ask questions, get explanations, practice concepts, and explore adaptive learning features.', // Updated description
};

export default function AICompanionPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] md:h-[calc(100vh-10rem)]">
      <h1 className="text-3xl font-bold mb-4 text-center">AI Learning Tools</h1> {/* Updated heading */}
      <p className="text-muted-foreground mb-6 text-center max-w-xl mx-auto">
        Leverage the power of AI. Get instant answers from the chat companion, or explore other intelligent study features as they become available.
      </p>
      {/* Chat is the primary tool for now */}
      <AICompanionChat />

      {/* Placeholder for future AI tools */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Adaptive Quiz (Coming Soon)</CardTitle>
            <CardDescription>Quizzes that adjust difficulty based on your performance.</CardDescription>
          </CardHeader>
          <CardContent>
             <Button disabled>Start Adaptive Quiz</Button>
          </CardContent>
        </Card>
        <Card>
           <CardHeader>
            <CardTitle>Voice Q&A (Coming Soon)</CardTitle>
            <CardDescription>Ask questions using your voice.</CardDescription>
          </CardHeader>
          <CardContent>
             <Button disabled>Activate Voice Assistant</Button>
          </CardContent>
        </Card>
      </div> */}
    </div>
  );
}
