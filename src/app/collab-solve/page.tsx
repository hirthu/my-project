'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Users2, Lightbulb, MessageSquare, CheckSquare, User, Loader2, Send, ThumbsUp, ThumbsDown } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Mock Data Interfaces
interface Problem {
  id: string;
  title: string;
  description: string;
  subject: string;
}

interface CollabMessage {
  id: string;
  userId: string; // Anonymous ID for the session, e.g., "User 1", "User 2"
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
const anonymousUserId = `User_${Math.random().toString(36).substring(2, 7)}`;

// Mock Realtime Database Interaction (Simulated with state and timeouts)
// Replace these with actual Firebase Realtime Database listeners and updates

const mockProblem: Problem = {
  id: 'prob_complex_eqn',
  title: 'Complex Equation Challenge',
  description: 'Solve the following system of equations for x and y:\n1) 2x + 3y = 7\n2) 5x - 2y = 8\nDiscuss your approach and propose a final solution.',
  subject: 'Mathematics',
};

let mockMessages: CollabMessage[] = [
    {id: 'msg1', userId: 'User_abc', text: 'Okay, let\'s try substitution first?', timestamp: Date.now() - 50000},
    {id: 'msg2', userId: 'User_def', text: 'Maybe elimination is easier for this one?', timestamp: Date.now() - 45000},
];
let mockSolutions: ProposedSolution[] = [];

// Simulate fetching initial state
const fetchInitialState = async (): Promise<{ messages: CollabMessage[], solutions: ProposedSolution[] }> => {
  console.log("Fetching initial collab state...");
  await new Promise(resolve => setTimeout(resolve, 500));
  return { messages: mockMessages, solutions: mockSolutions };
};

// Simulate receiving a new message
const subscribeToMessages = (callback: (message: CollabMessage) => void): (() => void) => {
  console.log("Subscribing to messages...");
  const intervalId = setInterval(() => {
    // Simulate another user sending a message occasionally
    if (Math.random() < 0.1) {
        const newMessage: CollabMessage = {
            id: `msg${Date.now()}`,
            userId: `User_${Math.random().toString(36).substring(2, 7)}`,
            text: `Random thought: ${Math.random().toFixed(3)}`,
            timestamp: Date.now(),
        };
        mockMessages = [...mockMessages, newMessage];
        callback(newMessage);
    }
  }, 5000); // Check every 5 seconds

  return () => {
      console.log("Unsubscribing from messages.");
      clearInterval(intervalId);
  }; // Return unsubscribe function
};

// Simulate sending a message
const sendMessage = async (message: Omit<CollabMessage, 'id' | 'timestamp'>): Promise<void> => {
  console.log("Sending message:", message);
  await new Promise(resolve => setTimeout(resolve, 200));
  const newMessage: CollabMessage = { ...message, id: `msg${Date.now()}`, timestamp: Date.now() };
   mockMessages = [...mockMessages, newMessage];
   // In a real app, this would push to Realtime DB, and the listener would update state.
   // For mock, we might need to manually trigger an update if the listener is simplistic.
};

// Simulate proposing a solution
const proposeSolution = async (solution: Omit<ProposedSolution, 'id' | 'timestamp' | 'upvotes' | 'downvotes'>): Promise<void> => {
   console.log("Proposing solution:", solution);
   await new Promise(resolve => setTimeout(resolve, 300));
   const newSolution: ProposedSolution = { ...solution, id: `sol${Date.now()}`, timestamp: Date.now(), upvotes: [], downvotes: [] };
    mockSolutions = [...mockSolutions, newSolution];
    // Trigger update for listeners
};

// Simulate voting on a solution
const voteOnSolution = async (solutionId: string, userId: string, voteType: 'up' | 'down'): Promise<void> => {
    console.log(`Voting ${voteType} on solution ${solutionId} by ${userId}`);
    await new Promise(resolve => setTimeout(resolve, 150));
     const solutionIndex = mockSolutions.findIndex(s => s.id === solutionId);
     if (solutionIndex > -1) {
         const solution = { ...mockSolutions[solutionIndex] }; // Copy
         // Remove existing vote from user if any
         solution.upvotes = solution.upvotes.filter(id => id !== userId);
         solution.downvotes = solution.downvotes.filter(id => id !== userId);
         // Add new vote
         if (voteType === 'up') solution.upvotes.push(userId);
         else solution.downvotes.push(userId);

          mockSolutions = [...mockSolutions]; // Trigger re-render if state is based on this array instance
          mockSolutions[solutionIndex] = solution;
         // Trigger update for listeners
     }
}

// --- Component ---
export default function CollaborativeProblemSolvingPage() {
  const [problem, setProblem] = useState<Problem | null>(mockProblem); // Load problem directly for demo
  const [messages, setMessages] = useState<CollabMessage[]>([]);
  const [solutions, setSolutions] = useState<ProposedSolution[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [newSolution, setNewSolution] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
   const [isProposing, setIsProposing] = useState(false);
   const messageListRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Fetch initial state
        fetchInitialState().then(state => {
            setMessages(state.messages);
            setSolutions(state.solutions);
            setIsLoading(false);
        });

        // Subscribe to new messages (and solutions in real app)
        const unsubscribeMessages = subscribeToMessages((message) => {
            setMessages(prev => [...prev, message]);
             scrollToBottom();
        });
        // TODO: Add listener for solutions updates (new proposals, votes)

        return () => {
            unsubscribeMessages();
            // Unsubscribe solutions listener
        };
    }, []);

