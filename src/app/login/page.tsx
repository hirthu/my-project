'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Briefcase, Users, Mail, Lock } from 'lucide-react'; // Using Briefcase for Tutor
import { cn } from '@/lib/utils';

// Define Role type
type Role = 'student' | 'tutor' | 'parent';

// Google Icon SVG (Simple placeholder)
const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21.99 10.76h-1.45v-1.45h-1.45v1.45h-8.36c-2.76 0-5 2.24-5 5s2.24 5 5 5c2.39 0 4.37-1.7 4.86-3.95h-2.91v-1.45h7.86v0.01c0 0.18 0.01 0.35 0.01 0.53 0 2.9-2.35 5.25-5.25 5.25s-5.25-2.35-5.25-5.25c0-2.9 2.35-5.25 5.25-5.25 1.13 0 2.17 0.36 3.02 0.97l1.03-1.03c-1.23-0.93-2.7-1.5-4.27-1.5-3.63 0-6.67 2.75-6.97 6.25h-2.53v-1.45h-1.45v1.45h-1.45v1.45h1.45v1.45c0 3.63 2.94 6.58 6.58 6.58s6.58-2.94 6.58-6.58c0-0.35-0.03-0.7-0.08-1.05h1.53v-1.45z"/>
  </svg>
);


export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showEmailLogin, setShowEmailLogin] = useState(false);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    // In a real app, this would likely navigate to a role-specific login/signup flow
    // or set the context for the subsequent login method.
    // For this example, we just highlight the card and potentially show email form.
    console.log(`Selected role: ${role}`);
    // Example: Show email form immediately after selecting role
    // setShowEmailLogin(true);
  };

  const handleEmailContinue = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle email/password login logic
    alert('Email/Password login not implemented yet.');
  }

  const handleGoogleLogin = () => {
    // Handle Google Sign-In logic
    alert('Google Sign-In not implemented yet.');
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4 bg-gradient-to-br from-blue-100 via-white to-orange-100 dark:from-blue-900/30 dark:via-background dark:to-orange-900/30">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground animate-fade-in-up">
          Welcome to <span className="text-accent">TutorVerse</span> — Personalized Learning, Evolved
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground animate-fade-in-up animation-delay-200">
          Choose your role to get started. Each experience is tailored to your goals, whether you're learning, teaching, or tracking progress.
        </p>
      </div>

      {/* Role Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full max-w-5xl mb-10 animate-fade-in-up animation-delay-400">
        <RoleCard
          role="student"
          title="Student"
          icon={GraduationCap}
          description="Learn at your own pace with AI study tools, interactive quizzes, and a gamified learning map."
          onSelect={handleRoleSelect}
          isSelected={selectedRole === 'student'}
          gradient="from-blue-500 to-cyan-400" // Student: Blue
        />
        <RoleCard
          role="tutor"
          title="Tutor"
          icon={Briefcase}
          description="Manage sessions, collaborate with peers, and teach smarter using NeuroLearning profiles."
          onSelect={handleRoleSelect}
          isSelected={selectedRole === 'tutor'}
          gradient="from-purple-500 to-indigo-400" // Tutor: Purple
        />
        <RoleCard
          role="parent"
          title="Parent"
          icon={Users}
          description="Track your child’s progress, get real-time insights, and support learning from your dashboard."
          onSelect={handleRoleSelect}
          isSelected={selectedRole === 'parent'}
          gradient="from-teal-500 to-green-400" // Parent: Teal
        />
      </div>

       {/* Login Methods */}
       <div className="w-full max-w-sm space-y-4 animate-fade-in-up animation-delay-600">
         {!showEmailLogin && selectedRole && (
           <div className="text-center space-y-3">
             <p className="text-muted-foreground text-sm">Sign in or create an account to continue as a {selectedRole}.</p>
             <Button onClick={handleGoogleLogin} variant="outline" className="w-full text-foreground hover:bg-muted/50">
               <GoogleIcon /> Continue with Google
             </Button>
             <Button onClick={() => setShowEmailLogin(true)} variant="outline" className="w-full text-foreground hover:bg-muted/50">
               <Mail /> Continue with Email
             </Button>
             {/* Optional: Biometric placeholder */}
             {/* <Button variant="outline" className="w-full text-muted-foreground hover:bg-muted/50 opacity-50 cursor-not-allowed" disabled>
               <Fingerprint /> Continue with Biometric (Mobile)
             </Button> */}
           </div>
         )}

         {showEmailLogin && selectedRole && (
           <Card className="border-border/50 shadow-sm">
             <CardHeader>
                <CardTitle className="text-center text-lg">Sign in as {selectedRole} with Email</CardTitle>
             </CardHeader>
             <CardContent>
               <form onSubmit={handleEmailContinue} className="space-y-4">
                 <div className="relative">
                   <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                   <Input type="email" placeholder="Email Address" required className="pl-10"/>
                 </div>
                 <div className="relative">
                   <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                   <Input type="password" placeholder="Password" required className="pl-10"/>
                 </div>
                 <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Continue</Button>
                 <Button variant="link" size="sm" className="w-full text-muted-foreground" onClick={() => setShowEmailLogin(false)}>
                   Back to other login methods
                 </Button>
               </form>
             </CardContent>
           </Card>
         )}
       </div>


      {/* Footer Text */}
      <footer className="mt-16 text-center text-muted-foreground animate-fade-in-up animation-delay-600">
        <p className="text-sm">“One platform. Every mind, every milestone.”</p>
        <p className="text-xs mt-1">🔐 Secure • 🎓 Personalized • 📊 Insight-Driven</p>
      </footer>
    </div>
  );
}

