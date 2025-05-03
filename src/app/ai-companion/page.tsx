import type { Metadata } from 'next';
import AICompanionChat from '@/components/ai-companion-chat';

export const metadata: Metadata = {
  title: 'AI Study Companion - TutorVerse Lite',
  description: 'Get instant help from our AI tutor.',
};

export default function AICompanionPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] md:h-[calc(100vh-10rem)]">
      <h1 className="text-3xl font-bold mb-4 text-center">AI Study Companion</h1>
      <p className="text-muted-foreground mb-6 text-center max-w-xl mx-auto">
        Ask any question, get step-by-step explanations, or practice concepts with your AI tutor.
      </p>
      <AICompanionChat />
    </div>
  );
}
