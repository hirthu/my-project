'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, Layers, Tag, Search, Loader2, FileWarning, RotateCw, ArrowRight, Check, X, Info, Speech } from 'lucide-react'; // Added Info, Speech
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast'; // Import useToast

// Mock Flashcard Interface
interface Flashcard {
  id: string;
  question: string;
  answer: string;
  subject: string;
  topic?: string;
  sourceSessionId?: string; // Optional link back to the session where it was generated
  createdAt: Date;
  lastReviewed?: Date;
  easeFactor: number; // Example: 2.5 initially
  intervalDays: number; // Next review interval in days
  dueDate: Date; // Date when the card is next due for review
}

// Mock User ID
const userId = 'user123';

// --- Mock Data Functions ---

// Fetch flashcards - replace with Firestore query
const fetchFlashcards = async (userId: string): Promise<Flashcard[]> => {
  console.log(`Fetching flashcards for user ${userId}...`);
  await new Promise(resolve => setTimeout(resolve, 1000));

  let allCards: Flashcard[] = [];
    try {
       const storedCards = localStorage.getItem(`tutorverseFlashcards_${userId}`);
       if (storedCards) {
           const parsedCards = JSON.parse(storedCards) as any[]; // Use any temporarily for parsing dates
           allCards = parsedCards.map(card => ({
              ...card,
              createdAt: new Date(card.createdAt),
              dueDate: new Date(card.dueDate),
              lastReviewed: card.lastReviewed ? new Date(card.lastReviewed) : undefined,
           }));
       } else {
            // Default mock data if storage is empty
            const now = new Date();
            allCards = [
               { id: 'fc1', question: 'What is the power rule for derivatives?', answer: 'd/dx(x^n) = nx^(n-1)', subject: 'Mathematics', topic: 'Calculus', createdAt: new Date(now.getTime() - 86400000 * 2), easeFactor: 2.5, intervalDays: 1, dueDate: new Date(now.getTime() - 86400000), sourceSessionId: 'sess_calc1' }, // Due yesterday
               { id: 'fc2', question: 'State Newton\'s Second Law.', answer: 'F = ma (Force equals mass times acceleration)', subject: 'Science', topic: 'Physics', createdAt: new Date(now.getTime() - 86400000), easeFactor: 2.5, intervalDays: 1, dueDate: now, sourceSessionId: 'sess_phys1' }, // Due today
               { id: 'fc3', question: 'What is the main function of mitochondria?', answer: 'To generate most of the cell\'s supply of ATP (energy)', subject: 'Science', topic: 'Biology', createdAt: new Date(), easeFactor: 2.6, intervalDays: 3, dueDate: new Date(now.getTime() + 86400000 * 3) },
               { id: 'fc4', question: 'Define "Photosynthesis".', answer: 'Process used by plants to convert light energy into chemical energy.', subject: 'Science', topic: 'Biology', createdAt: new Date(now.getTime() - 3600000 * 5), easeFactor: 2.4, intervalDays: 2, dueDate: new Date(now.getTime() + 86400000 * 2) },
               { id: 'fc5', question: 'What does `git clone` do?', answer: 'Creates a local copy of a remote Git repository.', subject: 'Computer Science', topic: 'Git', createdAt: new Date(now.getTime() - 86400000 * 5), easeFactor: 2.7, intervalDays: 6, dueDate: new Date(now.getTime() + 86400000) } // Due tomorrow
            ];
            localStorage.setItem(`tutorverseFlashcards_${userId}`, JSON.stringify(allCards));
       }
    } catch (error) { console.error("Error reading flashcards:", error); }

  return allCards;
};

// Save updated flashcard list (e.g., after review)
const saveFlashcards = async (userId: string, cards: Flashcard[]): Promise<boolean> => {
   console.log(`Saving ${cards.length} flashcards for user ${userId}...`);
   await new Promise(resolve => setTimeout(resolve, 200)); // Simulate save delay
    try {
        localStorage.setItem(`tutorverseFlashcards_${userId}`, JSON.stringify(cards));
        return true;
    } catch (error) {
        console.error("Error saving flashcards:", error);
        return false;
    }
}