// Role Card Component
interface RoleCardProps {
  role: Role;
  title: string;
  icon: React.ElementType;
  description: string;
  onSelect: (role: Role) => void;
  isSelected: boolean;
  gradient: string;
}

function RoleCard({ role, title, icon: Icon, description, onSelect, isSelected, gradient }: RoleCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden rounded-xl border-2 transition-all duration-300 ease-out cursor-pointer group",
        isSelected
          ? "border-primary shadow-2xl scale-105 bg-card/90 backdrop-blur-sm"
          : "border-transparent hover:border-primary/50 hover:shadow-lg bg-card/70 hover:bg-card/80 backdrop-blur-sm",
      )}
      onClick={() => onSelect(role)}
      role="button"
      aria-pressed={isSelected}
    >
      {/* Subtle Gradient Highlight */}
      <div className={cn(
          "absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-70 transition-opacity duration-300",
           gradient,
           isSelected ? "opacity-100" : "opacity-50 group-hover:opacity-80"
      )}></div>

      <CardHeader className="items-center text-center pt-10 pb-4">
        <div className={cn(
             "p-4 rounded-full mb-4 transition-all duration-300 ease-out",
             isSelected ? 'bg-primary/10 scale-110' : 'bg-muted group-hover:bg-primary/5'
        )}>
          <Icon className={cn("h-10 w-10 transition-colors duration-300", isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-primary/80')} />
        </div>
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center px-6 pb-8 min-h-[100px]">
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
       <div className={cn(
          "absolute inset-0 rounded-xl pointer-events-none",
           "transition-all duration-300 ease-out",
           "bg-gradient-to-br from-white/5 to-transparent opacity-0", // Frosted effect base
           "group-hover:opacity-30", // Apply effect on hover
           isSelected && "opacity-50 ring-2 ring-primary/50" // Stronger effect when selected
       )}></div>
        <div className="p-4 pt-0 text-center">
          <Button
            variant={isSelected ? "default" : "secondary"}
             className={cn(
               "w-full rounded-full transition-all duration-200 ease-out transform group-hover:scale-105",
               isSelected ? "bg-primary text-primary-foreground" : "bg-accent/10 text-accent hover:bg-accent/20"
             )}
             tabIndex={-1} // Button inside a clickable card
          >
             Continue as {title}
          </Button>
       </div>
    </Card>
  );
}

// Keyframes and Animations (can be moved to globals.css if preferred)
// Add these to your globals.css or wrap in a <style jsx> tag if needed:
/*
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out forwards;
  opacity: 0; /* Start hidden */
}
.animation-delay-200 {
  animation-delay: 0.2s;
}
.animation-delay-400 {
  animation-delay: 0.4s;
}
.animation-delay-600 {
  animation-delay: 0.6s;
}
*/

