/**
 * Represents a tutor with relevant information for display.
 */
export interface Tutor {
  /**
   * The unique identifier of the tutor.
   */
  id: string;
  /**
   * The name of the tutor.
   */
  name: string;
   /**
   * A brief text description or bio of the tutor.
   */
  description?: string; // Added description field
  /**
   * A brief introduction video URL (or image placeholder URL).
   */
  introVideoUrl: string;
  /**
   * The rating of the tutor (e.g., average rating).
   */
  rating: number;
  /**
   * A list of certifications the tutor holds.
   */
  certifications: string[];
  // Consider adding subjects taught:
  // subjects: string[];
  // Consider adding hourly rate:
  // hourlyRate?: number;
}

/**
 * Asynchronously retrieves tutor information by ID.
 *
 * @param tutorId The ID of the tutor to retrieve.
 * @returns A promise that resolves to a Tutor object.
 * @throws Will throw an error if the tutor is not found (in a real implementation).
 */
export async function getTutor(tutorId: string): Promise<Tutor> {
  // TODO: Implement this by calling a real API or database (e.g., Firestore).
  // Handle potential errors like tutor not found.

  console.log(`Fetching mock tutor data for ID: ${tutorId}`);
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 50));

  // Return detailed mock data - this should be replaced by actual data fetching logic.
  // We'll provide a default based on ID, but ideally the `getTutors` function in the page
  // would populate this from a list or the database would provide it.
  const mockTutors: Record<string, Tutor> = {
      'tutor1': { id: 'tutor1', name: 'Alice Smith', description: 'PhD in Mathematics with 5+ years of tutoring experience. Specializing in calculus and algebra.', introVideoUrl: 'https://picsum.photos/seed/alice/400/225', rating: 4.8, certifications: ['PhD Math', 'Certified Educator', 'Online Teaching Pro'] },
      'tutor2': { id: 'tutor2', name: 'Bob Johnson', description: 'Physics enthusiast making complex concepts easy to understand. MSc in Physics.', introVideoUrl: 'https://picsum.photos/seed/bob/400/225', rating: 4.5, certifications: ['MSc Physics', 'Tutoring Pro Certificate'] },
      'tutor3': { id: 'tutor3', name: 'Charlie Brown', description: 'Patient and encouraging Chemistry tutor (BSc). Let\'s make chemistry fun!', introVideoUrl: 'https://picsum.photos/seed/charlie/400/225', rating: 4.9, certifications: ['BSc Chemistry', 'Patient Tutor Award'] },
      'tutor4': { id: 'tutor4', name: 'Diana Prince', description: 'Expert in English Literature and History (MA). Strong focus on essay writing and critical analysis.', introVideoUrl: 'https://picsum.photos/seed/diana/400/225', rating: 4.7, certifications: ['MA Literature', 'Writing Coach Cert.'] },
      'tutor5': { id: 'tutor5', name: 'Ethan Hunt', description: 'Full-stack developer and CompSci tutor (MS). Specializes in Python, Java, and web development.', introVideoUrl: 'https://picsum.photos/seed/ethan/400/225', rating: 4.6, certifications: ['MS CompSci', 'Google Certified Educator'] },
      'tutor6': { id: 'tutor6', name: 'Fiona Glenanne', description: 'Experienced language tutor (MA Linguistics) offering Spanish and ESL lessons. TEFL certified.', introVideoUrl: 'https://picsum.photos/seed/fiona/400/225', rating: 4.8, certifications: ['MA Linguistics', 'TEFL Certified'] },
      'default-tutor': { id: 'default-tutor', name: 'Default Tutor', description: 'A skilled tutor available for booking.', introVideoUrl: 'https://picsum.photos/seed/default/400/225', rating: 4.0, certifications: ['General Tutoring'] }
  };


  const tutor = mockTutors[tutorId] || mockTutors['default-tutor']; // Fallback to default

  if (!tutor && tutorId !== 'default-tutor') {
       console.warn(`Mock tutor with ID ${tutorId} not found, returning default.`);
       // In a real app, you might throw an error here:
       // throw new Error(`Tutor with ID ${tutorId} not found`);
       return mockTutors['default-tutor'];
   }


  // Make sure the returned tutor has the requested ID, even if falling back
  return { ...tutor, id: tutorId };
}
