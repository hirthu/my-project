'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { HandCoins, Brain, Lightbulb, CheckCircle, Loader2, AlertTriangle, FileBadge, History, Trophy, FileWarning, CalendarX } from 'lucide-react'; // Added icons
import { format, getWeek, getYear, startOfWeek, endOfWeek } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge'; // Import Badge

// Mock User ID
const currentUserId = 'user123';

// --- Interfaces ---
interface WeeklyChallenge {
  weekId: string; // e.g., "2024-W20"
  title: string;
  description: string;
  subject: string;
  deadline: Date;
  points?: number;
  reward?: string;
}

interface ChallengeSubmission {
  userId: string;
  challengeWeekId: string;
  submissionContent: string;
  submittedAt: Date;
  status: 'pending' | 'correct' | 'incorrect'; // More descriptive status
  feedback?: string;
}

// --- Utility Functions ---
const getWeekId = (date: Date = new Date()): string => {
    // Use ISO week date system (Monday as first day, week 1 contains first Thursday)
    const year = getYear(date);
    const week = getWeek(date, { weekStartsOn: 1, firstWeekContainsDate: 4 });
    return `${year}-W${String(week).padStart(2, '0')}`;
}

// --- Mock API Functions ---

// Mock storage for challenges and submissions
const MOCK_CHALLENGES: Record<string, WeeklyChallenge> = {};
const MOCK_SUBMISSIONS: Record<string, ChallengeSubmission[]> = {};

const initializeMockData = () => {
    const now = new Date();
    const currentWeekId = getWeekId(now);
    const prevWeekId = getWeekId(new Date(now.getTime() - 7 * 86400000));
    const nextWeekId = getWeekId(new Date(now.getTime() + 7 * 86400000));

    if (!MOCK_CHALLENGES[currentWeekId]) {
       MOCK_CHALLENGES[currentWeekId] = {
          weekId: currentWeekId,
          title: `Logic Puzzle: The Bridge Crossing`,
          description: 'Four people need to cross a bridge at night with one flashlight. They cross at different speeds (1, 2, 5, 8 minutes). Only two can cross at a time, and they must have the flashlight. What is the minimum time for all four to cross?',
          subject: 'Logic / Optimization',
          deadline: endOfWeek(now, { weekStartsOn: 1 }), // End of this week (Sunday night)
          points: 50,
          reward: 'Logic Master Badge',
       };
    }
     if (!MOCK_CHALLENGES[prevWeekId]) {
        MOCK_CHALLENGES[prevWeekId] = {
           weekId: prevWeekId,
           title: `Physics Riddle: Bird and Trains`,
           description: 'Two trains start 100km apart, heading towards each other at 50km/h. A bird starts at the front of one train, flies to the other at 100km/h, instantly turns back, and repeats until the trains collide. How far does the bird fly in total?',
           subject: 'Physics / Math',
           deadline: endOfWeek(new Date(now.getTime() - 7 * 86400000), { weekStartsOn: 1 }),
           points: 40,
        };
         // Add a mock past submission for the previous week
        if (!MOCK_SUBMISSIONS[currentUserId]) MOCK_SUBMISSIONS[currentUserId] = [];
        if (!MOCK_SUBMISSIONS[currentUserId].find(s => s.challengeWeekId === prevWeekId)) {
            MOCK_SUBMISSIONS[currentUserId].push({
               userId: currentUserId,
               challengeWeekId: prevWeekId,
               submissionContent: "The bird flies for 1 hour, so 100km.",
               submittedAt: new Date(now.getTime() - 5 * 86400000), // Submitted 5 days ago
               status: 'correct', // Mock grading
               feedback: "Correct! The key is the total time until the trains meet."
            });
        }
     }
     // Optional: Add a future challenge placeholder
      // MOCK_CHALLENGES[nextWeekId] = { weekId: nextWeekId, title: "Next Week's Challenge (Preview)", ... };
}

// Fetch current challenge
const fetchCurrentChallenge = async (): Promise<WeeklyChallenge | null> => {
  console.log('Fetching current weekly challenge...');
  await new Promise(resolve => setTimeout(resolve, 500));
  initializeMockData(); // Ensure data exists
  const currentWeekId = getWeekId();
  return MOCK_CHALLENGES[currentWeekId] || null;
};

