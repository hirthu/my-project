'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Star, Clock, PlayCircle, Loader2, VideoOff, Filter } from 'lucide-react'; // Added Filter
import Image from 'next/image';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton component

// Mock Session Data Interface
interface ShadowSession {
  id: string;
  title: string;
  subject: string;
  tutorName: string; // Assuming tutor name is available
  tutorRating: number; // Tutor's overall rating
  durationMinutes: number;
  recordingUrl: string; // URL to the video (placeholder for now)
  thumbnailUrl: string; // URL for a thumbnail image
  dateRecorded: string; // ISO string or Date object
  description?: string; // Optional short description
}

// Mock function to fetch sessions - replace with actual API call
const fetchShadowSessions = async (filters: { subject?: string; searchTerm?: string }): Promise<ShadowSession[]> => {
  console.log('Fetching shadow sessions with filters:', filters);
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

  // Mock data - in reality, fetch from Firebase Storage/Firestore based on filters, ratings, etc.
  const allSessions: ShadowSession[] = [
    { id: 'shd1', title: 'Mastering Calculus Derivatives', subject: 'Mathematics', tutorName: 'Alice Smith', tutorRating: 4.9, durationMinutes: 55, recordingUrl: '/mock-video.mp4', thumbnailUrl: 'https://picsum.photos/seed/calculus-deriv/400/225', dateRecorded: '2024-04-15T10:00:00Z', description: 'A deep dive into the power rule, product rule, and quotient rule with examples.' },
    { id: 'shd2', title: 'Newtonian Physics Explained', subject: 'Science', tutorName: 'Bob Johnson', tutorRating: 4.7, durationMinutes: 60, recordingUrl: '/mock-video.mp4', thumbnailUrl: 'https://picsum.photos/seed/newtonian-physics/400/225', dateRecorded: '2024-04-14T14:30:00Z', description: 'Covering Newton\'s three laws of motion and their applications.' },
    { id: 'shd3', title: 'Organic Chemistry Reactions', subject: 'Science', tutorName: 'Charlie Brown', tutorRating: 4.8, durationMinutes: 45, recordingUrl: '/mock-video.mp4', thumbnailUrl: 'https://picsum.photos/seed/organic-chem/400/225', dateRecorded: '2024-04-12T09:00:00Z', description: 'Introduction to SN1 and SN2 reaction mechanisms.' },
    { id: 'shd4', title: 'Essay Writing Techniques', subject: 'English', tutorName: 'Diana Prince', tutorRating: 4.9, durationMinutes: 50, recordingUrl: '/mock-video.mp4', thumbnailUrl: 'https://picsum.photos/seed/essay-writing/400/225', dateRecorded: '2024-04-10T11:00:00Z', description: 'Focusing on thesis statements, topic sentences, and structuring arguments.' },
    { id: 'shd5', title: 'Python Data Structures', subject: 'Computer Science', tutorName: 'Ethan Hunt', tutorRating: 4.8, durationMinutes: 65, recordingUrl: '/mock-video.mp4', thumbnailUrl: 'https://picsum.photos/seed/python-data/400/225', dateRecorded: '2024-04-09T16:00:00Z', description: 'Exploring lists, dictionaries, tuples, and sets in Python.' },
     { id: 'shd6', title: 'Advanced Algebra Concepts', subject: 'Mathematics', tutorName: 'Alice Smith', tutorRating: 4.9, durationMinutes: 58, recordingUrl: '/mock-video.mp4', thumbnailUrl: 'https://picsum.photos/seed/advanced-algebra/400/225', dateRecorded: '2024-04-08T13:15:00Z', description: 'Working through complex number operations and polynomial functions.' },
  ];

  let filteredSessions = allSessions;

  if (filters.subject && filters.subject !== 'all') {
    filteredSessions = filteredSessions.filter(s => s.subject === filters.subject);
  }

  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    filteredSessions = filteredSessions.filter(s =>
      s.title.toLowerCase().includes(term) ||
      s.subject.toLowerCase().includes(term) ||
      s.tutorName.toLowerCase().includes(term) ||
       (s.description && s.description.toLowerCase().includes(term))
    );
  }

  // Sort by rating (desc) and then date (desc) as an example
  filteredSessions.sort((a, b) => {
      if (b.tutorRating !== a.tutorRating) {
          return b.tutorRating - a.tutorRating;
      }
      return new Date(b.dateRecorded).getTime() - new Date(a.dateRecorded).getTime();
  });


  return filteredSessions;
};


