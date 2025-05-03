'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, Layers, Tag, Search, Loader2, FileWarning, RotateCw, ArrowRight, Check, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

// Mock Flashcard Interface
interface Flashcard {
  id: string;
  question: string;
  answer: string;
  subject: string; // e.g., 'Mathematics', 'Physics'
  topic?: string; // e.g., 'Derivatives', 'Newtonian Laws'
  sourceSessionId?: string; // Optional link back to the session
  createdAt: Date;
  lastReviewed?: Date;
  easeFactor: number; // For spaced repetition (e.g., 2.5 initially)
  intervalDays: number; // Next review interval (e.g., 1 day initially)
  dueDate: Date; // When the card is next due for review
}

// Mock function to fetch flashcards - replace with Firestore query
const fetchFlashcards = async (filters: { subject?: string, searchTerm?: string, dueOnly?: boolean }): Promise<Flashcard[]> => {
  console.log('Fetching flashcards with filters:', filters);
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

  let allCards: Flashcard[] = [];
    try {
       const storedCards = localStorage.getItem('tutorverseFlashcards');
       if (storedCards) {
           const parsedCards = JSON.parse(storedCards) as Flashcard[];
           allCards = parsedCards.map(card => ({
              ...card,
              createdAt: new Date(card.createdAt),
              dueDate: new Date(card.dueDate),
              lastReviewed: card.lastReviewed ? new Date(card.lastReviewed) : undefined,
           }));
       } else {
            // Default mock data
            const now = new Date();
            allCards = [
               { id: 'fc1', question: 'What is the power rule for derivatives?', answer: 'd/dx(x^n) = nx^(n-1)', subject: 'Mathematics', topic: 'Calculus', createdAt: new Date(now.getTime() - 86400000 * 2), easeFactor: 2.5, intervalDays: 1, dueDate: new Date(now.getTime() - 86400000) }, // Due yesterday
               { id: 'fc2', question: 'State Newton\'s Second Law.', answer: 'F = ma (Force equals mass times acceleration)', subject: 'Science', topic: 'Physics', createdAt: new Date(now.getTime() - 86400000), easeFactor: 2.5, intervalDays: 1, dueDate: now }, // Due today
               { id: 'fc3', question: 'What is the main function of mitochondria?', answer: 'To generate most of the cell\'s supply of ATP (energy)', subject: 'Science', topic: 'Biology', createdAt: new Date(), easeFactor: 2.6, intervalDays: 3, dueDate: new Date(now.getTime() + 86400000 * 3) }, // Due in 3 days
               { id: 'fc4', question: 'Define "Photosynthesis".', answer: 'Process used by plants to convert light energy into chemical energy.', subject: 'Science', topic: 'Biology', createdAt: new Date(now.getTime() - 3600000 * 5), easeFactor: 2.4, intervalDays: 2, dueDate: new Date(now.getTime() + 86400000 * 2) }, // Due in 2 days
            ];
            localStorage.setItem('tutorverseFlashcards', JSON.stringify(allCards));
       }
    } catch (error) { console.error("Error reading flashcards:", error); }


  let filteredCards = allCards;

  if (filters.subject && filters.subject !== 'all') {
    filteredCards = filteredCards.filter(c => c.subject === filters.subject);
  }

  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    filteredCards = filteredCards.filter(c =>
      c.question.toLowerCase().includes(term) ||
      c.answer.toLowerCase().includes(term) ||
      (c.topic && c.topic.toLowerCase().includes(term))
    );
  }

   if (filters.dueOnly) {
       const today = new Date();
       today.setHours(0, 0, 0, 0); // Start of today
       filteredCards = filteredCards.filter(c => c.dueDate <= today);
   }

  // Sort by due date ascending for review
  filteredCards.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  return filteredCards;
};


// Mock Spaced Repetition Update Logic (Simplified SM-2 like)
const updateFlashcardReview = async (card: Flashcard, performanceRating: 0 | 1 | 2 | 3): Promise<Flashcard> => {
    console.log(`Updating review for card ${card.id} with rating ${performanceRating}`);
     await new Promise(resolve => setTimeout(resolve, 200)); // Simulate save

    let { easeFactor, intervalDays } = card;
    const now = new Date();

    if (performanceRating < 2) { // Rating 0 or 1 (Forgot or Hard)
       intervalDays = 1; // Reset interval
       easeFactor = Math.max(1.3, easeFactor - 0.2); // Decrease ease slightly
    } else { // Rating 2 or 3 (Good or Easy)
       if (intervalDays <= 1) {
           intervalDays = performanceRating === 2 ? 3 : 4; // First correct reviews
       } else {
           intervalDays = Math.ceil(intervalDays * easeFactor);
       }
       // Increase ease factor based on performance (more for 'Easy')
       easeFactor += (0.1 - (3 - performanceRating) * (0.08 + (3 - performanceRating) * 0.02));
       easeFactor = Math.max(1.3, easeFactor); // Ensure ease factor doesn't go too low
    }

    // Max interval (e.g., 1 year)
    intervalDays = Math.min(intervalDays, 365);

    const dueDate = new Date(now.getTime() + intervalDays * 86400000);
    dueDate.setHours(0, 0, 0, 0); // Set to start of the day

    const updatedCard: Flashcard = {
        ...card,
        easeFactor: parseFloat(easeFactor.toFixed(2)),
        intervalDays: Math.round(intervalDays),
        dueDate,
        lastReviewed: now,
    };

     // Update in localStorage
     try {
        const allCards = await fetchFlashcards({});
        const cardIndex = allCards.findIndex(c => c.id === updatedCard.id);
        if (cardIndex > -1) {
            allCards[cardIndex] = updatedCard;
            localStorage.setItem('tutorverseFlashcards', JSON.stringify(allCards));
        }
     } catch (error) { console.error("Failed to update card in storage:", error); }

    return updatedCard;
};


