// Add 'use client' directive because this page uses client-side hooks (implicitly via Image) and interactions
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { GraduationCap, Calendar, Star, BookOpen, BrainCircuit, Eye, Zap, Award, Users, BarChart3, Sparkles, UserCheck, Search, Clock, FileText, Group, Mic, Radar, Repeat, HelpCircle as HelpCircleIcon, Puzzle, Unlock, Clock3, StickyNote, Workflow, Video, Lock, UsersRound, Speech, FlaskConical, MonitorPlay, BadgePercent, LayoutDashboard, Download, MessageSquareHeart, Lightbulb, Brain, VideoIcon, AudioLines, ChevronRight, Atom, BrainCog, History, ShieldCheck, Trees, Sigma, ClipboardList, Kanban, Bot, RadioTower, HandCoins, AlertCircle, BookCopy, Milestone, Users2, CalendarClock, Camera, TestTube, FileBadge, ShoppingBasket, SidebarOpen, WifiOff, Briefcase, Telescope, VideoOff } from "lucide-react"; // Added many more icons
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Import Tabs components

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
          <Link href="/tutors" passHref>
             <Button size="lg">Find Your Tutor</Button>
          </Link>
          <Link href="/ai-companion" passHref>
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

      {/* Future Vision Section - Using Tabs */}
        <section className="w-full max-w-7xl py-16 bg-muted/50 rounded-lg px-6 md:px-10">
           <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-primary">The Future of TutorVerse: Innovation Ahead</h2>

            <Tabs defaultValue="next-level" className="w-full">
                <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-8">
                  <TabsTrigger value="next-level">🚀 Next-Level Unique</TabsTrigger>
                  <TabsTrigger value="advanced">🔥 Advanced & Community</TabsTrigger>
                  <TabsTrigger value="core-enhancements">⚙️ Core Enhancements</TabsTrigger>
                </TabsList>

                {/* Next-Level Unique Features Tab */}
                <TabsContent value="next-level">
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                     <VisionCard icon={BrainCog} title="Neurolearning Profiles" description="Diagnostic quizzes tailor tutoring to your unique learning style (visual, auditory, etc)." link="/onboarding/neuro-quiz" />
                     <VisionCard icon={History} title="Time Capsule Notes" description="Record video/audio notes post-session to unlock and reflect on later." link="/sessions/record-capsule" />
                     <VisionCard icon={VideoOff} title="AI Tutor Shadowing" description="Watch anonymized lessons from top-rated tutors to learn best practices." link="/sessions/shadowing" />
                     <VisionCard icon={ShieldCheck} title="Private Tutoring Vault" description="Encrypted space for personal notes & recordings, secured with 2FA." link="/vault" />
                     <VisionCard icon={Trees} title="Skill Tree Learning Map" description="Game-like visual map tracking your progress and unlocking new challenges." link="/skills" />
                     <VisionCard icon={MessageSquareHeart} title="Emotion-Aware Feedback" description="AI analyzes emoji & text feedback to track engagement and suggest improvements." />
                     <VisionCard icon={StickyNote} title="Smart Sticky Notes" description="Attach searchable notes to video timestamps or whiteboard moments." link="/notes" />
                     <VisionCard icon={Kanban} title="Tutor Collaboration Boards" description="Shared planning spaces for tutors to co-create lessons in real-time." link="/tutor-collab" />
                     <VisionCard icon={Bot} title="Speech-to-Flashcards AI" description="Automatically converts session transcripts into review flashcards." link="/flashcards" />
                     <VisionCard icon={RadioTower} title='"Study Radar"' description="See trending topics and questions being discussed by peers in real-time." link="/radar" />
                     <VisionCard icon={Repeat} title="Habit Loop Integration" description="Build study routines with streaks, nudges, and personalized progress tracking." link="/habits" />
                     <VisionCard icon={AlertCircle} title="Panic Button Mode" description="Instantly request help from an available tutor when you're stuck." />
                     <VisionCard icon={HandCoins} title="Weekly Brain Boost Challenge" description="Solve engaging weekly problems and earn digital trophies or certificates." link="/challenges" />
                     <VisionCard icon={Users2} title="Collaborative Problem Solving" description="Work anonymously with peers in a shared space to tackle tough questions." link="/collab-solve" />
                     <VisionCard icon={CalendarClock} title="Personal AI Scheduler" description="AI suggests optimal tutoring times based on your productivity patterns." />
                   </div>
                </TabsContent>

                {/* Advanced & Community Features Tab */}
                <TabsContent value="advanced">
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                     <VisionCard icon={Camera} title="AR/VR Learning Modules" description="Immersive 3D/AR experiences for subjects like biology and physics (Premium)." />
                     <VisionCard icon={Sigma} title="AI Adaptive Curriculum" description="Lesson plans dynamically adjust based on your real-time performance." />
                     <VisionCard icon={AudioLines} title="Voice Q&A Assistant" description="Ask questions and get answers using voice commands." />
                     <VisionCard icon={Eye} title="Engagement Analytics (Beta)" description="Optional eye-tracking insights to help tutors refine teaching methods." />
                     <VisionCard icon={Puzzle} title="Subject Learning Games" description="Gamified quizzes, challenges, and 'learning duels' for motivation." link="/games" />
                     <VisionCard icon={FlaskConical} title="Live Experiment Simulations" description="Interactive science experiments directly in your browser." />
                     <VisionCard icon={FileBadge} title="Instant Certificate Generator" description="Auto-generate PDF certificates for course completion and achievements." />
                     <VisionCard icon={ShoppingBasket} title="Tutor Subscription Marketplace" description="Tutors offer packaged services like monthly bundles or 'starter packs'." />
                     <VisionCard icon={SidebarOpen} title="Parent Insight Panel" description="Dedicated dashboard for parents to track progress, feedback, and billing." />
                     <VisionCard icon={WifiOff} title="Offline Mode & Downloads" description="Access lessons offline, syncing progress automatically when reconnected." />
                     {/* Community */}
                     <VisionCard icon={Users} title="Live Expert AMAs" description="Monthly interactive sessions with educators and industry professionals." link="/events/ama" />
                     <VisionCard icon={UsersRound} title="Study Circles & Group Rooms" description="Join peer study groups with shared notes and virtual whiteboards." link="/groups" />
                     <VisionCard icon={Briefcase} title="Career Path Explorer" description="Explore how subjects connect to real-world careers and skills." />
                   </div>
                </TabsContent>

                {/* Core Enhancements Tab */}
                 <TabsContent value="core-enhancements">
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {/* Re-iterate or emphasize core improved features */}
                     <VisionCard icon={UserCheck} title="Enhanced Tutor Profiles" description="Deeper insights with verified credentials, teaching philosophy, and student reviews." link="/tutors" />
                     <VisionCard icon={BrainCircuit} title="Smarter AI Companion" description="Improved context understanding and proactive learning suggestions." link="/ai-companion" />
                     <Calendar icon={Calendar} title="Advanced Booking Options" description="Recurring sessions, package deals, and flexible rescheduling." link="/booking" />
                     <VisionCard icon={BookCopy} title="Expanded Quiz Library" description="More subjects, adaptive difficulty levels, and detailed performance reports." link="/quizzes" />
                      <VisionCard icon={Telescope} title="Improved Search & Filtering" description="Find tutors by specific skills, availability, price range, and more." link="/tutors" />
                     {/* Placeholder for future core enhancements */}
                     <VisionCard icon={Milestone} title="Progress Tracking Dashboard" description="Visualize your learning journey, achievements, and areas for improvement." />
                     <VisionCard icon={TestTube} title="Feature Testing Mode" description="Opt-in to try beta features and provide early feedback." />
                   </div>
                 </TabsContent>
            </Tabs>

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
                <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" /> // Changed fill to yellow
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
         <Link href={link} passHref>
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
  link?: string; // Optional link prop
}

function VisionCard({ icon: Icon, title, description, link }: VisionCardProps) {
  const content = (
     <div className="flex items-start space-x-4 p-4 bg-background rounded-lg shadow-sm transition-shadow hover:shadow-md h-full"> {/* Added h-full */}
        <div className="p-3 rounded-full bg-accent/10 mt-1 shrink-0"> {/* Added shrink-0 */}
          <Icon className="h-6 w-6 text-accent" />
        </div>
        <div className="flex flex-col">
          <h4 className="text-lg font-semibold mb-1">{title}</h4>
          <p className="text-sm text-muted-foreground flex-grow">{description}</p> {/* Added flex-grow */}
        </div>
      </div>
  );

   if (link) {
     return (
       <Link href={link} passHref className="block h-full"> {/* Make link fill the card */}
         {content}
       </Link>
     );
   }

  return content; // Return div if no link
}
