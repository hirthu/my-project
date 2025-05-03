'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, StickyNote, Filter, X, Clock, Video, Loader2, FileWarning, Tag } from 'lucide-react'; // Added Tag
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast'; // Import useToast

// Mock Note Interface
interface StickyNoteData {
  id: string;
  sessionId: string; // Link to the session
  sessionTitle: string; // Title of the session for context
  content: string;
  timestamp?: number; // Optional: seconds into video/audio
  whiteboardFrame?: string; // Optional: identifier for whiteboard state/image
  createdAt: Date;
  tags?: string[];
}

// Mock User ID
const userId = 'user123';

// Mock function to fetch notes - replace with actual API call (e.g., Firestore query)
const fetchStickyNotes = async (userId: string, filters: { searchTerm?: string, sessionId?: string }): Promise<StickyNoteData[]> => {
  console.log(`Fetching sticky notes for user ${userId} with filters:`, filters);
  await new Promise(resolve => setTimeout(resolve, 800));

  let allNotes: StickyNoteData[] = [];
   try {
       const storedNotes = localStorage.getItem(`tutorverseStickyNotes_${userId}`);
       if (storedNotes) {
           const parsedNotes = JSON.parse(storedNotes) as StickyNoteData[];
            allNotes = parsedNotes.map(note => ({ ...note, createdAt: new Date(note.createdAt) }));
       } else {
            // Default mock data if nothing in storage
            allNotes = [
              { id: 'note_abc', sessionId: 'sess_calc1', sessionTitle: 'Calculus Derivatives Intro', content: 'Remember the power rule: d/dx(x^n) = nx^(n-1)', timestamp: 125, createdAt: new Date(Date.now() - 86400000 * 3), tags: ['calculus', 'rule'] },
              { id: 'note_def', sessionId: 'sess_phys1', sessionTitle: 'Newtonian Mechanics Basics', content: 'F=ma is key! Especially in inclined plane problems.', whiteboardFrame: 'frame_005', createdAt: new Date(Date.now() - 86400000 * 2), tags: ['physics', 'newton'] },
              { id: 'note_ghi', sessionId: 'sess_calc1', sessionTitle: 'Calculus Derivatives Intro', content: 'Practice chain rule examples from the textbook (pg. 55).', timestamp: 310, createdAt: new Date(Date.now() - 86400000), tags: ['calculus', 'practice', 'homework'] },
              { id: 'note_jkl', sessionId: 'sess_essay1', sessionTitle: 'Essay Structure Workshop', content: 'Thesis statement needs refinement. Ask tutor next time about connecting evidence better.', createdAt: new Date(Date.now() - 3600000 * 5), tags: ['english', 'writing', 'feedback'] },
              { id: 'note_mno', sessionId: 'sess_code1', sessionTitle: 'Python Looping', content: 'Difference between `for` and `while` loops. When to use each?', timestamp: 65, createdAt: new Date(Date.now() - 86400000 * 4), tags: ['python', 'coding', 'loops'] },
            ];
           localStorage.setItem(`tutorverseStickyNotes_${userId}`, JSON.stringify(allNotes));
       }
   } catch (error) {
       console.error("Error reading notes from localStorage:", error);
       allNotes = [ { id: 'err_note', sessionId: 'err_sess', sessionTitle: 'Error Loading Notes', content: 'Could not load notes from storage.', createdAt: new Date() } ];
   }

  let filteredNotes = allNotes;

  if (filters.sessionId) {
    filteredNotes = filteredNotes.filter(note => note.sessionId === filters.sessionId);
  }

  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    filteredNotes = filteredNotes.filter(note =>
      note.content.toLowerCase().includes(term) ||
      note.sessionTitle.toLowerCase().includes(term) ||
      (note.tags && note.tags.some(tag => tag.toLowerCase().includes(term)))
    );
  }

  filteredNotes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return filteredNotes;
};

// Mock function to delete note - replace with actual API call
const deleteStickyNote = async (userId: string, noteId: string): Promise<boolean> => {
    console.log(`Deleting note ${noteId} for user ${userId}`);
    await new Promise(resolve => setTimeout(resolve, 300));
     try {
        const currentNotes = await fetchStickyNotes(userId, {});
        const updatedNotes = currentNotes.filter(note => note.id !== noteId);
        localStorage.setItem(`tutorverseStickyNotes_${userId}`, JSON.stringify(updatedNotes));
        return true;
     } catch (error) {
        console.error("Error deleting note:", error);
        return false;
     }
};