// Fetch user's submission for a specific challenge
const fetchUserSubmission = async (userId: string, challengeWeekId: string): Promise<ChallengeSubmission | null> => {
    console.log(`Fetching submission for user ${userId}, week ${challengeWeekId}`);
    await new Promise(resolve => setTimeout(resolve, 200));
    initializeMockData();
    const userSubmissions = MOCK_SUBMISSIONS[userId] || [];
    const submission = userSubmissions.find(s => s.challengeWeekId === challengeWeekId);
    return submission ? { ...submission, submittedAt: new Date(submission.submittedAt) } : null; // Ensure date object
}

// Save a submission
const saveChallengeSubmission = async (submissionData: Omit<ChallengeSubmission, 'submittedAt' | 'status' | 'feedback'>): Promise<ChallengeSubmission> => {
  console.log(`Saving submission for user ${submissionData.userId}, week ${submissionData.challengeWeekId}`);
  await new Promise(resolve => setTimeout(resolve, 1000));

   // Mock Auto-Grading (Simple keyword check for demo)
   let status: ChallengeSubmission['status'] = 'pending';
   let feedback: string | undefined = undefined;
   const challenge = MOCK_CHALLENGES[submissionData.challengeWeekId];
   if (challenge?.weekId === getWeekId() && submissionData.submissionContent.includes('17')) { // Mock correct answer check
       status = 'correct';
       feedback = "Great logical thinking!";
   } else if (challenge?.weekId === getWeekId()) {
       status = 'incorrect';
       feedback = "Hmm, review the constraints. Think about who needs to return with the flashlight.";
   }

  const newSubmission: ChallengeSubmission = {
    ...submissionData,
    submittedAt: new Date(),
    status: status,
    feedback: feedback,
  };

  if (!MOCK_SUBMISSIONS[submissionData.userId]) {
    MOCK_SUBMISSIONS[submissionData.userId] = [];
  }
  // Remove previous submission for the same week if exists, then add new one
  const updatedSubmissions = MOCK_SUBMISSIONS[submissionData.userId].filter(s => s.challengeWeekId !== newSubmission.challengeWeekId);
  updatedSubmissions.push(newSubmission);
  MOCK_SUBMISSIONS[submissionData.userId] = updatedSubmissions;

  // Mock persistence (e.g., save MOCK_SUBMISSIONS back to localStorage if needed for multi-session demo)
  // localStorage.setItem('mockSubmissions', JSON.stringify(MOCK_SUBMISSIONS));

  return newSubmission;
};

