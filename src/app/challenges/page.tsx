'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { HandCoins, Brain, Lightbulb, CheckCircle, Loader2, AlertTriangle, FileBadge, History, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

// Mock Challenge Interface
interface WeeklyChallenge {
  weekNumber: number; // e.g., 202420 (Year + Week)
  title: string;
  description: string;
  subject: string;
  deadline: Date;
  // Optional: points, reward description, link to related material
  points?: number;
  reward?: string;
}

// Mock Submission Interface
interface ChallengeSubmission {
  userId: string;
  challengeWeek: number;
  submissionContent: string;
  submittedAt: Date;
  isCorrect?: boolean; // Optional: For auto-grading or tutor review status
  feedback?: string; // Optional: Feedback if reviewed
}

// Mock User ID
const currentUserId = 'user123';

// Mock function to get the current week's challenge - replace with Firestore query
const fetchCurrentChallenge = async (): Promise<WeeklyChallenge | null> => {
  console.log('Fetching current weekly challenge...');
  await new Promise(resolve => setTimeout(resolve, 800));

  // Simulate finding the challenge for the current week
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
  const currentWeek = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  const currentWeekNumber = parseInt(`${now.getFullYear()}${String(currentWeek).padStart(2, '0')}`);

   // Mock challenge data
   const challenges: Record<number, WeeklyChallenge> = {
      [currentWeekNumber]: {
          weekNumber: currentWeekNumber,
          title: `Week ${currentWeek}: The Physics Riddle`,
          description: 'A train leaves Station A at 60 mph. An hour later, a bird starts flying from Station B towards Station A at 100 mph. The stations are 500 miles apart. When the bird meets the train, it instantly turns back towards Station B. When it reaches Station B, it turns back towards the train, and so on. How far does the bird travel in total before the train reaches Station B?',
          subject: 'Physics / Logic',
          deadline: new Date(now.getTime() + 7 * 86400000), // 7 days from now
          points: 50,
          reward: 'Brainiac Badge',
      },
       [currentWeekNumber - 1]: { // Previous week example
            weekNumber: currentWeekNumber - 1,
            title: `Week ${currentWeek-1}: Algebra Puzzle`,
            description: 'Solve for x: 3^(2x+1) = 27^(x-1)',
            subject: 'Mathematics',
            deadline: new Date(now.getTime() - 86400000), // Expired
            points: 30,
       }
   };

  return challenges[currentWeekNumber] || null;
};

// Mock function to get user's past submission for a challenge - replace with Firestore query
const fetchUserSubmission = async (userId: string, challengeWeek: number): Promise<ChallengeSubmission | null> => {
    console.log(`Fetching submission for user ${userId}, week ${challengeWeek}`);
    await new Promise(resolve => setTimeout(resolve, 400));
     try {
        const storedSubmissions = localStorage.getItem(`tutorverseSubmissions_${userId}`);
        if (storedSubmissions) {
            const submissions = JSON.parse(storedSubmissions) as ChallengeSubmission[];
            const submission = submissions.find(s => s.challengeWeek === challengeWeek);
             if (submission) {
                 return { ...submission, submittedAt: new Date(submission.submittedAt) };
             }
        }
     } catch (error) { console.error("Error reading submissions:", error); }
    return null;
}

// Mock function to save a submission - replace with Firestore write
const saveChallengeSubmission = async (submission: Omit<ChallengeSubmission, 'submittedAt' | 'isCorrect' | 'feedback'>): Promise<ChallengeSubmission> => {
  console.log(`Saving submission for user ${submission.userId}, week ${submission.challengeWeek}`);
  await new Promise(resolve => setTimeout(resolve, 1000));

  const newSubmission: ChallengeSubmission = {
    ...submission,
    submittedAt: new Date(),
     // In a real app, grading might happen later via Cloud Function or tutor review
     isCorrect: Math.random() > 0.5, // Mock auto-grade (50% chance)
     feedback: Math.random() > 0.5 ? "Good effort! Consider the relative speed." : undefined,
  };

   try {
        const storedSubmissions = localStorage.getItem(`tutorverseSubmissions_${submission.userId}`);
        const submissions = storedSubmissions ? JSON.parse(storedSubmissions) as ChallengeSubmission[] : [];
        // Remove previous submission for the same week if exists
        const updatedSubmissions = submissions.filter(s => s.challengeWeek !== newSubmission.challengeWeek);
        updatedSubmissions.push(newSubmission);
        localStorage.setItem(`tutorverseSubmissions_${submission.userId}`, JSON.stringify(updatedSubmissions));
   } catch (error) { console.error("Error saving submission:", error); }


  return newSubmission;
};

