import React from 'react';
import Link from 'next/link'; // Import Link
import { BookOpen } from 'lucide-react'; // Import icon

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t py-8 md:py-10 mt-16 bg-muted/30"> {/* Added background color */}
      <div className="container grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        {/* Logo and Copyright */}
        <div className="flex flex-col items-center md:items-start">
           <Link href="/" className="flex items-center space-x-2 mb-2">
             <BookOpen className="h-6 w-6 text-accent" />
             <span className="font-bold text-lg">TutorVerse</span>
           </Link>
          <p className="text-sm text-muted-foreground text-center md:text-left">
            &copy; {currentYear} TutorVerse. All rights reserved.
          </p>
           <p className="text-xs text-muted-foreground mt-1 text-center md:text-left">
             Redefining Online Learning.
           </p>
        </div>

        {/* Footer Links (Example) */}
        <nav className="flex flex-col md:flex-row justify-center md:justify-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-center md:text-left">
          <Link href="/about" className="text-muted-foreground hover:text-foreground">About Us</Link>
          <Link href="/careers" className="text-muted-foreground hover:text-foreground">Careers</Link>
          <Link href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link>
          <Link href="/terms" className="text-muted-foreground hover:text-foreground">Terms of Service</Link>
        </nav>

         {/* Social Links or CTA (Example) */}
        <div className="flex justify-center md:justify-end items-center space-x-4">
           {/* Placeholder for social icons */}
           <span className="text-sm text-muted-foreground">Follow Us:</span>
           <div className="flex space-x-3">
             <a href="#" aria-label="Twitter" className="text-muted-foreground hover:text-foreground">
               {/* Replace with actual icon later */}
               <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" /></svg>
             </a>
             <a href="#" aria-label="LinkedIn" className="text-muted-foreground hover:text-foreground">
                {/* Replace with actual icon later */}
               <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
             </a>
           </div>
        </div>

      </div>
    </footer>
  );
}
