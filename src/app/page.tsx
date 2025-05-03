import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Calendar, Bot, Star, BookOpen } from "lucide-react";
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center space-y-12">
      <section className="text-center pt-16 pb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in-up">
          Welcome to <span className="text-accent">TutorVerse Lite</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
          Find expert tutors, book sessions effortlessly, and get instant AI help anytime.
        </p>
        <div className="space-x-4 animate-fade-in-up animation-delay-400">
          <Button asChild size="lg">
            <Link href="/tutors">Find a Tutor</Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
             <Link href="/ai-companion">Ask AI</Link>
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        <FeatureCard
          icon={GraduationCap}
          title="Expert Tutors"
          description="Discover experienced tutors with detailed profiles, intro videos, and verified ratings."
          link="/tutors"
          linkText="Browse Tutors"
          dataAiHint="teacher students classroom"
        />
        <FeatureCard
          icon={Calendar}
          title="Easy Booking"
          description="View tutor availability and book sessions seamlessly with our integrated calendar system."
          link="/booking"
          linkText="Book a Session"
           dataAiHint="calendar schedule planning"
        />
        <FeatureCard
          icon={Bot}
          title="AI Study Buddy"
          description="Get instant answers to your questions 24/7 with our intelligent AI companion."
          link="/ai-companion"
          linkText="Try AI Helper"
          dataAiHint="robot chatbot artificial intelligence"
        />
      </section>

       {/* How it Works Section - Placeholder */}
       <section className="w-full max-w-5xl py-12">
         <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
           <div className="flex flex-col items-center">
             <div className="p-4 bg-primary/10 rounded-full mb-4">
                <GraduationCap className="h-8 w-8 text-primary" />
             </div>
             <h3 className="text-xl font-semibold mb-2">1. Find Your Tutor</h3>
             <p className="text-muted-foreground">Browse profiles and filter by subject or rating.</p>
           </div>
           <div className="flex flex-col items-center">
              <div className="p-4 bg-secondary/10 rounded-full mb-4">
                <Calendar className="h-8 w-8 text-secondary-foreground" />
              </div>
             <h3 className="text-xl font-semibold mb-2">2. Book a Session</h3>
             <p className="text-muted-foreground">Check availability and schedule with ease.</p>
           </div>
            <div className="flex flex-col items-center">
               <div className="p-4 bg-accent/10 rounded-full mb-4">
                 <BookOpen className="h-8 w-8 text-accent" />
               </div>
             <h3 className="text-xl font-semibold mb-2">3. Start Learning</h3>
             <p className="text-muted-foreground">Connect with your tutor or use the AI companion.</p>
           </div>
         </div>
       </section>

      {/* Testimonial Section - Placeholder */}
      <section className="w-full max-w-3xl py-12 text-center">
        <h2 className="text-3xl font-bold mb-6">What Our Users Say</h2>
        <Card className="bg-card shadow-lg">
          <CardContent className="pt-6">
            <div className="flex justify-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-secondary text-secondary" />
              ))}
            </div>
            <blockquote className="text-lg italic text-muted-foreground mb-4">
              "TutorVerse Lite made finding a math tutor so simple! The AI helper is a lifesaver for late-night study sessions."
            </blockquote>
            <p className="font-semibold">Alex Johnson</p>
            <p className="text-sm text-muted-foreground">High School Student</p>
          </CardContent>
        </Card>
      </section>

       {/* Add keyframes for animations */}
      <style jsx>{`
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
      `}</style>
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

function FeatureCard({ icon: Icon, title, description, link, linkText, dataAiHint }: FeatureCardProps) {
  return (
    <Card className="flex flex-col transform transition-transform duration-300 hover:scale-105 hover:shadow-xl animate-fade-in-up animation-delay-600">
       <CardHeader className="items-center pb-4">
        <div className="p-3 rounded-full bg-accent/10 mb-3">
          <Icon className="h-8 w-8 text-accent" />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow text-center">
        <CardDescription>{description}</CardDescription>
         {/* Placeholder Image */}
         <div className="mt-4 aspect-video relative overflow-hidden rounded-md bg-muted">
          <Image
            src={`https://picsum.photos/seed/${title.replace(/\s+/g, '-')}/300/170`}
            alt={title}
            fill
            style={{ objectFit: 'cover' }}
            data-ai-hint={dataAiHint}
            unoptimized // Using picsum, no need for Next image optimization
          />
        </div>
      </CardContent>
      <CardContent className="pt-0 text-center">
         <Button asChild variant="link" className="text-accent">
           <Link href={link}>{linkText}</Link>
         </Button>
       </CardContent>
    </Card>
  );
}