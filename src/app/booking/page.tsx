import type { Metadata } from 'next';
import BookingCalendar from '@/components/booking-calendar';
import { getTutor } from '@/services/tutor';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const metadata: Metadata = {
  title: 'Book a Session - TutorVerse Lite',
  description: 'Schedule your tutoring session.',
};

async function TutorInfo({ tutorId }: { tutorId: string }) {
  try {
    const tutor = await getTutor(tutorId);
    return (
      <div className="flex items-center space-x-4 mb-6">
         <Avatar className="h-16 w-16">
           {/* Placeholder Avatar Image */}
           <AvatarImage src={`https://picsum.photos/seed/${tutor.id}/100`} alt={tutor.name} data-ai-hint="profile portrait person" />
           <AvatarFallback>{tutor.name.substring(0, 2).toUpperCase()}</AvatarFallback>
         </Avatar>
        <div>
          <h2 className="text-xl font-semibold">Booking with {tutor.name}</h2>
          <p className="text-muted-foreground">Select a date and available time slot below.</p>
        </div>
      </div>
    );
  } catch (error) {
     console.error("Failed to fetch tutor info:", error);
     return <p className="text-destructive mb-6">Could not load tutor information.</p>;
  }
}

function TutorInfoSkeleton() {
  return (
     <div className="flex items-center space-x-4 mb-6">
      <Skeleton className="h-16 w-16 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
    </div>
  )
}

export default function BookingPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  // TODO: Enhance tutor selection - maybe a dropdown if no tutorId provided
  const tutorId = typeof searchParams?.tutorId === 'string' ? searchParams.tutorId : 'default-tutor'; // Use a default or handle error

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">Schedule Your Session</h1>

      <Suspense fallback={<TutorInfoSkeleton />}>
        <TutorInfo tutorId={tutorId} />
      </Suspense>

      <BookingCalendar tutorId={tutorId} />
    </div>
  );
}