    useEffect(() => {
       scrollToBottom();
    }, [messages]); // Scroll when messages change

    const scrollToBottom = () => {
       messageListRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }

    const handleSendMessage = async () => {
        if (!newMessage.trim() || isSending) return;
        setIsSending(true);
        try {
            await sendMessage({ userId: anonymousUserId, text: newMessage.trim() });
            // The listener should update the state, but we force it for mock
             setMessages(prev => [...prev, { id: `msg${Date.now()}`, userId: anonymousUserId, text: newMessage.trim(), timestamp: Date.now() }]);
            setNewMessage('');
        } catch (error) { console.error("Send message failed:", error); }
        finally { setIsSending(false); }
    };

    const handleProposeSolution = async () => {
        if (!newSolution.trim() || isProposing) return;
        setIsProposing(true);
         try {
             await proposeSolution({ userId: anonymousUserId, text: newSolution.trim() });
              // Listener should update state, force for mock
              setSolutions(prev => [...prev, { id: `sol${Date.now()}`, userId: anonymousUserId, text: newSolution.trim(), timestamp: Date.now(), upvotes: [], downvotes: [] }]);
             setNewSolution('');
         } catch (error) { console.error("Propose solution failed:", error); }
         finally { setIsProposing(false); }
    }

     const handleVote = async (solutionId: string, voteType: 'up' | 'down') => {
         // Prevent voting on own solution or multiple times (basic check)
         const solution = solutions.find(s => s.id === solutionId);
          if (!solution || solution.userId === anonymousUserId || solution.upvotes.includes(anonymousUserId) || solution.downvotes.includes(anonymousUserId)) {
              return; // Already voted or own solution
          }
         await voteOnSolution(solutionId, anonymousUserId, voteType);
         // Listener should update state, force for mock
         const updatedSolutions = solutions.map(s => {
             if (s.id === solutionId) {
                  const newS = { ...s };
                  newS.upvotes = newS.upvotes.filter(id => id !== anonymousUserId);
                  newS.downvotes = newS.downvotes.filter(id => id !== anonymousUserId);
                  if (voteType === 'up') newS.upvotes.push(anonymousUserId);
                  else newS.downvotes.push(anonymousUserId);
                  return newS;
             }
             return s;
         });
         setSolutions(updatedSolutions);
     }


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 text-center flex items-center justify-center">
        <Users2 className="h-8 w-8 mr-2 text-primary" /> Collaborative Problem Solving
      </h1>
      <p className="text-muted-foreground mb-6 text-center max-w-2xl mx-auto">
        Work together with other students (anonymously) to solve challenging problems in real-time.
      </p>

