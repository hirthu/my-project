'use client';

import Link from 'next/link';
import { BookOpen, Bot, Calendar, GraduationCap } from 'lucide-react';
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
  { href: '/booking', label: 'Booking', icon: Calendar },
  { href: '/ai-companion', label: 'AI Companion', icon: Bot },
];

export default function Header() {
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  const closeSheet = () => setIsSheetOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <BookOpen className="h-6 w-6 text-accent" />
          <span className="font-bold">TutorVerse Lite</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium flex-grow">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'transition-colors hover:text-accent',
                pathname?.startsWith(item.href)
                  ? 'text-foreground font-semibold'
                  : 'text-muted-foreground'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden flex flex-grow justify-end">
           <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
               <nav className="flex flex-col space-y-4 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeSheet}
                    className={cn(
                      'flex items-center space-x-2 p-2 rounded-md transition-colors hover:bg-accent hover:text-accent-foreground',
                       pathname?.startsWith(item.href)
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

        <div className="hidden md:flex items-center justify-end space-x-2 ml-auto">
          <ThemeToggle />
          {/* Add Auth buttons here later if needed */}
        </div>
         <div className="md:hidden ml-2">
           <ThemeToggle />
         </div>
      </div>
    </header>
  );
}