// --- Review Session Component ---

interface ReviewSessionProps {
  cardsToReview: Flashcard[];
  onSessionComplete: () => void;
}

const FlashcardReviewSession: React.FC<ReviewSessionProps> = ({ cardsToReview, onSessionComplete }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
     const [reviewedCards, setReviewedCards] = useState<Flashcard[]>([]); // Store updated cards

    if (cardsToReview.length === 0 || currentIndex >= cardsToReview.length) {
       // Session finished - could show summary before calling onSessionComplete
        useEffect(() => {
            onSessionComplete(); // Notify parent that session is done
        }, [onSessionComplete]);
        return (
           <Card className="text-center p-8">
              <Check className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <CardTitle>Review Complete!</CardTitle>
              <CardDescription>You've reviewed all due cards for now.</CardDescription>
               {/* TODO: Add button to go back or see stats */}
           </Card>
       );
    }

    const currentCard = cardsToReview[currentIndex];

    const handleFlip = () => setIsFlipped(!isFlipped);

    const handlePerformanceRating = async (rating: 0 | 1 | 2 | 3) => {
       if (isSaving) return;
       setIsSaving(true);
       try {
           const updatedCard = await updateFlashcardReview(currentCard, rating);
            setReviewedCards(prev => [...prev, updatedCard]); // Keep track if needed for summary
           setCurrentIndex(currentIndex + 1); // Move to next card
           setIsFlipped(false); // Reset flip state
       } catch (error) {
           console.error("Error updating card review:", error);
            // Show error toast
       } finally {
           setIsSaving(false);
       }
    };

    const progressPercent = ((currentIndex + 1) / cardsToReview.length) * 100;

    return (
       <Card className="w-full max-w-lg mx-auto shadow-lg">
          <CardHeader>
             <Progress value={progressPercent} className="mb-4"/>
             <CardTitle>Reviewing Flashcard ({currentIndex + 1} / {cardsToReview.length})</CardTitle>
             <CardDescription>Topic: {currentCard.topic || currentCard.subject}</CardDescription>
          </CardHeader>
           <CardContent
              className="min-h-[200px] flex items-center justify-center p-6 cursor-pointer bg-card rounded-md perspective"
              onClick={handleFlip}
           >
              <div className={`transition-transform duration-500 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                 {/* Front */}
                 <div className={`backface-hidden ${isFlipped ? 'hidden' : ''}`}>
                    <p className="text-xl text-center font-medium">{currentCard.question}</p>
                 </div>
                  {/* Back */}
                 <div className={`backface-hidden rotate-y-180 ${!isFlipped ? 'hidden' : ''}`}>
                    <p className="text-lg text-center">{currentCard.answer}</p>
                 </div>
              </div>
           </CardContent>
           <CardFooter className="flex flex-col items-center pt-4 border-t">
              {!isFlipped ? (
                  <Button onClick={handleFlip} className="w-full">Show Answer</Button>
              ) : (
                 <div className="w-full space-y-3">
                      <p className="text-sm text-center text-muted-foreground">How well did you remember?</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <Button variant="destructive" onClick={() => handlePerformanceRating(0)} disabled={isSaving} className="text-xs sm:text-sm">Forgot</Button>
                          <Button variant="outline" onClick={() => handlePerformanceRating(1)} disabled={isSaving} className="text-xs sm:text-sm">Hard</Button>
                          <Button variant="outline" onClick={() => handlePerformanceRating(2)} disabled={isSaving} className="text-xs sm:text-sm">Good</Button>
                          <Button variant="default" onClick={() => handlePerformanceRating(3)} disabled={isSaving} className="text-xs sm:text-sm bg-green-600 hover:bg-green-700">Easy</Button>
                      </div>
                     {isSaving && <Loader2 className="h-4 w-4 animate-spin mx-auto mt-2"/>}
                 </div>
              )}
           </CardFooter>
       </Card>
    );
}


// --- Main Page Component ---
export default function FlashcardsPage() {
  const [allFlashcards, setAllFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [isReviewing, setIsReviewing] = useState(false);
   const [dueCards, setDueCards] = useState<Flashcard[]>([]);

  const subjects = useMemo(() => {
     const uniqueSubjects = new Set(allFlashcards.map(c => c.subject));
     return ['all', ...Array.from(uniqueSubjects)];
  }, [allFlashcards]);


  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
          const fetchedCards = await fetchFlashcards({}); // Fetch all initially
          setAllFlashcards(fetchedCards);
          // Determine due cards
          const today = new Date();
          today.setHours(0, 0, 0, 0);
           const due = fetchedCards.filter(c => c.dueDate <= today);
           setDueCards(due.sort((a,b) => a.dueDate.getTime() - b.dueDate.getTime()));
      } catch (error) {
        console.error("Failed to load flashcards:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []); // Load once on mount

   const startReviewSession = () => {
      if (dueCards.length > 0) {
          setIsReviewing(true);
      } else {
          alert("No cards due for review right now!");
      }
   }

   const handleSessionComplete = () => {
       setIsReviewing(false);
       // Refresh due cards count after review
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const stillDue = allFlashcards.filter(c => c.dueDate <= today && !dueCards.find(dc => dc.id === c.id)); // Filter out just reviewed
        setDueCards(stillDue.sort((a,b) => a.dueDate.getTime() - b.dueDate.getTime()));
       // TODO: Potentially reload all cards if updates are significant
       // loadInitialData();
   }

   const filteredDisplayCards = useMemo(() => {
       let displayCards = allFlashcards;
       if (selectedSubject !== 'all') {
           displayCards = displayCards.filter(c => c.subject === selectedSubject);
       }
       if (searchTerm) {
           const term = searchTerm.toLowerCase();
           displayCards = displayCards.filter(c =>
             c.question.toLowerCase().includes(term) ||
             c.answer.toLowerCase().includes(term) ||
             (c.topic && c.topic.toLowerCase().includes(term))
           );
       }
       return displayCards.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Show newest first in library view
   }, [allFlashcards, selectedSubject, searchTerm]);


  if (isReviewing) {
     return (
         <div className="container mx-auto px-4 py-8">
             <FlashcardReviewSession cardsToReview={dueCards} onSessionComplete={handleSessionComplete} />
         </div>
     );
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 text-center flex items-center justify-center">
        <Layers className="h-8 w-8 mr-2 text-primary" /> Flashcard Library & Review
      </h1>
      <p className="text-muted-foreground mb-6 text-center max-w-2xl mx-auto">
        Review your AI-generated flashcards using spaced repetition or browse your collection.
      </p>

       <Card className="mb-6 bg-gradient-to-r from-primary/10 via-transparent to-transparent border-primary/50">
           <CardHeader className="flex flex-row items-center justify-between">
               <div>
                   <CardTitle>Review Due Cards</CardTitle>
                   <CardDescription>{dueCards.length} card{dueCards.length !== 1 ? 's' : ''} ready for review.</CardDescription>
               </div>
               <Button onClick={startReviewSession} disabled={dueCards.length === 0 || isLoading}>
                  <RotateCw className="mr-2 h-4 w-4"/> Start Review Session
               </Button>
           </CardHeader>
       </Card>

      {/* Library View */}
       <Card>
          <CardHeader>
             <CardTitle>Flashcard Library</CardTitle>
             <CardDescription>Browse or search all your saved flashcards.</CardDescription>
              {/* Filters */}
             <div className="flex flex-col md:flex-row gap-4 pt-4">
               <div className="relative flex-grow">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                 <Input
                   type="search"
                   placeholder="Search question, answer, or topic..."
                   className="pl-10 w-full"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
               </div>
               <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                 <SelectTrigger className="w-full md:w-[200px]">
                   <SelectValue placeholder="Filter by Subject" />
                 </SelectTrigger>
                 <SelectContent>
                   {subjects.map(subject => (
                     <SelectItem key={subject} value={subject}>
                       {subject === 'all' ? 'All Subjects' : subject}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
          </CardHeader>
           <CardContent>
               {isLoading ? (
                   <div className="text-center py-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" /></div>
               ) : filteredDisplayCards.length > 0 ? (
                  <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                      {filteredDisplayCards.map(card => (
                          <div key={card.id} className="p-3 border rounded-md text-sm">
                              <p className="font-medium">{card.question}</p>
                              <p className="text-muted-foreground mt-1">{card.answer}</p>
                              <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                                 <span>Subject: {card.subject} {card.topic ? `(${card.topic})` : ''}</span>
                                 <span>Due: {card.dueDate.toLocaleDateString()}</span>
                              </div>
                          </div>
                      ))}
                  </div>
               ) : (
                   <div className="text-center py-10 text-muted-foreground">
                      <FileWarning className="h-10 w-10 mx-auto mb-2"/>
                       No flashcards found matching your criteria.
                   </div>
               )}
           </CardContent>
       </Card>

       <Card className="mt-6 border-dashed border-sky-500">
           <CardHeader>
               <CardTitle className="flex items-center"><Bot className="h-5 w-5 mr-2 text-sky-500"/> How Flashcards are Created</CardTitle>
               <CardDescription>
                   During your tutoring sessions, our AI can automatically transcribe spoken content (with your permission) and identify key concepts to generate flashcards for you. These are then added to your library for review.
               </CardDescription>
           </CardHeader>
            {/* Optional: Link to settings to enable/disable this feature */}
       </Card>

    </div>
  );
}