// Mock function to fetch past challenges/results - replace with Firestore query
const fetchPastChallenges = async (userId: string): Promise<Array<WeeklyChallenge & { submission?: ChallengeSubmission }>> => {
    console.log(`Fetching past challenges for user ${userId}`);
    await new Promise(resolve => setTimeout(resolve, 900));
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
    const currentWeek = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    const currentWeekNumber = parseInt(`${now.getFullYear()}${String(currentWeek).padStart(2, '0')}`);

     const pastChallengeData: Array<WeeklyChallenge & { submission?: ChallengeSubmission }> = [];
     try {
        const storedSubmissions = localStorage.getItem(`tutorverseSubmissions_${userId}`);
        const submissions = storedSubmissions ? (JSON.parse(storedSubmissions) as ChallengeSubmission[]).map(s => ({...s, submittedAt: new Date(s.submittedAt)})) : [];

         // Mock previous challenges
         for (let i = 1; i < 5; i++) { // Show last 4 weeks (example)
            const weekNum = currentWeekNumber - i;
            if (weekNum < parseInt(`${now.getFullYear()}01`)) break; // Stop if we go before week 1

             const mockPastChallenge: WeeklyChallenge = {
                 weekNumber: weekNum,
                 title: `Week ${currentWeek - i}: Past Challenge ${i}`,
                 description: `Description for past challenge ${i}.`,
                 subject: i % 2 === 0 ? 'Mathematics' : 'Science',
                 deadline: new Date(now.getTime() - i * 7 * 86400000),
                 points: 20 + i * 5,
             };
             const userSubmission = submissions.find(s => s.challengeWeek === weekNum);
             pastChallengeData.push({ ...mockPastChallenge, submission: userSubmission });
         }

     } catch (error) { console.error("Error fetching past data:", error); }

    return pastChallengeData.sort((a, b) => b.weekNumber - a.weekNumber); // Newest first
}