// Spaced Repetition Update Logic (Simplified SM-2 like)
const calculateNextReview = (card: Flashcard, performanceRating: 0 | 1 | 2 | 3): Partial<Flashcard> => {
    let { easeFactor, intervalDays } = card;
    const now = new Date();

    if (performanceRating < 2) { // 0: Forgot, 1: Hard
       intervalDays = 1; // Reset interval
       easeFactor = Math.max(1.3, easeFactor - 0.2); // Decrease ease
    } else { // 2: Good, 3: Easy
       if (card.lastReviewed === undefined || intervalDays <= 1) { // First review or reset
           intervalDays = performanceRating === 2 ? 3 : 4;
       } else {
           intervalDays = Math.ceil(intervalDays * easeFactor);
       }
       // Adjust ease factor based on performance (more increase for 'Easy')
       easeFactor += (0.1 - (3 - performanceRating) * (0.08 + (3 - performanceRating) * 0.02));
       easeFactor = Math.max(1.3, easeFactor); // Minimum ease factor
    }

    // Apply fuzz factor (e.g., +/- 10%) and max interval (e.g., 1 year)
    intervalDays = Math.min(Math.max(1, Math.round(intervalDays * (0.9 + Math.random() * 0.2))), 365);

    const dueDate = new Date(now.getTime() + intervalDays * 86400000);
    dueDate.setHours(0, 0, 0, 0); // Set to start of the day

    return {
        easeFactor: parseFloat(easeFactor.toFixed(2)),
        intervalDays,
        dueDate,
        lastReviewed: now,
    };
};


// --- Review Session Component ---

interface ReviewSessionProps {
  initialCards: Flashcard[];
  onSessionComplete: (reviewedCards: Flashcard[]) => void;
}

