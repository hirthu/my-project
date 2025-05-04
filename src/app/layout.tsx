import type { Metadata } from 'next';
import { Geist_Sans } from 'geist/font/sans'; // Correct import
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import Providers from '@/components/providers';

// Initialize Geist Sans font
const geistSans = Geist_Sans({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'TutorVerse - Personalized Learning', // More specific title
  description: 'Discover expert tutors, book sessions seamlessly, and leverage AI tools for effective learning on TutorVerse.', // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Apply the font variable to the body */}
      <body className={`${geistSans.variable} font-sans antialiased flex flex-col min-h-screen`}>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            <Footer />
            <Toaster />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}