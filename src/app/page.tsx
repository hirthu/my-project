// Add 'use client' directive because this page uses client-side hooks (implicitly via Image) and interactions
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"; // Added CardFooter
import { GraduationCap, Calendar, Star, BookOpen, BrainCircuit, Eye, Zap, Award, Users, BarChart3, Sparkles, UserCheck, Search, Clock, FileText, Group, Mic, Radar, Repeat, HelpCircle as HelpCircleIcon, Puzzle, Unlock, Clock3, StickyNote, Workflow, Video, Lock, UsersRound, Speech, FlaskConical, MonitorPlay, BadgePercent, LayoutDashboard, Download, MessageSquareHeart, Lightbulb, Brain, VideoIcon, AudioLines, ChevronRight } from "lucide-react"; // Added more relevant icons // Corrected HelpCircle import
import Image from 'next/image';
import Link from 'next/link';
// Import React for potential future use, not needed for styled-jsx anymore
import React from 'react';


export default function Home() {
  return (
    <div className="flex flex-col items-center space-y-16"> {/* Increased spacing */}
      {/* Hero Section */}
      <section className="text-center pt-16 pb-8">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 animate-fade-in-up"> {/* Larger title */}
          Welcome to <span className="text-accent">TutorVerse</span> {/* Updated Name */}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-fade-in-up animation-delay-200"> {/* Wider text */}
          Experience the future of learning. Find expert tutors, book sessions, master skills with AI, and unlock your potential.
        </p>
        <div className="space-x-4 animate-fade-in-up animation-delay-400">
          <Link href="/tutors" passHref legacyBehavior>
             <Button size="lg">Find Your Tutor</Button>
          </Link>
          <Link href="/ai-companion" passHref legacyBehavior>
             <Button variant="secondary" size="lg">Explore AI Tools</Button>
          </Link>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl"> {/* Increased gap and max-width */}
        <FeatureCard
          icon={UserCheck} // Changed icon
          title="Personalized Tutoring"
          description="Connect with verified experts. Profiles feature intro videos, ratings, and unique teaching styles."
          link="/tutors"
          linkText="Browse Tutors"
          dataAiHint="teacher student online meeting"
        />
        <FeatureCard
          icon={BrainCircuit} // Updated Icon
          title="AI-Powered Learning"
          description="Get instant help with our 24/7 AI companion, adaptive quizzes, and smart study tools."
          link="/ai-companion"
          linkText="Meet Your AI Buddy"
          dataAiHint="robot brain artificial intelligence circuit"
        />
         <FeatureCard
          icon={Calendar}
          title="Seamless Scheduling"
          description="Effortless booking system synced with tutor availability. Manage your sessions with ease."
          link="/booking"
          linkText="Book a Session"
           dataAiHint="calendar schedule planning interface"
        />
      </section>

       {/* How it Works Section */}
       <section className="w-full max-w-5xl py-12">
         <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">Simple Steps to Success</h2> {/* Updated title and margin */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center"> {/* Increased gap */}
           <HowItWorksStep
             icon={Search} // Changed icon
             step="1"
             title="Discover & Connect"
             description="Browse tutor profiles, watch intros, and find the perfect match for your learning style."
           />
           <HowItWorksStep
             icon={Calendar}
              step="2"
              title="Book & Prepare"
             description="Select a time slot that works for you and get ready for your personalized session."
           />
            <HowItWorksStep
              icon={Sparkles} // Updated icon
               step="3"
               title="Learn & Grow"
             description="Engage in live sessions, use AI tools, track progress, and master new skills."
           />
         </div>
       </section>

      {/* Future Vision Section - Combined Lists */}
        <section className="w-full max-w-7xl py-16 bg-muted/50 rounded-lg px-6 md:px-10">
           <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-primary">The Future of TutorVerse: Innovation Ahead</h2>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {/* Original Advanced Features */}
             <VisionCard icon={Eye} title="AR/VR Learning Modules" description="Immersive 3D experiences for subjects like biology and physics."/>
             <VisionCard icon={BarChart3} title="AI Adaptive Curriculum" description="Lesson plans dynamically tailored to your real-time progress."/>
             <VisionCard icon={AudioLines} title="Voice Q&A Assistant" description="Ask questions with your voice and receive audio answers." />
             <VisionCard icon={Zap} title="Engagement Analytics (Beta)" description="Eye-tracking insights (with consent) to help tutors refine methods." />
             <VisionCard icon={Puzzle} title="Subject Learning Games" description="Gamified quizzes, challenges, and 'learning duels' for motivation." />
             <VisionCard icon={FlaskConical} title="Live Experiment Simulations" description="Interactive physics/chemistry labs directly in your browser."/>
             <VisionCard icon={FileText} title="Instant Certificates" description="Auto-generate PDF certificates for course completion and achievements." />
             <VisionCard icon={BadgePercent} title="Tutor Subscription Marketplace" description="Tutors offer monthly bundles or 'starter packs'." />
             <VisionCard icon={LayoutDashboard} title="Parent Insight Panel" description="Dedicated dashboard for parents to track progress and feedback." />
             <VisionCard icon={Download} title="Offline Mode & Downloads" description="Access lessons offline, syncing progress when reconnected." />
              {/* Community Features */}
             <VisionCard icon={Users} title="Live Expert AMAs" description="Monthly sessions with educators and industry professionals." />
             <VisionCard icon={Group} title="Study Circles & Group Rooms" description="Peer study groups with shared notes and whiteboards." />
             <VisionCard icon={MonitorPlay} title="Career Path Explorer" description="Map subjects to potential careers and real-world applications." />
              {/* Next-Level Unique Features */}
             <VisionCard icon={Brain} title="Neurolearning Profiles" description="Identify your learning style for truly personalized tutoring." />
             <VisionCard icon={Clock} title="Time Capsule Notes" description="Record audio/video reflections to unlock later for review." />
             <VisionCard icon={VideoIcon} title="AI Tutor Shadowing" description="Watch recorded lessons from top-rated tutors (privacy protected)." />
             <VisionCard icon={Lock} title="Private Tutoring Vault" description="Encrypted space for personal notes, recordings, and highlights." />
             <VisionCard icon={Award} title="Skill Tree Learning Maps" description="Game-like visual map of your learning journey and achievements." />
             <VisionCard icon={MessageSquareHeart} title="Emotion-Aware Feedback" description="AI analyzes feedback sentiment to track engagement and well-being." />
             <VisionCard icon={StickyNote} title="Smart Sticky Notes" description="Attach searchable notes to video timestamps or whiteboard moments." />
             <VisionCard icon={Workflow} title="Tutor Collaboration Boards" description="Shared spaces for tutors to co-plan lessons using Kanban boards." />
             <VisionCard icon={Speech} title="Speech-to-Flashcards AI" description="Automatically create flashcards from session voice transcripts." />
             <VisionCard icon={Radar} title='"Study Radar"' description="Discover trending topics and questions discussed by other students." />
             <VisionCard icon={Repeat} title="Habit Loop Integration" description="Build consistent study routines with streaks, nudges, and rewards." />
             <VisionCard icon={HelpCircleIcon} title="Panic Button Mode" description="Instantly connect with an available tutor when you're really stuck." />
             <VisionCard icon={Lightbulb} title="Collaborative Problem Solving" description="Work anonymously with peers to solve challenging problems." />
             <VisionCard icon={Clock3} title="Personal AI Scheduler" description="Learns your peak focus times and suggests optimal booking slots." />
           </div>
            <p className="text-center mt-12 text-muted-foreground italic">
              Just a glimpse into the innovative features shaping the future of personalized learning at TutorVerse...
            </p>
        </section>


      {/* Testimonial Section */}
      <section className="w-full max-w-3xl py-12 text-center">
        <h2 className="text-3xl font-bold mb-6">What Our Learners Say</h2>
        <Card className="bg-card shadow-lg transform transition-transform duration-300 hover:scale-105">
          <CardContent className="pt-6">
            <div className="flex justify-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-secondary text-secondary" />
              ))}
            </div>
            <blockquote className="text-lg italic text-muted-foreground mb-4">
              "TutorVerse transformed how I study. The tutors are amazing, and the AI helper is a game-changer for difficult concepts!"
            </blockquote>
            <p className="font-semibold">Jamie Lee</p>
            <p className="text-sm text-muted-foreground">University Student</p>
          </CardContent>
        </Card>
      </section>

       {/* Animations are now defined in globals.css */}

    </div>
  );
}


interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  link: string;
  linkText: string;
  dataAiHint?: string;
}

// Feature Card Component (minor style tweaks possible)
function FeatureCard({ icon: Icon, title, description, link, linkText, dataAiHint }: FeatureCardProps) {
  return (
    <Card className="flex flex-col transform transition-transform duration-300 hover:scale-105 hover:shadow-xl animate-fade-in-up animation-delay-600 bg-card group"> {/* Added group class */}
       <CardHeader className="items-center pb-4">
        <div className="p-4 rounded-full bg-accent/10 mb-4 transition-colors duration-300 group-hover:bg-accent"> {/* Added group hover */}
          <Icon className="h-10 w-10 text-accent transition-colors duration-300 group-hover:text-accent-foreground" /> {/* Larger Icon, Added group hover */}
        </div>
        <CardTitle className="text-xl font-semibold">{title}</CardTitle> {/* Bolder Title */}
      </CardHeader>
      <CardContent className="flex-grow text-center px-6"> {/* Added padding */}
        <CardDescription className="text-base">{description}</CardDescription> {/* Slightly larger text */}
         {/* Placeholder Image */}
         <div className="mt-6 aspect-video relative overflow-hidden rounded-lg bg-muted shadow-inner"> {/* Rounded-lg, shadow */}
          <Image
            src={`https://picsum.photos/seed/${title.replace(/\s+/g, '-')}/300/170`}
            alt={title}
            fill
            style={{ objectFit: 'cover' }}
            data-ai-hint={dataAiHint}
            unoptimized // Using picsum, no need for Next image optimization
            className="transition-transform duration-500 group-hover:scale-110" // Added subtle zoom on hover to group
          />
        </div>
      </CardContent>
      <CardFooter className="pt-4 pb-6 text-center"> {/* Adjusted padding */}
         <Link href={link} passHref legacyBehavior>
            <Button variant="link" className="text-accent text-base font-semibold mx-auto">
              <span className="flex items-center">
                {linkText} <ChevronRight className="ml-1 h-4 w-4" />
              </span>
            </Button>
         </Link>
       </CardFooter>
    </Card>
  );
}

// How It Works Step Component
interface HowItWorksStepProps {
  icon: React.ElementType;
  step: string;
  title: string;
  description: string;
}

function HowItWorksStep({ icon: Icon, step, title, description }: HowItWorksStepProps) {
  return (
    <div className="flex flex-col items-center p-4">
      <div className="relative mb-4">
         <div className="p-5 bg-primary/10 rounded-full">
           <Icon className="h-10 w-10 text-primary" />
         </div>
         <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs">
           {step}
         </span>
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-xs">{description}</p>
    </div>
  );
}


// Vision Card Component (for Future Vision section)
interface VisionCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

function VisionCard({ icon: Icon, title, description }: VisionCardProps) {
  return (
    <div className="flex items-start space-x-4 p-4 bg-background rounded-lg shadow-sm transition-shadow hover:shadow-md">
      <div className="p-3 rounded-full bg-accent/10 mt-1">
        <Icon className="h-6 w-6 text-accent" />
      </div>
      <div>
        <h4 className="text-lg font-semibold mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