// Fetch past challenges and user's results for them
const fetchPastChallengesWithSubmissions = async (userId: string): Promise<Array<WeeklyChallenge & { submission?: ChallengeSubmission }>> => {
    console.log(`Fetching past challenges for user ${userId}`);
    await new Promise(resolve => setTimeout(resolve, 900));
    initializeMockData();

    const currentWeekId = getWeekId();
    const userSubmissions = MOCK_SUBMISSIONS[userId] || [];
    const pastData: Array<WeeklyChallenge & { submission?: ChallengeSubmission }> = [];

    Object.values(MOCK_CHALLENGES)
      .filter(c => c.weekId < currentWeekId) // Filter out current and future weeks
      .sort((a, b) => b.weekId.localeCompare(a.weekId)) // Sort newest past week first
      .forEach(challenge => {
         const submission = userSubmissions.find(s => s.challengeWeekId === challenge.weekId);
         pastData.push({
            ...challenge,
             deadline: new Date(challenge.deadline), // Ensure date object
             submission: submission ? { ...submission, submittedAt: new Date(submission.submittedAt) } : undefined,
         });
      });

    return pastData;
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

  const loadCurrentChallengeData = useCallback(async () => {
    setIsLoadingCurrent(true);
    try {
      const challenge = await fetchCurrentChallenge();
      setCurrentChallenge(challenge ? { ...challenge, deadline: new Date(challenge.deadline) } : null);
      if (challenge) {
        const submission = await fetchUserSubmission(currentUserId, challenge.weekId);
        setUserSubmission(submission);
        if (submission) setSubmissionContent(submission.submissionContent);
      } else {
        setUserSubmission(null);
      }
    } catch (error) {
      console.error("Failed to load current challenge:", error);
      toast({ title: "Loading Error", description: "Could not fetch the current challenge.", variant: "destructive" });
    } finally {
      setIsLoadingCurrent(false);
    }
  }, [toast]);

  const loadPastData = useCallback(async () => {
    setIsLoadingPast(true);
    try {
      const past = await fetchPastChallengesWithSubmissions(currentUserId);
      setPastChallenges(past);
    } catch (error) {
      console.error("Failed to load past challenges:", error);
       toast({ title: "Loading Error", description: "Could not fetch past challenges.", variant: "destructive" });
    } finally {
      setIsLoadingPast(false);
    }
  }, [toast]);

  useEffect(() => {
    loadCurrentChallengeData();
    loadPastData();
  }, [loadCurrentChallengeData, loadPastData]);

  const handleSubmit = async () => {
    if (!currentChallenge || !submissionContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const submissionData = {
        userId: currentUserId,
        challengeWeekId: currentChallenge.weekId,
        submissionContent: submissionContent.trim(),
      };
      const savedSubmission = await saveChallengeSubmission(submissionData);
      setUserSubmission(savedSubmission);
      toast({ title: 'Submission Received!', description: `Status: ${savedSubmission.status}` });
      // Refresh past challenges list to include this new submission immediately
      loadPastData();
    } catch (error) {
      console.error("Submission failed:", error);
      toast({ title: 'Submission Error', description: 'Could not submit your solution. Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

   const isDeadlinePassed = currentChallenge && currentChallenge.deadline < new Date();
   // Allow submitting/editing if challenge exists, deadline hasn't passed, and status isn't 'correct'
   const canSubmitOrEdit = currentChallenge && !isDeadlinePassed && userSubmission?.status !== 'correct';

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 text-center flex items-center justify-center">
        <HandCoins className="h-8 w-8 mr-2 text-primary" /> Weekly Brain Boost
      </h1>
      <p className="text-muted-foreground mb-8 text-center max-w-2xl mx-auto">
        Test your skills with our weekly puzzle! Submit your solution for points and recognition.
      </p>

      {/* Current Week's Challenge */}
      <Card className="mb-8 shadow-lg border-primary/50">
        <CardHeader>
          {isLoadingCurrent ? (
             <div className="flex items-center space-x-2 h-32 justify-center">
               <Loader2 className="h-6 w-6 animate-spin text-primary"/>
               <span className="text-muted-foreground">Loading challenge...</span>
             </div>
          ) : currentChallenge ? (
            <>
              <CardTitle className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                 <span className="text-xl">{currentChallenge.title} <Badge variant="outline" className="ml-2 align-middle">{currentChallenge.subject}</Badge></span>
                 {currentChallenge.points && <span className="text-lg font-bold text-primary mt-1 sm:mt-0">{currentChallenge.points} pts</span>}
              </CardTitle>
              <CardDescription className="whitespace-pre-wrap pt-3">{currentChallenge.description}</CardDescription>
              <div className="text-xs mt-3 flex flex-wrap gap-x-4 gap-y-1 items-center">
                 <p className={`font-medium ${isDeadlinePassed ? 'text-destructive' : 'text-muted-foreground'}`}>
                     Deadline: {format(currentChallenge.deadline, 'PPP p')} {isDeadlinePassed ? '(Passed)' : ''}
                 </p>
                 {currentChallenge.reward && <p className="text-amber-600 flex items-center"><Trophy className="h-3 w-3 mr-1"/> Reward: {currentChallenge.reward}</p>}
              </div>
            </>
          ) : (
             <div className="text-center py-8 text-muted-foreground">
                <CalendarX className="h-10 w-10 mx-auto mb-2"/>
                <p className="font-semibold">No active challenge this week.</p>
                <p className="text-sm">Check back soon!</p>
            </div>
          )}
        </CardHeader>

        {currentChallenge && (
            <CardContent>
              {userSubmission ? (
                 <div className="space-y-3 p-4 bg-muted/70 rounded-md border">
                    <div className="flex justify-between items-center">
                       <h4 className="font-semibold text-sm flex items-center">Your Submission</h4>
                        <Badge variant={
                            userSubmission.status === 'correct' ? 'default' :
                            userSubmission.status === 'incorrect' ? 'destructive' : 'secondary'
                           } className="capitalize">
                           {userSubmission.status === 'correct' && <CheckCircle className="h-3 w-3 mr-1"/>}
                           {userSubmission.status === 'incorrect' && <AlertTriangle className="h-3 w-3 mr-1"/>}
                            {userSubmission.status}
                        </Badge>
                    </div>
                     <pre className="text-sm whitespace-pre-wrap font-mono bg-background p-3 rounded border">{userSubmission.submissionContent}</pre>
                     <p className="text-xs text-muted-foreground">Submitted: {format(userSubmission.submittedAt, 'PP p')}</p>

                      {userSubmission.feedback && (
                         <div className="text-xs border-t pt-3 mt-3">
                            <p className="font-medium text-card-foreground mb-1">Feedback:</p>
                            <p className="text-muted-foreground">{userSubmission.feedback}</p>
                         </div>
                      )}
                       {/* Allow edit only if deadline hasn't passed AND wasn't marked correct */}
                       {canSubmitOrEdit && (
                           <Button variant="outline" size="sm" onClick={() => { setUserSubmission(null); /* Keep content in textarea */ }} className="mt-3">
                               <Edit className="h-3 w-3 mr-1"/> Edit Submission
                           </Button>
                       )}
                 </div>
              ) : isDeadlinePassed ? (
                   <div className="text-center text-destructive p-4 bg-destructive/10 rounded-md border border-destructive/30">
                       The deadline for this challenge has passed.
                   </div>
              ) : (
                 <div className="space-y-2">
                    <Label htmlFor="submission">Your Solution:</Label>
                    <Textarea
                       id="submission"
                       value={submissionContent}
                       onChange={(e) => setSubmissionContent(e.target.value)}
                       placeholder="Type your solution here..."
                       rows={5}
                       disabled={isSubmitting}
                       aria-describedby="submission-help"
                    />
                     <p id="submission-help" className="text-xs text-muted-foreground">Explain your reasoning clearly.</p>
                    <Button onClick={handleSubmit} disabled={isSubmitting || !submissionContent.trim()} className="w-full">
                       {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Submitting...</> : <><Lightbulb className="mr-2 h-4 w-4"/> Submit Solution</>}
                    </Button>
                 </div>
              )}
            </CardContent>
        )}
      </Card>

      {/* Past Challenges & Submissions */}
       <Card className="mt-8">
           <CardHeader>
               <CardTitle className="flex items-center"><History className="h-5 w-5 mr-2"/> Challenge History</CardTitle>
               <CardDescription>Review past challenges and your performance.</CardDescription>
           </CardHeader>
           <CardContent>
               {isLoadingPast ? (
                   <div className="text-center py-6"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground"/></div>
               ) : pastChallenges.length > 0 ? (
                   <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                       {pastChallenges.map(pc => (
                           <details key={pc.weekId} className="p-3 border rounded-md text-sm group open:bg-muted/30 transition-colors">
                               <summary className="cursor-pointer font-medium flex justify-between items-center list-none group-hover:text-primary">
                                   <span className="flex-1 mr-4">{pc.title} <span className="text-xs text-muted-foreground">({pc.weekId})</span></span>
                                   {pc.submission ? (
                                       <Badge variant={pc.submission.status === 'correct' ? 'default' : pc.submission.status === 'incorrect' ? 'destructive' : 'secondary'} className="capitalize shrink-0">
                                          {pc.submission.status === 'correct' && <CheckCircle className="h-3 w-3 mr-1"/>}
                                          {pc.submission.status === 'incorrect' && <AlertTriangle className="h-3 w-3 mr-1"/>}
                                          {pc.submission.status}
                                       </Badge>
                                   ) : (
                                       <Badge variant="outline" className="shrink-0">Not Submitted</Badge>
                                   )}
                               </summary>
                               <div className="mt-3 pt-3 border-t text-xs space-y-2">
                                   <p><span className="font-semibold">Description:</span> {pc.description}</p>
                                   <p><span className="font-semibold">Subject:</span> {pc.subject}</p>
                                    <p><span className="font-semibold">Deadline:</span> {format(pc.deadline, 'PP')}</p>
                                    {pc.submission ? (
                                       <div className="mt-2 pt-2 border-t border-dashed">
                                           <p><span className="font-semibold">Your Submission ({format(pc.submission.submittedAt, 'PP p')}):</span></p>
                                           <pre className="whitespace-pre-wrap font-mono bg-background p-1.5 rounded text-[11px] mt-1 border">{pc.submission.submissionContent}</pre>
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
                    <div className="text-center py-10 text-muted-foreground border border-dashed rounded-md">
                       <FileWarning className="h-10 w-10 mx-auto mb-2"/>
                       <p>No past challenge history found.</p>
                   </div>
               )}
           </CardContent>
       </Card>

    </div>
  );
}