// --- Component ---
export default function StickyNotesDashboardPage() {
  const [notes, setNotes] = useState<StickyNoteData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  // TODO: Add filter by session ID using a Select dropdown

  useEffect(() => {
    const loadNotes = async () => {
      setIsLoading(true);
      try {
        // Pass filters to fetch function
        const fetchedNotes = await fetchStickyNotes(userId, { searchTerm });
        setNotes(fetchedNotes);
      } catch (error) {
        console.error("Failed to load sticky notes:", error);
        toast({ title: "Error", description: "Could not load your sticky notes.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
     // Debounce search input
     const timerId = setTimeout(() => {
       loadNotes();
     }, 300); // Fetch notes 300ms after user stops typing

     return () => clearTimeout(timerId); // Clear timeout on cleanup

  }, [searchTerm, toast]); // Refetch when search term or toast changes (toast unlikely, but good practice)

   const handleDelete = async (noteId: string) => {
       const noteToDelete = notes.find(n => n.id === noteId);
       if (!noteToDelete) return;

       const confirmed = confirm(`Are you sure you want to delete this note?\n\n"${noteToDelete.content.substring(0, 50)}..."`);
       if (!confirmed) return;

       // Optimistic UI update
       const originalNotes = notes;
       setNotes(prev => prev.filter(note => note.id !== noteId));

       const success = await deleteStickyNote(userId, noteId);
       if (success) {
           toast({ title: "Note Deleted", description: "Your sticky note has been removed." });
       } else {
            // Rollback UI if delete failed
           setNotes(originalNotes);
            toast({ title: "Error", description: "Could not delete the note. Please try again.", variant: "destructive" });
       }
   }

    // Format timestamp (seconds) into MM:SS
    const formatTimestamp = (seconds: number | undefined) => {
        if (seconds === undefined || isNaN(seconds) || seconds < 0) return '';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    };


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 text-center flex items-center justify-center">
        <StickyNote className="h-8 w-8 mr-2 text-primary" /> Smart Sticky Notes
      </h1>
      <p className="text-muted-foreground mb-8 text-center max-w-2xl mx-auto">
        Review all your notes taken during sessions. Search by content, session, or tags. Click a note to jump to the session moment!
      </p>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 sticky top-16 bg-background/95 backdrop-blur py-4 z-10 border-b">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search notes content, session title, or #tags..."
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
           {searchTerm && (
             <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setSearchTerm('')}>
                <X className="h-4 w-4" />
             </Button>
           )}
        </div>
        {/* TODO: Add Session Filter Dropdown */}
        {/* <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" /> Filter by Session
        </Button> */}
      </div>

      {/* Notes Grid/List */}
      {isLoading ? (
         <div className="text-center py-10">
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground mx-auto" />
            <p className="mt-3 text-muted-foreground">Loading your notes...</p>
         </div>
      ) : notes.length > 0 ? (
        <ScrollArea className="h-[calc(100vh-22rem)]"> {/* Adjust height */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pr-4 pb-4">
          {notes.map((note) => (
            <Card key={note.id} className="flex flex-col shadow hover:shadow-md transition-shadow bg-yellow-100 dark:bg-yellow-900/40 border-yellow-300 dark:border-yellow-700/50 group relative text-sm">
              <CardContent className="pt-4 pb-2 flex-grow">
                <p className="whitespace-pre-wrap break-words">{note.content}</p>
              </CardContent>
              <CardFooter className="pt-2 pb-3 px-3 text-xs text-muted-foreground border-t border-yellow-200 dark:border-yellow-800/50 mt-auto">
                 <div className="flex flex-col w-full gap-1.5">
                     <div className="flex justify-between items-center w-full">
                        <div className="flex items-center space-x-2 overflow-hidden">
                           {/* Link to session, potentially jumping to timestamp */}
                           <Link href={`/sessions/${note.sessionId}${note.timestamp ? `?t=${note.timestamp}` : ''}`} title={`Go to session: ${note.sessionTitle}`} className="hover:underline truncate flex items-center text-blue-600 dark:text-blue-400 font-medium">
                              <Video className="h-3.5 w-3.5 mr-1 shrink-0"/>
                              <span className="truncate">{note.sessionTitle}</span>
                           </Link>
                           {note.timestamp !== undefined && (
                               <span className="flex items-center shrink-0 text-gray-600 dark:text-gray-400" title="Timestamp in session video/audio">
                                 <Clock className="h-3 w-3 mr-0.5"/> {formatTimestamp(note.timestamp)}
                               </span>
                           )}
                           {/* Whiteboard Frame indicator (simplified) */}
                            {note.whiteboardFrame && (
                               <span className="flex items-center shrink-0 text-gray-600 dark:text-gray-400" title={`Whiteboard Frame: ${note.whiteboardFrame}`}>
                                   <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4V5h12v10zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 4a1 1 0 100 2h4a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                               </span>
                            )}
                        </div>
                        <Button
                           variant="ghost"
                           size="icon"
                           className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-70 hover:opacity-100 transition-opacity text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
                           onClick={() => handleDelete(note.id)}
                           title="Delete Note"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                     </div>
                      <div className="flex justify-between items-end w-full">
                         <span className="text-gray-500 dark:text-gray-400 text-[10px]">
                             {formatDistanceToNow(note.createdAt, { addSuffix: true })}
                         </span>
                          {/* Display tags */}
                         {note.tags && note.tags.length > 0 && (
                             <div className="flex flex-wrap gap-1 justify-end">
                                 {note.tags.slice(0, 3).map(tag => ( // Limit initial tags displayed
                                     <span key={tag} className="text-[9px] bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded flex items-center">
                                        <Tag className="h-2 w-2 mr-0.5"/>{tag}
                                     </span>
                                 ))}
                                 {note.tags.length > 3 && <span className="text-[9px] text-muted-foreground">...</span>}
                             </div>
                         )}
                      </div>
                 </div>
              </CardFooter>
            </Card>
          ))}
         </div>
        </ScrollArea>
      ) : (
        <Card className="col-span-full text-center py-12 border-dashed bg-muted/50">
          <StickyNote className="h-16 w-16 text-muted-foreground mx-auto mb-4"/>
          <CardTitle>No Sticky Notes Found</CardTitle>
          <CardDescription>
             {searchTerm
                ? 'No notes match your search. Try different keywords or tags.'
                : 'Create notes during your sessions to find them here later.'}
          </CardDescription>
           {searchTerm && <Button variant="link" onClick={() => setSearchTerm('')} className="mt-2">Clear Search</Button>}
        </Card>
      )}
    </div>
  );
}