// Helper function to format date string
const formatDate = (dateString: string): string => {
   try {
     return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
   } catch (e) {
     return "Invalid Date";
   }
}


export default function TutorShadowingPage() {
  const [sessions, setSessions] = useState<ShadowSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  const subjects = ['all', 'Mathematics', 'Science', 'English', 'Computer Science', 'History']; // Example subjects

  useEffect(() => {
    const loadSessions = async () => {
      setIsLoading(true);
      try {
        const fetchedSessions = await fetchShadowSessions({ subject: selectedSubject, searchTerm });
        setSessions(fetchedSessions);
      } catch (error) {
        console.error("Failed to load shadow sessions:", error);
        // Handle error state, e.g., show toast
      } finally {
        setIsLoading(false);
      }
    };
    loadSessions();
  }, [selectedSubject, searchTerm]); // Refetch when filters change


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 text-center flex items-center justify-center">
        <VideoOff className="h-8 w-8 mr-2 text-primary" /> AI Tutor Shadowing Library
      </h1>
      <p className="text-muted-foreground mb-8 text-center max-w-2xl mx-auto">
        Learn from the best! Watch anonymized recordings of top-rated tutoring sessions to see effective teaching strategies in action.
      </p>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 sticky top-16 bg-background py-4 z-10 border-b">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by title, subject, tutor, or description..."
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="w-full md:w-[200px]">
             <span className="flex items-center">
               <Filter className="mr-2 h-4 w-4 opacity-50" /> {/* Added Filter icon */}
               <SelectValue placeholder="Filter by Subject" />
             </span>
          </SelectTrigger>
          <SelectContent>
            {subjects.map(subject => (
              <SelectItem key={subject} value={subject}>
                {subject === 'all' ? 'All Subjects' : subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
         {/* TODO: Add more filters like rating, duration (maybe in a popover) */}
      </div>

      {/* Session Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="aspect-video w-full rounded-t-lg" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-1" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                 <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/4" />
              </CardContent>
               <CardFooter>
                  <Skeleton className="h-10 w-full" />
               </CardFooter>
            </Card>
          ))}
        </div>
      ) : sessions.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      ) : (
        <Card className="col-span-full text-center py-12 bg-muted/50 border-dashed">
           <VideoOff className="h-16 w-16 text-muted-foreground mx-auto mb-4"/>
          <CardTitle>No Sessions Found</CardTitle>
          <CardDescription>Try adjusting your search or filters, or check back later.</CardDescription>
        </Card>
      )}
    </div>
  );
}

// Session Card Component
function SessionCard({ session }: { session: ShadowSession }) {
  return (
    <Card className="flex flex-col overflow-hidden group transition-shadow hover:shadow-lg rounded-lg border">
      <CardHeader className="p-0 relative">
        <div className="aspect-video relative bg-muted overflow-hidden rounded-t-lg">
          <Image
            src={session.thumbnailUrl}
            alt={`${session.title} thumbnail`}
            fill
            style={{ objectFit: 'cover' }}
            className="transition-transform duration-300 group-hover:scale-105"
            unoptimized
             data-ai-hint="online class video conference screen screenshot"
          />
           <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <PlayCircle className="h-14 w-14 text-white/80" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 pb-2 px-4 flex-grow">
        <CardTitle className="text-lg font-semibold mb-1 line-clamp-2">{session.title}</CardTitle>
         <CardDescription className="text-sm mb-2 line-clamp-2 min-h-[2.5rem]"> {/* Min height for consistency */}
             {session.description || `Recorded session on ${session.subject}`}
         </CardDescription>
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
           <span className="flex items-center" title={`Tutor: ${session.tutorName}`}>
              <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-500" />
               {session.tutorRating.toFixed(1)} - {session.tutorName}
           </span>
           <span className="flex items-center">
              <Clock className="h-3 w-3 mr-1" /> {session.durationMinutes} min
           </span>
        </div>
         <p className="text-xs text-muted-foreground">{formatDate(session.dateRecorded)}</p>
      </CardContent>
       <CardFooter className="pt-2 pb-4 px-4 mt-auto border-t">
          {/* Link to a dedicated session player page: /sessions/shadowing/[sessionId] */}
          {/* In a real app, recordingUrl would point to the actual video, maybe via a signed URL */}
          <Link href={`/sessions/shadowing/${session.id}?url=${encodeURIComponent(session.recordingUrl)}`} passHref className="w-full">
             <Button className="w-full">
               <PlayCircle className="mr-2 h-4 w-4" /> Watch Session
             </Button>
          </Link>
       </CardFooter>
    </Card>
  );
}