const FlashcardReviewSession: React.FC<ReviewSessionProps> = ({ initialCards, onSessionComplete }) => {
    const [cardsToReview, setCardsToReview] = useState([...initialCards]); // Copy initial cards
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [sessionComplete, setSessionComplete] = useState(false);
    const [reviewedCardsData, setReviewedCardsData] = useState<Flashcard[]>([]); // Store updates

    const handleFlip = () => setIsFlipped(!isFlipped);

    const handlePerformanceRating = async (rating: 0 | 1 | 2 | 3) => {
       if (isSaving || currentIndex >= cardsToReview.length) return;

       setIsSaving(true);
       const currentCard = cardsToReview[currentIndex];
       const updates = calculateNextReview(currentCard, rating);
       const updatedCard: Flashcard = { ...currentCard, ...updates };

       setReviewedCardsData(prev => [...prev, updatedCard]); // Track updated card

       // Move to next card
       const nextIndex = currentIndex + 1;
       if (nextIndex >= cardsToReview.length) {
          setSessionComplete(true); // Mark session as complete locally
       } else {
          setCurrentIndex(nextIndex);
          setIsFlipped(false); // Reset flip state for next card
       }

       setIsSaving(false);
    };

    // Call parent onSessionComplete when locally marked as complete
    useEffect(() => {
       if (sessionComplete) {
           onSessionComplete(reviewedCardsData);
       }
    }, [sessionComplete, onSessionComplete, reviewedCardsData]);

    if (cardsToReview.length === 0 || sessionComplete) {
        return (
           <Card className="w-full max-w-lg mx-auto text-center p-8 shadow-lg animate-fade-in-up">
              <Check className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <CardTitle>Review Complete!</CardTitle>
              <CardDescription>You've reviewed all due cards for this session.</CardDescription>
               {/* The onSessionComplete callback handles navigation/state update in the parent */}
           </Card>
       );
    }

    const currentCard = cardsToReview[currentIndex];
    const progressPercent = Math.round(((currentIndex + 1) / cardsToReview.length) * 100);

    return (
       <Card className="w-full max-w-lg mx-auto shadow-xl border border-primary/20">
          <CardHeader>
             <Progress value={progressPercent} aria-label={`${progressPercent}% complete`} className="mb-4 h-2"/>
             <CardTitle className="text-center">Reviewing Card {currentIndex + 1} / {cardsToReview.length}</CardTitle>
             <CardDescription className="text-center text-xs">
                 {currentCard.topic ? `${currentCard.subject} > ${currentCard.topic}` : currentCard.subject}
                 {currentCard.sourceSessionId && ` (From Session)`}
             </CardDescription>
          </CardHeader>
           <CardContent
              className="min-h-[200px] flex items-center justify-center p-6 cursor-pointer bg-card rounded-md m-4 border"
              onClick={handleFlip}
              role="button"
              aria-live="polite"
              tabIndex={0}
              onKeyDown={(e) => {if (e.key === ' ' || e.key === 'Enter') handleFlip()}}
           >
              {/* Using CSS for flip effect can be complex, simple conditional render for now */}
              <div className="text-center">
                 {!isFlipped ? (
                     <p className="text-xl font-semibold">{currentCard.question}</p>
                 ) : (
                     <p className="text-lg">{currentCard.answer}</p>
                 )}
              </div>
           </CardContent>
           <CardFooter className="flex flex-col items-center pt-4 pb-6 border-t">
              {!isFlipped ? (
                  <Button onClick={handleFlip} className="w-full">Show Answer</Button>
              ) : (
                 <div className="w-full space-y-3">
                      <p className="text-sm text-center text-muted-foreground">How well did you remember?</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <Button variant="destructive" onClick={() => handlePerformanceRating(0)} disabled={isSaving} title="Forgot Completely (Again Soon)">Forgot</Button>
                          <Button variant="outline" onClick={() => handlePerformanceRating(1)} disabled={isSaving} title="Recalled with Difficulty (Soon)">Hard</Button>
                          <Button variant="default" onClick={() => handlePerformanceRating(2)} disabled={isSaving} title="Recalled Correctly (Later)">Good</Button>
                          <Button variant="secondary" onClick={() => handlePerformanceRating(3)} disabled={isSaving} title="Recalled Easily (Much Later)">Easy</Button>
                      </div>
                     {isSaving && <div className="flex justify-center pt-2"><Loader2 className="h-4 w-4 animate-spin"/></div>}
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
  const { toast } = useToast();

  // Load initial data
  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
        const fetchedCards = await fetchFlashcards(userId);
        setAllFlashcards(fetchedCards);
    } catch (error) {
      console.error("Failed to load flashcards:", error);
      toast({ title: "Error Loading", description: "Could not load flashcards.", variant: "destructive"});
    } finally {
      setIsLoading(false);
    }
  }, [toast]); // toast is stable

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const dueCards = useMemo(() => {
     const today = new Date();
     today.setHours(0, 0, 0, 0);
     return allFlashcards
        .filter(c => c.dueDate <= today)
        .sort((a,b) => a.dueDate.getTime() - b.dueDate.getTime()); // Oldest due first
  }, [allFlashcards]);

  const subjects = useMemo(() => {
     const uniqueSubjects = new Set(allFlashcards.map(c => c.subject));
     return ['all', ...Array.from(uniqueSubjects).sort()];
  }, [allFlashcards]);

   const startReviewSession = () => {
      if (dueCards.length > 0) {
          setIsReviewing(true);
      } else {
          toast({ title: "All Caught Up!", description: "No cards due for review right now." });
      }
   }

   // Callback function when a review session ends
   const handleSessionComplete = useCallback(async (reviewedCardsData: Flashcard[]) => {
        console.log("Session complete, reviewed cards:", reviewedCardsData);
        setIsReviewing(false); // Exit review mode

        if (reviewedCardsData.length === 0) return; // No changes to save

        // Update the state optimistically
        const updatedCardMap = new Map(reviewedCardsData.map(card => [card.id, card]));
        const updatedAllCards = allFlashcards.map(card => updatedCardMap.get(card.id) || card);
        setAllFlashcards(updatedAllCards);

        // Persist the changes
        const success = await saveFlashcards(userId, updatedAllCards);
        if (!success) {
            toast({ title: "Save Error", description: "Could not save review progress.", variant: "destructive"});
            // Optionally rollback state or retry
            loadInitialData(); // Reload to be safe
        } else {
             toast({ title: "Progress Saved", description: "Your flashcard review progress has been saved." });
        }

   }, [allFlashcards, toast, loadInitialData]); // Include dependencies


   // Filter cards for the library view
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
             (c.topic && c.topic.toLowerCase().includes(term)) ||
              (c.tags && c.tags.some(tag => tag.toLowerCase().includes(term))) // Added tag search
           );
       }
       // Sort library view by creation date (newest first)
       return displayCards.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
   }, [allFlashcards, selectedSubject, searchTerm]);


  if (isReviewing) {
     return (
         <div className="container mx-auto px-4 py-8 flex justify-center">
             <FlashcardReviewSession initialCards={dueCards} onSessionComplete={handleSessionComplete} />
         </div>
     );
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 text-center flex items-center justify-center">
        <Layers className="h-8 w-8 mr-2 text-primary" /> Flashcard Library & Review
      </h1>
      <p className="text-muted-foreground mb-6 text-center max-w-2xl mx-auto">
        Review your AI-generated flashcards using spaced repetition or browse your collection. New cards can be auto-created from session transcripts!
      </p>

       <Card className="mb-6 bg-gradient-to-r from-primary/10 via-card to-card border-primary/50 shadow-md">
           <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4">
               <div className="text-center sm:text-left">
                   <CardTitle className="text-xl">Review Due Cards</CardTitle>
                   <CardDescription>{dueCards.length} card{dueCards.length !== 1 ? 's' : ''} ready for review based on spaced repetition.</CardDescription>
               </div>
               <Button onClick={startReviewSession} disabled={dueCards.length === 0 || isLoading} size="lg">
                  <RotateCw className="mr-2 h-5 w-5"/> Start Review ({dueCards.length})
               </Button>
           </CardHeader>
       </Card>

      {/* Library View */}
       <Card className="shadow">
          <CardHeader>
             <CardTitle>Flashcard Library ({filteredDisplayCards.length} / {allFlashcards.length} total)</CardTitle>
             <CardDescription>Browse or search all your saved flashcards.</CardDescription>
             <div className="flex flex-col md:flex-row gap-4 pt-4">
               <div className="relative flex-grow">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                 <Input
                   type="search"
                   placeholder="Search question, answer, topic, #tag..."
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
                  <ScrollArea className="h-[50vh] pr-3">
                      <div className="space-y-3">
                          {filteredDisplayCards.map(card => (
                              <details key={card.id} className="p-3 border rounded-md text-sm bg-card hover:bg-muted/50 transition-colors">
                                  <summary className="cursor-pointer font-medium flex justify-between items-center">
                                     <span className="truncate mr-4">{card.question}</span>
                                      <span className={`text-xs px-2 py-0.5 rounded ${new Date(card.dueDate) <= new Date() ? 'bg-destructive/20 text-destructive-foreground' : 'bg-muted'}`}>
                                         Due: {card.dueDate.toLocaleDateString()}
                                      </span>
                                  </summary>
                                  <div className="mt-3 pt-3 border-t text-xs space-y-1 text-muted-foreground">
                                      <p><span className="font-semibold text-foreground">Answer:</span> {card.answer}</p>
                                      <p><span className="font-semibold">Subject:</span> {card.subject} {card.topic ? `(${card.topic})` : ''}</p>
                                      {card.sourceSessionId && <p><span className="font-semibold">Source:</span> Session {card.sourceSessionId}</p>}
                                      <p><span className="font-semibold">Created:</span> {card.createdAt.toLocaleDateString()}</p>
                                       <p><span className="font-semibold">Last Reviewed:</span> {card.lastReviewed ? card.lastReviewed.toLocaleDateString() : 'Never'}</p>
                                       <p><span className="font-semibold">Interval:</span> {card.intervalDays} days</p>
                                       {/* TODO: Add Edit/Delete buttons here */}
                                  </div>
                              </details>
                          ))}
                      </div>
                   </ScrollArea>
               ) : (
                   <div className="text-center py-10 text-muted-foreground border border-dashed rounded-md">
                      <FileWarning className="h-10 w-10 mx-auto mb-2"/>
                       No flashcards found matching your criteria.
                       { (searchTerm || selectedSubject !== 'all') && <Button variant="link" onClick={() => {setSearchTerm(''); setSelectedSubject('all')}}>Clear Filters</Button>}
                   </div>
               )}
           </CardContent>
       </Card>

       {/* Explanation Card */}
       <Card className="mt-6 border-dashed border-sky-500 bg-sky-50 dark:bg-sky-900/20">
           <CardHeader>
               <CardTitle className="flex items-center text-sky-700 dark:text-sky-300"><Speech className="h-5 w-5 mr-2"/> Speech-to-Flashcards AI</CardTitle>
               <CardDescription className="text-sky-600 dark:text-sky-400">
                   Enable the "Auto-Flashcards" feature in your session settings. During enabled sessions, our AI listens for key concepts explained by you or your tutor. It then automatically generates relevant question/answer flashcards and adds them here for efficient review!
               </CardDescription>
           </CardHeader>
            <CardFooter>
               <Button variant="link" size="sm" className="text-xs" onClick={() => alert("Navigate to settings (not implemented)")}>Manage Settings</Button>
            </CardFooter>
       </Card>

    </div>
  );
}