       {isLoading ? (
           <div className="flex justify-center items-center h-64">
             <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
           </div>
       ) : problem ? (
           <div className="flex flex-col lg:flex-row gap-6">
               {/* Problem Description & Solutions */}
               <Card className="lg:w-1/2 xl:w-2/5 flex flex-col">
                  <CardHeader>
                      <CardTitle>{problem.title}</CardTitle>
                      <CardDescription>Subject: {problem.subject}</CardDescription>
                       <div className="whitespace-pre-wrap text-sm pt-2 border-t mt-2">{problem.description}</div>
                  </CardHeader>
                   <CardContent className="flex-grow space-y-4">
                       <h3 className="font-semibold flex items-center"><CheckSquare className="h-5 w-5 mr-2"/> Proposed Solutions</h3>
                       <ScrollArea className="h-48 pr-3">
                          {solutions.length > 0 ? (
                              <div className="space-y-3">
                                  {solutions.sort((a, b) => (b.upvotes.length - b.downvotes.length) - (a.upvotes.length - a.downvotes.length)).map(sol => ( // Sort by net votes
                                      <div key={sol.id} className="p-3 border rounded bg-card text-sm">
                                          <p className="whitespace-pre-wrap">{sol.text}</p>
                                          <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                                              <span>Proposed by {sol.userId}</span>
                                               <div className="flex items-center space-x-1">
                                                   <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleVote(sol.id, 'up')} disabled={sol.userId === anonymousUserId || sol.upvotes.includes(anonymousUserId) || sol.downvotes.includes(anonymousUserId)} title="Upvote">
                                                       <ThumbsUp className={`h-4 w-4 ${sol.upvotes.includes(anonymousUserId) ? 'text-green-500 fill-green-500' : ''}`}/>
                                                   </Button>
                                                   <span className="font-medium w-4 text-center">{sol.upvotes.length - sol.downvotes.length}</span>
                                                   <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleVote(sol.id, 'down')} disabled={sol.userId === anonymousUserId || sol.upvotes.includes(anonymousUserId) || sol.downvotes.includes(anonymousUserId)} title="Downvote">
                                                        <ThumbsDown className={`h-4 w-4 ${sol.downvotes.includes(anonymousUserId) ? 'text-red-500 fill-red-500' : ''}`}/>
                                                   </Button>
                                               </div>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          ) : (
                              <p className="text-center text-muted-foreground py-4">No solutions proposed yet. Be the first!</p>
                          )}
                       </ScrollArea>
                   </CardContent>
                   <CardFooter className="border-t pt-4">
                      <div className="w-full space-y-2">
                         <Textarea
                             value={newSolution}
                             onChange={(e) => setNewSolution(e.target.value)}
                             placeholder="Propose your final solution here..."
                             rows={3}
                             disabled={isProposing}
                          />
                          <Button onClick={handleProposeSolution} disabled={isProposing || !newSolution.trim()} className="w-full">
                              {isProposing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Proposing...</> : <><CheckSquare className="mr-2 h-4 w-4"/> Propose Solution</>}
                          </Button>
                      </div>
                   </CardFooter>
               </Card>

               {/* Live Chat Area */}
               <Card className="lg:w-1/2 xl:w-3/5 flex flex-col">
                  <CardHeader>
                      <CardTitle className="flex items-center"><MessageSquare className="h-5 w-5 mr-2"/> Live Discussion</CardTitle>
                      <CardDescription>Chat with other anonymous users working on this problem.</CardDescription>
                  </CardHeader>
                   <CardContent className="flex-grow overflow-hidden flex flex-col">
                      <ScrollArea className="flex-grow pr-3 mb-4">
                           <div className="space-y-4">
                              {messages.map((msg) => (
                                 <div key={msg.id} className={`flex ${msg.userId === anonymousUserId ? 'justify-end' : 'justify-start'}`}>
                                     <div className={`flex items-end gap-2 max-w-[80%]`}>
                                         {msg.userId !== anonymousUserId && (
                                             <Avatar className="h-6 w-6">
                                                  <AvatarFallback className="text-xs bg-muted">{msg.userId.substring(0, 2)}</AvatarFallback>
                                             </Avatar>
                                         )}
                                         <div className={`p-2 rounded-lg ${msg.userId === anonymousUserId ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                             <p className="text-sm">{msg.text}</p>
                                             <p className={`text-xs mt-1 ${msg.userId === anonymousUserId ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground'}`}>
                                                {msg.userId} - {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                             </p>
                                         </div>
                                         {msg.userId === anonymousUserId && (
                                              <Avatar className="h-6 w-6">
                                                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">{anonymousUserId.substring(0, 2)}</AvatarFallback>
                                             </Avatar>
                                         )}
                                     </div>
                                 </div>
                              ))}
                               <div ref={messageListRef} /> {/* Empty div to scroll to */}
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
                          />
                           <Button onClick={handleSendMessage} disabled={isSending || !newMessage.trim()} size="icon">
                              {isSending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4" />}
                           </Button>
                       </div>
                   </CardFooter>
               </Card>
           </div>
       ) : (
            <Card className="text-center py-10">
               <CardTitle>Problem Loading Error</CardTitle>
               <CardDescription>Could not load the collaborative problem. Please try again later.</CardDescription>
            </Card>
       )}

    </div>
  );
}
