import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans'; // Import the font object
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import Providers from '@/components/providers';

// No need to call GeistSans as a function if it's the configured object
// const geistSans = GeistSans({
//   variable: '--font-geist-sans',
//   subsets: ['latin'],
// });

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
      {/* Apply the font variable directly from the imported object */}
      <body className={`${GeistSans.variable} font-sans antialiased flex flex-col min-h-screen`}>
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
