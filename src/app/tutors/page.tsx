import type { Metadata } from 'next';
import TutorCard from '@/components/tutor-card';
import { getTutor } from '@/services/tutor'; // Assuming a service to fetch multiple tutors exists or will be created

export const metadata: Metadata = {
  title: 'Find Tutors - TutorVerse Lite',
  description: 'Browse and find expert tutors.',
};

// Mock data fetching - replace with actual API call
async function getTutors() {
  // Simulate fetching multiple tutors. Replace with actual service call.
  const tutorIds = ['tutor1', 'tutor2', 'tutor3', 'tutor4'];
  const tutors = await Promise.all(tutorIds.map(id => getTutor(id)));
  // Add unique data for mock tutors
    tutors[0] = { ...tutors[0], name: 'Alice Smith', rating: 4.8, certifications: ['PhD Math', 'Certified Educator'], introVideoUrl: 'https://picsum.photos/seed/alice/300/170'};
    tutors[1] = { ...tutors[1], name: 'Bob Johnson', rating: 4.5, certifications: ['MSc Physics', 'Tutoring Pro'], introVideoUrl: 'https://picsum.photos/seed/bob/300/170' };
    tutors[2] = { ...tutors[2], name: 'Charlie Brown', rating: 4.9, certifications: ['BSc Chemistry', 'Patient Tutor'], introVideoUrl: 'https://picsum.photos/seed/charlie/300/170' };
    tutors[3] = { ...tutors[3], name: 'Diana Prince', rating: 4.7, certifications: ['MA Literature', 'Writing Coach'], introVideoUrl: 'https://picsum.photos/seed/diana/300/170' };

  return tutors;
}

export default async function TutorsPage() {
  const tutors = await getTutors();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Find Your Perfect Tutor</h1>
      {/* Add search/filter controls here later */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tutors.map((tutor) => (
          <TutorCard key={tutor.id} tutor={tutor} />
        ))}
      </div>
    </div>
  );
}
