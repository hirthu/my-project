import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t py-6 md:py-8 mt-12">
      <div className="container flex flex-col items-center justify-center md:flex-row md:justify-between">
        <p className="text-sm text-muted-foreground text-center md:text-left mb-2 md:mb-0">
          &copy; {currentYear} TutorVerse Lite. All rights reserved.
        </p>
        {/* Add social links or other footer content here if needed */}
        <div className="text-sm text-muted-foreground">
          Built with ❤️
        </div>
      </div>
    </footer>
  );
}
