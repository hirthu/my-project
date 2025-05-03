'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input'; // Import Input
import { Users2, Lightbulb, MessageSquare, CheckSquare, Loader2, Send, ThumbsUp, ThumbsDown, UserCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast'; // Import useToast

// Mock Data Interfaces
interface Problem {
  id: string;
  title: string;
  description: string;
  subject: string;
}

interface CollabMessage {
  id: string;
  userId: string; // Anonymous ID for the session, e.g., "User_abc"
  text: string;
  timestamp: number;
}

interface ProposedSolution {
    id: string;
    userId: string; // Anonymous ID
    text: string;
    upvotes: string[]; // List of anonymous user IDs who upvoted
    downvotes: string[]; // List of anonymous user IDs who downvoted
    timestamp: number;
}

// Mock User ID (Assign a temporary anonymous ID for the session)
// Ensure this runs only client-side
const [anonymousUserId, setAnonymousUserId] = useState('');
useEffect(() => {
  setAnonymousUserId(`User_${Math.random().toString(36).substring(2, 7)}`);
}, []);


// --- Mock Realtime Simulation ---
// Replace with actual Firebase Realtime Database or Firestore listeners/updates

let mockMessages: CollabMessage[] = [
    {id: 'msg1', userId: 'User_abc', text: 'Okay, let\'s analyze the system. Equation 1: 2x + 3y = 7. Equation 2: 5x - 2y = 8.', timestamp: Date.now() - 60000},
    {id: 'msg2', userId: 'User_def', text: 'I think elimination might be easiest. Multiply Eq1 by 2 and Eq2 by 3?', timestamp: Date.now() - 50000},
     {id: 'msg3', userId: 'User_xyz', text: 'That gives: 4x + 6y = 14 and 15x - 6y = 24. Adding them...', timestamp: Date.now() - 40000},
];
let mockSolutions: ProposedSolution[] = [
    {id: 'sol1', userId: 'User_ghi', text: 'Final Answer: x = 2, y = 1', timestamp: Date.now() - 20000, upvotes: ['User_abc', 'User_xyz'], downvotes: ['User_jkl']},
];

// Use refs to hold the mock data arrays so updates inside intervals/timeouts are reflected
const messagesRef = useRef<CollabMessage[]>(mockMessages);
const solutionsRef = useRef<ProposedSolution[]>(mockSolutions);

// Simulate fetching initial state
const fetchInitialState = async (): Promise<{ messages: CollabMessage[], solutions: ProposedSolution[] }> => {
  console.log("Fetching initial collab state...");
  await new Promise(resolve => setTimeout(resolve, 500));
  return { messages: messagesRef.current, solutions: solutionsRef.current };
};

// Simulate subscribing to new events (messages, solutions, votes)
// The callback should receive the updated full state or specific event type+data
const subscribeToUpdates = (callback: (type: 'message' | 'solution' | 'vote', data: any) => void): (() => void) => {
  console.log("Subscribing to updates...");
  const intervalId = setInterval(() => {
    // Simulate another user sending a message occasionally
    if (Math.random() < 0.15) { // Increased chance for demo
        const newMessage: CollabMessage = {
            id: `msg${Date.now()}`,
            userId: `User_${Math.random().toString(36).substring(2, 7)}`,
            text: `Maybe try substituting y = (7-2x)/3 into the second equation? Seems messier though.`,
            timestamp: Date.now(),
        };
        messagesRef.current = [...messagesRef.current, newMessage];
        callback('message', newMessage);
    }
    // Simulate another user proposing a solution occasionally
    if (Math.random() < 0.05) {
        const newSolution: ProposedSolution = {
             id: `sol${Date.now()}`,
             userId: `User_${Math.random().toString(36).substring(2, 7)}`,
             text: `Alternative check: If x=2, 5(2) - 2y = 8 => 10 - 2y = 8 => -2y = -2 => y=1. Matches.`,
             timestamp: Date.now(), upvotes: [], downvotes: []
        };
        solutionsRef.current = [...solutionsRef.current, newSolution];
        callback('solution', newSolution);
    }
    // Simulate another user voting occasionally
     if (Math.random() < 0.1 && solutionsRef.current.length > 0) {
         const randomSolution = solutionsRef.current[Math.floor(Math.random() * solutionsRef.current.length)];
         const votingUser = `User_${Math.random().toString(36).substring(2, 7)}`;
         const voteType = Math.random() > 0.3 ? 'up' : 'down'; // More likely to upvote

         // Simulate the vote update locally (as the voteOnSolution function would)
          const solutionIndex = solutionsRef.current.findIndex(s => s.id === randomSolution.id);
          if (solutionIndex > -1 && randomSolution.userId !== votingUser && !randomSolution.upvotes.includes(votingUser) && !randomSolution.downvotes.includes(votingUser)) {
              const solution = { ...solutionsRef.current[solutionIndex] }; // Copy
              solution.upvotes = solution.upvotes.filter(id => id !== votingUser);
              solution.downvotes = solution.downvotes.filter(id => id !== votingUser);
              if (voteType === 'up') solution.upvotes.push(votingUser);
              else solution.downvotes.push(votingUser);
              solutionsRef.current = [...solutionsRef.current];
              solutionsRef.current[solutionIndex] = solution;
               callback('vote', { solutionId: randomSolution.id, userId: votingUser, voteType }); // Notify about the vote event
          }
     }

  }, 4000); // Check every 4 seconds

  return () => {
      console.log("Unsubscribing from updates.");
      clearInterval(intervalId);
  };
};

// Simulate sending a message
const sendMessage = async (message: Omit<CollabMessage, 'id' | 'timestamp'>): Promise<CollabMessage> => {
  console.log("Sending message:", message);
  await new Promise(resolve => setTimeout(resolve, 200));
  const newMessage: CollabMessage = { ...message, id: `msg${Date.now()}`, timestamp: Date.now() };
   messagesRef.current = [...messagesRef.current, newMessage];
   // In a real app, this pushes to DB, listener updates state. We return the new message for immediate UI update.
   return newMessage;
};

// Simulate proposing a solution
const proposeSolution = async (solution: Omit<ProposedSolution, 'id' | 'timestamp' | 'upvotes' | 'downvotes'>): Promise<ProposedSolution> => {
   console.log("Proposing solution:", solution);
   await new Promise(resolve => setTimeout(resolve, 300));
   const newSolution: ProposedSolution = { ...solution, id: `sol${Date.now()}`, timestamp: Date.now(), upvotes: [], downvotes: [] };
    solutionsRef.current = [...solutionsRef.current, newSolution];
    // Return new solution for immediate UI update.
    return newSolution;
};

// Simulate voting on a solution
const voteOnSolution = async (solutionId: string, userId: string, voteType: 'up' | 'down'): Promise<boolean> => {
    console.log(`Voting ${voteType} on solution ${solutionId} by ${userId}`);
    await new Promise(resolve => setTimeout(resolve, 150));
     const solutionIndex = solutionsRef.current.findIndex(s => s.id === solutionId);
     if (solutionIndex > -1) {
         const solution = { ...solutionsRef.current[solutionIndex] }; // Copy

         // Allow changing vote, but not multiple votes
         const alreadyUpvoted = solution.upvotes.includes(userId);
         const alreadyDownvoted = solution.downvotes.includes(userId);

          // Remove existing vote from user if any
         solution.upvotes = solution.upvotes.filter(id => id !== userId);
         solution.downvotes = solution.downvotes.filter(id => id !== userId);

          // Add new vote only if it's different from the previous state (or no previous vote)
         if (voteType === 'up' && !alreadyUpvoted) solution.upvotes.push(userId);
         else if (voteType === 'down' && !alreadyDownvoted) solution.downvotes.push(userId);
         // If voteType matches alreadyVoted status, it effectively removes the vote.

          solutionsRef.current = [...solutionsRef.current]; // New array instance might be needed for some state management libraries
          solutionsRef.current[solutionIndex] = solution;

         // In real app, this would update the DB, listener handles UI. Return success.
         return true;
     }
     return false; // Solution not found
}

// --- Problem Data ---
const mockProblem: Problem = {
  id: 'prob_complex_eqn',
  title: 'System of Equations Challenge',
  description: 'Solve the following system of equations for x and y:\n1) 2x + 3y = 7\n2) 5x - 2y = 8\nShow your steps and propose a final solution. Discuss different methods (substitution, elimination, matrices?).',
  subject: 'Mathematics (Algebra)',
};

// --- Component ---
export default function CollaborativeProblemSolvingPage() {
  const [problem] = useState<Problem | null>(mockProblem);
  const [messages, setMessages] = useState<CollabMessage[]>([]);
  const [solutions, setSolutions] = useState<ProposedSolution[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [newSolution, setNewSolution] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
   const [isProposing, setIsProposing] = useState(false);
   const messageEndRef = useRef<HTMLDivElement>(null);
   const { toast } = useToast();

    // Effect for initial load and subscribing to updates
    useEffect(() => {
        if (!anonymousUserId) return; // Don't run until anonymousUserId is set

        fetchInitialState().then(state => {
            setMessages(state.messages);
            setSolutions(state.solutions);
            setIsLoading(false);
            scrollToBottom();
        });

        const unsubscribe = subscribeToUpdates((type, data) => {
             console.log("Update received:", type, data);
             if (type === 'message') {
                setMessages(prev => [...prev, data]);
             } else if (type === 'solution') {
                setSolutions(prev => [...prev, data].sort((a, b) => (b.upvotes.length - b.downvotes.length) - (a.upvotes.length - a.downvotes.length))); // Add and re-sort
             } else if (type === 'vote') {
                 // Find the solution and update its votes
                 setSolutions(prev => {
                     const updatedSolutions = prev.map(sol => {
                        if (sol.id === data.solutionId) {
                             const newSol = { ...sol };
                             // Recalculate votes based on the simulation's current state in solutionsRef
                             const latestSolutionState = solutionsRef.current.find(s => s.id === data.solutionId);
                             if (latestSolutionState) {
                                 newSol.upvotes = latestSolutionState.upvotes;
                                 newSol.downvotes = latestSolutionState.downvotes;
                             }
                             return newSol;
                         }
                         return sol;
                     });
                      // Re-sort based on new vote counts
                     return updatedSolutions.sort((a, b) => (b.upvotes.length - b.downvotes.length) - (a.upvotes.length - a.downvotes.length));
                 });
             }
        });

        return () => unsubscribe(); // Cleanup subscription on unmount

    }, [anonymousUserId]); // Rerun if anonymousUserId changes (should only happen once)

    // Effect to scroll chat down on new messages
    useEffect(() => {
       scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
       messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    const handleSendMessage = async () => {
        if (!newMessage.trim() || isSending || !anonymousUserId) return;
        setIsSending(true);
        try {
            const sentMessage = await sendMessage({ userId: anonymousUserId, text: newMessage.trim() });
            // Optimistically update UI, though listener should also catch it
            setMessages(prev => [...prev, sentMessage]);
            setNewMessage('');
        } catch (error) {
             console.error("Send message failed:", error);
             toast({ title: "Error", description: "Could not send message.", variant: "destructive"});
        }
        finally { setIsSending(false); }
    };

    const handleProposeSolution = async () => {
        if (!newSolution.trim() || isProposing || !anonymousUserId) return;
        setIsProposing(true);
         try {
             const proposedSolution = await proposeSolution({ userId: anonymousUserId, text: newSolution.trim() });
              // Optimistically update UI
              setSolutions(prev => [...prev, proposedSolution].sort((a, b) => (b.upvotes.length - b.downvotes.length) - (a.upvotes.length - a.downvotes.length)));
             setNewSolution('');
              toast({ title: "Solution Proposed!", description: "Others can now vote on your solution." });
         } catch (error) {
              console.error("Propose solution failed:", error);
              toast({ title: "Error", description: "Could not propose solution.", variant: "destructive"});
         }
         finally { setIsProposing(false); }
    }

     const handleVote = async (solutionId: string, voteType: 'up' | 'down') => {
          if (!anonymousUserId) return;

         // Find the current state of the solution in the UI
          const solution = solutions.find(s => s.id === solutionId);
          if (!solution) return;

           // Disable voting on own solution
          if (solution.userId === anonymousUserId) {
              toast({ title: "Cannot Vote", description: "You cannot vote on your own proposal.", variant: "default"});
              return;
          }

          // Determine current vote status for this user
           const currentVote = solution.upvotes.includes(anonymousUserId) ? 'up' : solution.downvotes.includes(anonymousUserId) ? 'down' : null;

          // If clicking the same vote type again, treat as removing the vote
          const effectiveVoteType = currentVote === voteType ? null : voteType;

          // Optimistic UI Update
          setSolutions(prev => {
             const updatedSolutions = prev.map(s => {
                 if (s.id === solutionId) {
                      const newS = { ...s };
                      newS.upvotes = newS.upvotes.filter(id => id !== anonymousUserId);
                      newS.downvotes = newS.downvotes.filter(id => id !== anonymousUserId);
                      if (effectiveVoteType === 'up') newS.upvotes.push(anonymousUserId);
                      else if (effectiveVoteType === 'down') newS.downvotes.push(anonymousUserId);
                      return newS;
                 }
                 return s;
             });
             return updatedSolutions.sort((a, b) => (b.upvotes.length - b.downvotes.length) - (a.upvotes.length - a.downvotes.length));
          });


         // Send vote to backend (only if there's an actual change)
         if (effectiveVoteType !== currentVote) {
             try {
                 await voteOnSolution(solutionId, anonymousUserId, effectiveVoteType || 'down'); // Send 'down' if null to remove vote, backend should handle removal logic
                 // No toast needed for voting usually, UI update is sufficient feedback
             } catch (error) {
                 console.error("Vote failed:", error);
                 toast({ title: "Voting Error", description: "Could not register your vote.", variant: "destructive"});
                  // Rollback optimistic UI update on error
                 setSolutions(prev => {
                     const rolledBack = prev.map(s => {
                          if (s.id === solutionId) return solution; // Restore original state
                          return s;
                     });
                      return rolledBack.sort((a, b) => (b.upvotes.length - b.downvotes.length) - (a.upvotes.length - a.downvotes.length));
                 });
             }
         }
     }


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 text-center flex items-center justify-center">
        <Users2 className="h-8 w-8 mr-2 text-primary" /> Collaborative Problem Solving
      </h1>
      <p className="text-muted-foreground mb-6 text-center max-w-2xl mx-auto">
        Work together anonymously to solve this challenge! Discuss approaches, share ideas, and vote on the best solution. Your anonymous ID for this session is: <span className="font-mono text-sm bg-muted px-1 py-0.5 rounded">{anonymousUserId || 'Assigning...'}</span>
      </p>

       {isLoading ? (
           <div className="flex justify-center items-center h-64">
             <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
           </div>
       ) : problem ? (
           <div className="flex flex-col lg:flex-row gap-6">
               {/* Problem & Solutions */}
               <Card className="lg:w-1/2 xl:w-2/5 flex flex-col border-primary/30 shadow-sm">
                  <CardHeader>
                      <CardTitle>{problem.title}</CardTitle>
                      <CardDescription>Subject: {problem.subject}</CardDescription>
                       <div className="whitespace-pre-wrap text-sm pt-3 border-t mt-3">{problem.description}</div>
                  </CardHeader>
                   <CardContent className="flex-grow space-y-4 overflow-hidden flex flex-col">
                       <h3 className="font-semibold flex items-center text-base"><CheckSquare className="h-5 w-5 mr-2"/> Proposed Solutions</h3>
                       <ScrollArea className="flex-grow pr-3 -mr-3"> {/* Negative margin to hide scrollbar visually slightly */}
                          {solutions.length > 0 ? (
                              <div className="space-y-3">
                                  {solutions.map(sol => {
                                      const userVote = sol.upvotes.includes(anonymousUserId) ? 'up' : sol.downvotes.includes(anonymousUserId) ? 'down' : null;
                                      const netVotes = sol.upvotes.length - sol.downvotes.length;
                                      return (
                                         <div key={sol.id} className="p-3 border rounded bg-card text-sm relative group">
                                             <p className="whitespace-pre-wrap break-words">{sol.text}</p>
                                             <div className="flex justify-between items-center mt-2 pt-2 border-t border-border/50 text-xs text-muted-foreground">
                                                 <span title={`Proposed by ${sol.userId}`}>By {sol.userId}</span>
                                                  <div className="flex items-center space-x-1">
                                                      {/* Upvote Button */}
                                                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleVote(sol.id, 'up')} disabled={sol.userId === anonymousUserId} title="Upvote">
                                                          <ThumbsUp className={cn("h-4 w-4", userVote === 'up' ? 'text-green-500 fill-green-500' : 'hover:text-green-500')}/>
                                                      </Button>
                                                      <span className={cn("font-medium w-5 text-center", netVotes > 0 ? 'text-green-600' : netVotes < 0 ? 'text-red-600' : '')}>{netVotes}</span>
                                                       {/* Downvote Button */}
                                                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleVote(sol.id, 'down')} disabled={sol.userId === anonymousUserId} title="Downvote">
                                                           <ThumbsDown className={cn("h-4 w-4", userVote === 'down' ? 'text-red-500 fill-red-500' : 'hover:text-red-500')}/>
                                                      </Button>
                                                  </div>
                                             </div>
                                              {/* Optional: Delete button for own proposal */}
                                              {sol.userId === anonymousUserId && (
                                                  <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 text-destructive opacity-0 group-hover:opacity-70 hover:opacity-100 transition-opacity" title="Delete My Proposal">
                                                       {/* Add delete handler */}
                                                       <Trash2 className="h-3 w-3" />
                                                  </Button>
                                              )}
                                         </div>
                                      );
                                  })}
                              </div>
                          ) : (
                              <p className="text-center text-muted-foreground py-6">No solutions proposed yet. Be the first!</p>
                          )}
                       </ScrollArea>
                   </CardContent>
                   <CardFooter className="border-t pt-4">
                      <div className="w-full space-y-2">
                         <Label htmlFor="new-solution">Propose a Solution:</Label>
                         <Textarea
                             id="new-solution"
                             value={newSolution}
                             onChange={(e) => setNewSolution(e.target.value)}
                             placeholder="Type your final answer and reasoning here..."
                             rows={3}
                             disabled={isProposing}
                          />
                          <Button onClick={handleProposeSolution} disabled={isProposing || !newSolution.trim()} className="w-full">
                              {isProposing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Proposing...</> : <><Lightbulb className="mr-2 h-4 w-4"/> Propose Solution</>}
                          </Button>
                      </div>
                   </CardFooter>
               </Card>

               {/* Live Chat */}
               <Card className="lg:w-1/2 xl:w-3/5 flex flex-col shadow-sm">
                  <CardHeader>
                      <CardTitle className="flex items-center"><MessageSquare className="h-5 w-5 mr-2"/> Live Discussion</CardTitle>
                      <CardDescription>Chat with others working on this problem.</CardDescription>
                  </CardHeader>
                   <CardContent className="flex-grow overflow-hidden flex flex-col">
                      <ScrollArea className="flex-grow pr-4 -mr-4 mb-4"> {/* Adjust margin for scrollbar */}
                           <div className="space-y-4">
                              {messages.map((msg) => (
                                 <div key={msg.id} className={`flex ${msg.userId === anonymousUserId ? 'justify-end' : 'justify-start'}`}>
                                     <div className={`flex items-end gap-2 max-w-[85%]`}>
                                         {msg.userId !== anonymousUserId && (
                                             <Avatar className="h-6 w-6 border">
                                                  <AvatarFallback className="text-xs bg-muted">{msg.userId.substring(5, 7)}</AvatarFallback> {/* Show last 2 chars of ID */}
                                             </Avatar>
                                         )}
                                         <div className={`p-2.5 rounded-lg shadow-sm ${msg.userId === anonymousUserId ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                             <p className="text-sm break-words">{msg.text}</p>
                                             <p className={`text-[10px] mt-1 ${msg.userId === anonymousUserId ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground'}`}>
                                                {msg.userId} - {new Date(msg.timestamp).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})}
                                             </p>
                                         </div>
                                         {msg.userId === anonymousUserId && (
                                              <Avatar className="h-6 w-6 border border-primary/50">
                                                  {/* Simple user icon for self */}
                                                  <AvatarFallback className="text-xs bg-primary text-primary-foreground"><UserCircle className="h-4 w-4"/></AvatarFallback>
                                             </Avatar>
                                         )}
                                     </div>
                                 </div>
                              ))}
                               <div ref={messageEndRef} /> {/* Scroll target */}
                           </div>
                      </ScrollArea>
                   </CardContent>
                   <CardFooter className="border-t pt-4">
                       <div className="flex w-full items-center gap-2">
                          <Input
                             value={newMessage}
                             onChange={(e) => setNewMessage(e.target.value)}
                             placeholder="Type your message..."
                             disabled={isSending}
                             onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                             className="flex-grow"
                          />
                           <Button onClick={handleSendMessage} disabled={isSending || !newMessage.trim()} size="icon">
                              {isSending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4" />}
                              <span className="sr-only">Send</span>
                           </Button>
                       </div>
                   </CardFooter>
               </Card>
           </div>
       ) : (
            <Card className="text-center py-10 border-dashed">
               <CardTitle>Problem Loading Error</CardTitle>
               <CardDescription>Could not load the collaborative problem. Please try again later.</CardDescription>
            </Card>
       )}

    </div>
  );
}
