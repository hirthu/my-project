import type { Metadata } from 'next';
import TutorCard from '@/components/tutor-card';
import { getTutor, type Tutor } from '@/services/tutor'; // Import Tutor type
import { Input } from '@/components/ui/input'; // For potential search
import { Button } from '@/components/ui/button'; // For potential search/filter
import { Search, Filter } from 'lucide-react'; // Icons

export const metadata: Metadata = {
  title: 'Find Tutors - TutorVerse', // Updated title
  description: 'Browse and connect with expert tutors on TutorVerse.', // Updated description
};

// Mock data fetching - replace with actual API call
async function getTutors(): Promise<Tutor[]> { // Explicit return type
  // Simulate fetching multiple tutors. Replace with actual service call.
   // Simulate fetching data with a delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const tutorIds = ['tutor1', 'tutor2', 'tutor3', 'tutor4', 'tutor5', 'tutor6']; // Added more tutors
  let tutors = await Promise.all(tutorIds.map(id => getTutor(id))); // Use let

  // Add unique data for mock tutors more realistically
   tutors = tutors.map((tutor, index) => {
      const names = ['Alice Smith', 'Bob Johnson', 'Charlie Brown', 'Diana Prince', 'Ethan Hunt', 'Fiona Glenanne'];
      const subjects = [['Math', 'Physics'], ['Physics', 'Chemistry'], ['Chemistry', 'Biology'], ['Literature', 'History'], ['Computer Science', 'Math'], ['Languages', 'ESL']];
      const ratings = [4.8, 4.5, 4.9, 4.7, 4.6, 4.8];
      const certs = [
        ['PhD Math', 'Certified Educator'],
        ['MSc Physics', 'Tutoring Pro Certificate'],
        ['BSc Chemistry', 'Patient Tutor Award'],
        ['MA Literature', 'Writing Coach Cert.'],
        ['MS CompSci', 'Google Certified Educator'],
        ['MA Linguistics', 'TEFL Certified']
      ];
      const seeds = ['alice', 'bob', 'charlie', 'diana', 'ethan', 'fiona'];

     return {
        ...tutor,
        id: `tutor-${index + 1}`, // Ensure unique IDs
        name: names[index % names.length],
        rating: ratings[index % ratings.length],
        certifications: certs[index % certs.length],
        // Use a more specific seed for image consistency
        introVideoUrl: `https://picsum.photos/seed/${seeds[index % seeds.length]}/400/225`, // Using image URL as placeholder
        // Add a mock description
        description: `Experienced ${subjects[index % subjects.length].join(' & ')} tutor passionate about helping students succeed. Proven track record of improving grades and building confidence.`
      };
   });

  return tutors;
}

export default async function TutorsPage() {
  const tutors = await getTutors();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Find Your Perfect Tutor</h1>

       {/* Search and Filter Bar - Basic Placeholder */}
       <div className="flex flex-col md:flex-row gap-4 mb-8 sticky top-16 pt-4 pb-2 bg-background z-10"> {/* Make it sticky */}
          <div className="relative flex-grow">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
             <Input
                type="search"
                placeholder="Search by name, subject, or keyword..."
                className="pl-10 w-full"
                // Add onChange, state management later
              />
          </div>
          <Button variant="outline">
             <Filter className="mr-2 h-4 w-4" />
             Filters {/* Add Popover/Dialog for filters later */}
          </Button>
       </div>

      {/* Tutor Grid */}
      {tutors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tutors.map((tutor) => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))}
          </div>
      ) : (
         <p className="text-center text-muted-foreground py-10">No tutors found matching your criteria.</p> // Handle no results
      )}

    </div>
  );
}