// --- Component ---
export default function WeeklyChallengePage() {
  const [currentChallenge, setCurrentChallenge] = useState<WeeklyChallenge | null>(null);
  const [userSubmission, setUserSubmission] = useState<ChallengeSubmission | null>(null);
  const [pastChallenges, setPastChallenges] = useState<Array<WeeklyChallenge & { submission?: ChallengeSubmission }>>([]);
  const [submissionContent, setSubmissionContent] = useState('');
  const [isLoadingCurrent, setIsLoadingCurrent] = useState(true);
  const [isLoadingPast, setIsLoadingPast] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadCurrent = async () => {
      setIsLoadingCurrent(true);
      try {
        const challenge = await fetchCurrentChallenge();
        setCurrentChallenge(challenge);
        if (challenge) {
          const submission = await fetchUserSubmission(currentUserId, challenge.weekNumber);
          setUserSubmission(submission);
           if (submission) setSubmissionContent(submission.submissionContent); // Load existing submission content
        } else {
            setUserSubmission(null); // No current challenge, no submission possible
        }
      } catch (error) {
        console.error("Failed to load current challenge:", error);
      } finally {
        setIsLoadingCurrent(false);
      }
    };

     const loadPast = async () => {
         setIsLoadingPast(true);
         try {
             const past = await fetchPastChallenges(currentUserId);
             setPastChallenges(past);
         } catch (error) {
             console.error("Failed to load past challenges:", error);
         } finally {
             setIsLoadingPast(false);
         }
     };

    loadCurrent();
     loadPast();
  }, []);

  const handleSubmit = async () => {
    if (!currentChallenge || !submissionContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const submissionData = {
        userId: currentUserId,
        challengeWeek: currentChallenge.weekNumber,
        submissionContent: submissionContent.trim(),
      };
      const savedSubmission = await saveChallengeSubmission(submissionData);
      setUserSubmission(savedSubmission); // Update state with the saved submission (including feedback/grade if any)
      toast({ title: 'Submission Received!', description: 'Your solution has been submitted.' });
      // Optionally, refresh past challenges if this affects badges etc.
       // loadPast();
    } catch (error) {
      console.error("Submission failed:", error);
      toast({ title: 'Submission Error', description: 'Could not submit your solution. Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

   const isDeadlinePassed = currentChallenge && currentChallenge.deadline < new Date();
   const canSubmit = currentChallenge && !isDeadlinePassed && !userSubmission;


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 text-center flex items-center justify-center">
        <HandCoins className="h-8 w-8 mr-2 text-primary" /> Weekly Brain Boost Challenge
      </h1>
      <p className="text-muted-foreground mb-8 text-center max-w-2xl mx-auto">
        Test your skills with our weekly puzzle! Submit your solution for points and recognition.
      </p>

      {/* Current Week's Challenge */}
      <Card className="mb-8 shadow-lg border-primary">
        <CardHeader>
          {isLoadingCurrent ? (
             <div className="flex items-center space-x-2">
               <Loader2 className="h-5 w-5 animate-spin"/>
               <span>Loading current challenge...</span>
             </div>
          ) : currentChallenge ? (
            <>
              <CardTitle className="flex justify-between items-start">
                 <span>{currentChallenge.title} <span className="text-sm font-normal text-muted-foreground">({currentChallenge.subject})</span></span>
                 {currentChallenge.points && <span className="text-lg font-bold text-primary">{currentChallenge.points} pts</span>}
              </CardTitle>
              <CardDescription className="whitespace-pre-wrap pt-2">{currentChallenge.description}</CardDescription>
              <p className={`text-xs mt-2 ${isDeadlinePassed ? 'text-destructive' : 'text-muted-foreground'}`}>
                 Deadline: {format(currentChallenge.deadline, 'PPP p')} {isDeadlinePassed ? '(Passed)' : ''}
              </p>
               {currentChallenge.reward && <p className="text-xs text-amber-600 flex items-center"><Trophy className="h-3 w-3 mr-1"/> Reward: {currentChallenge.reward}</p>}
            </>
          ) : (
            <CardTitle className="text-center text-muted-foreground py-4">No active challenge this week. Check back soon!</CardTitle>
          )}
        </CardHeader>

        {currentChallenge && (
            <CardContent>
              {userSubmission ? (
                 <div className="space-y-3 p-4 bg-muted rounded-md border">
                    <h4 className="font-semibold text-sm flex items-center">Your Submission ({format(userSubmission.submittedAt, 'PP p')}):</h4>
                     <pre className="text-sm whitespace-pre-wrap font-mono bg-background p-2 rounded border">{userSubmission.submissionContent}</pre>
                     {userSubmission.isCorrect === true && (
                         <p className="text-sm font-semibold text-green-600 flex items-center"><CheckCircle className="h-4 w-4 mr-1"/> Correct!</p>
                     )}
                      {userSubmission.isCorrect === false && (
                         <p className="text-sm font-semibold text-destructive flex items-center"><AlertTriangle className="h-4 w-4 mr-1"/> Incorrect</p>
                     )}
                      {userSubmission.feedback && (
                         <div className="text-xs border-t pt-2 mt-2">
                            <p className="font-medium text-muted-foreground mb-1">Feedback:</p>
                            <p>{userSubmission.feedback}</p>
                         </div>
                      )}
                       {/* Allow resubmit only if deadline hasn't passed AND wasn't marked correct? */}
                       {!isDeadlinePassed && userSubmission.isCorrect !== true && (
                           <Button variant="outline" size="sm" onClick={() => { setUserSubmission(null); setSubmissionContent(userSubmission.submissionContent); }} className="mt-2">
                               Edit Submission
                           </Button>
                       )}
                 </div>
              ) : isDeadlinePassed ? (
                   <div className="text-center text-muted-foreground p-4 bg-muted/50 rounded-md border border-dashed">
                       The deadline for this challenge has passed.
                   </div>
              ) : (
                 <div className="space-y-2">
                    <Textarea
                       value={submissionContent}
                       onChange={(e) => setSubmissionContent(e.target.value)}
                       placeholder="Type your solution here..."
                       rows={5}
                       disabled={isSubmitting}
                    />
                    <Button onClick={handleSubmit} disabled={isSubmitting || !submissionContent.trim()} className="w-full">
                       {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Submitting...</> : <><Lightbulb className="mr-2 h-4 w-4"/> Submit Solution</>}
                    </Button>
                 </div>
              )}
            </CardContent>
        )}
      </Card>

      {/* Past Challenges & Submissions */}
       <Card>
           <CardHeader>
               <CardTitle className="flex items-center"><History className="h-5 w-5 mr-2"/> Past Challenges</CardTitle>
               <CardDescription>Review your previous challenge attempts.</CardDescription>
           </CardHeader>
           <CardContent>
               {isLoadingPast ? (
                   <div className="text-center py-6"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground"/></div>
               ) : pastChallenges.length > 0 ? (
                   <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                       {pastChallenges.map(pc => (
                           <details key={pc.weekNumber} className="p-3 border rounded-md text-sm">
                               <summary className="cursor-pointer font-medium flex justify-between items-center">
                                   <span>{pc.title}</span>
                                   {pc.submission ? (
                                       pc.submission.isCorrect ? <CheckCircle className="h-4 w-4 text-green-500"/> : <AlertTriangle className="h-4 w-4 text-destructive"/>
                                   ) : (
                                       <span className="text-xs text-muted-foreground">Not Submitted</span>
                                   )}
                               </summary>
                               <div className="mt-3 pt-3 border-t text-xs space-y-2">
                                   <p><span className="font-semibold">Description:</span> {pc.description}</p>
                                   <p><span className="font-semibold">Subject:</span> {pc.subject}</p>
                                    <p><span className="font-semibold">Deadline:</span> {format(pc.deadline, 'PP')}</p>
                                    {pc.submission ? (
                                       <div className="mt-2 pt-2 border-t border-dashed">
                                           <p><span className="font-semibold">Your Submission ({format(pc.submission.submittedAt, 'PP p')}):</span></p>
                                           <pre className="whitespace-pre-wrap font-mono bg-muted p-1.5 rounded text-[11px] mt-1">{pc.submission.submissionContent}</pre>
                                            {pc.submission.feedback && <p className="mt-1"><span className="font-semibold">Feedback:</span> {pc.submission.feedback}</p>}
                                       </div>
                                    ) : (
                                        <p className="mt-2 text-muted-foreground italic">You did not submit a solution for this challenge.</p>
                                    )}
                               </div>
                           </details>
                       ))}
                   </div>
               ) : (
                   <p className="text-center text-muted-foreground py-6">No past challenge data found.</p>
               )}
           </CardContent>
       </Card>

    </div>
  );
}
