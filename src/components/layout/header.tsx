'use client';

import Link from 'next/link';
import { BookOpen, Bot, Calendar, GraduationCap, HelpCircle, Sparkles, BrainCircuit } from 'lucide-react'; // Added Sparkles, BrainCircuit
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu } from 'lucide-react';
import React from 'react';

const navItems = [
  { href: '/tutors', label: 'Find Tutors', icon: GraduationCap },
  { href: '/booking', label: 'Book Sessions', icon: Calendar }, // Updated label
  { href: '/quizzes', label: 'Practice Quizzes', icon: HelpCircle }, // Updated label
  { href: '/ai-companion', label: 'AI Tools', icon: BrainCircuit }, // Updated Label & Icon
  // Example for a future feature (can be hidden initially)
  // { href: '/skills', label: 'Skill Maps', icon: Sparkles },
];

export default function Header() {
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  const closeSheet = () => setIsSheetOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center"> {/* Increased height */}
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <BookOpen className="h-7 w-7 text-accent" /> {/* Slightly larger icon */}
          <span className="font-bold text-lg">TutorVerse</span> {/* Updated Name, larger font */}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium flex-grow">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'transition-colors hover:text-accent px-2 py-1 rounded-md', // Added padding and rounded
                pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
                  ? 'text-foreground font-semibold bg-accent/10' // Highlight active link subtly
                  : 'text-muted-foreground'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Navigation Trigger */}
        <div className="md:hidden flex flex-grow justify-end items-center">
           <ThemeToggle /> {/* Moved theme toggle next to menu on mobile */}
           <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-2"> {/* Added margin */}
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[350px]"> {/* Adjusted width */}
               <Link href="/" className="mb-8 flex items-center space-x-2 px-4" onClick={closeSheet}> {/* Added Logo to Sheet */}
                  <BookOpen className="h-6 w-6 text-accent" />
                  <span className="font-bold text-lg">TutorVerse</span>
               </Link>
               <nav className="flex flex-col space-y-3 px-2"> {/* Adjusted spacing */}
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeSheet}
                    className={cn(
                      'flex items-center space-x-3 p-3 rounded-md transition-colors hover:bg-accent hover:text-accent-foreground text-base', // Increased padding, text size
                       pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
                        ? 'bg-muted text-foreground font-semibold'
                        : 'text-muted-foreground'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center justify-end space-x-3 ml-auto"> {/* Increased spacing */}
          <ThemeToggle />
          {/* Example Auth Button Placeholder */}
          {/* <Button variant="outline">Sign In</Button> */}
          {/* <Button>Sign Up</Button> */}
        </div>

      </div>
    </header>
  );
}
