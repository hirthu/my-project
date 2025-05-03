'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Kanban, Users, Loader2, GripVertical, Trash2, Edit, UserPlus, Lock } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'; // Using hello-pangea fork for React 18+

// Mock Data Interfaces
interface BoardTask {
  id: string;
  content: string;
  order: number;
}

interface BoardColumn {
  id: string;
  title: string;
  taskIds: string[]; // Ordered list of task IDs in this column
}

interface CollaborationBoard {
  id: string;
  title: string;
  members: string[]; // User IDs of tutors who are members
  ownerId: string; // User ID of the board creator
  columns: Record<string, BoardColumn>; // Column ID -> Column data
  tasks: Record<string, BoardTask>; // Task ID -> Task data
  columnOrder: string[]; // Ordered list of column IDs
}

// Mock User ID (replace with actual logged-in tutor ID)
const currentTutorId = 'tutor_user_123';

// Mock function to fetch boards for the current tutor - replace with Firestore query
const fetchTutorBoards = async (tutorId: string): Promise<CollaborationBoard[]> => {
   console.log(`Fetching boards for tutor ${tutorId}...`);
   await new Promise(resolve => setTimeout(resolve, 1000));
    // Load from localStorage or return defaults
    try {
       const storedBoards = localStorage.getItem(`tutorverseBoards_${tutorId}`);
       if (storedBoards) {
           return JSON.parse(storedBoards) as CollaborationBoard[];
       }
    } catch (error) { console.error("Error reading boards:", error); }

    // Default mock board if none found
   return [
     {
       id: 'board_math_planning',
       title: 'Algebra Curriculum Plan Q3',
       ownerId: 'tutor_user_123',
       members: ['tutor_user_123', 'tutor_alice', 'tutor_bob'],
       tasks: {
         'task-1': { id: 'task-1', content: 'Review linear equations chapter', order: 0 },
         'task-2': { id: 'task-2', content: 'Create quadratic practice problems', order: 1 },
         'task-3': { id: 'task-3', content: 'Develop trigonometry intro slides', order: 0 },
         'task-4': { id: 'task-4', content: 'Finalize assessment questions', order: 0 },
       },
       columns: {
         'col-1': { id: 'col-1', title: 'To Do', taskIds: ['task-1', 'task-2'] },
         'col-2': { id: 'col-2', title: 'In Progress', taskIds: ['task-3'] },
         'col-3': { id: 'col-3', title: 'Done', taskIds: ['task-4'] },
       },
       columnOrder: ['col-1', 'col-2', 'col-3'],
     },
   ];
};

// Mock function to save board state - replace with Firestore update
const saveBoardState = async (tutorId: string, board: CollaborationBoard): Promise<boolean> => {
    console.log(`Saving board ${board.id} for tutor ${tutorId}...`);
    await new Promise(resolve => setTimeout(resolve, 500));
     try {
        const currentBoards = await fetchTutorBoards(tutorId); // Fetch all boards (inefficient for mock)
        const boardIndex = currentBoards.findIndex(b => b.id === board.id);
         let updatedBoards;
        if (boardIndex > -1) {
            updatedBoards = [...currentBoards];
            updatedBoards[boardIndex] = board;
        } else {
            updatedBoards = [...currentBoards, board]; // Add if new board
        }
        localStorage.setItem(`tutorverseBoards_${tutorId}`, JSON.stringify(updatedBoards));
        return true;
     } catch (error) {
        console.error("Error saving board:", error);
        return false;
     }
}

// --- Drag and Drop Logic ---
const onDragEnd = (result: DropResult, board: CollaborationBoard, setBoard: React.Dispatch<React.SetStateAction<CollaborationBoard | null>>) => {
  const { destination, source, draggableId, type } = result;

  if (!destination) return; // Dropped outside a droppable area

  if (destination.droppableId === source.droppableId && destination.index === source.index) {
    return; // Dropped in the same place
  }

   const updatedBoard = { ...board }; // Shallow copy

   // --- Handle Column Reordering ---
  if (type === 'column') {
     const newColumnOrder = Array.from(board.columnOrder);
     newColumnOrder.splice(source.index, 1); // Remove from old position
     newColumnOrder.splice(destination.index, 0, draggableId); // Insert at new position

     updatedBoard.columnOrder = newColumnOrder;
     setBoard(updatedBoard);
      saveBoardState(currentTutorId, updatedBoard); // Persist change
     return;
  }

  // --- Handle Task Reordering ---
  const startColumn = board.columns[source.droppableId];
  const finishColumn = board.columns[destination.droppableId];

  // Moving within the same column
  if (startColumn === finishColumn) {
    const newTaskIds = Array.from(startColumn.taskIds);
    newTaskIds.splice(source.index, 1);
    newTaskIds.splice(destination.index, 0, draggableId);

    const newColumn = {
      ...startColumn,
      taskIds: newTaskIds,
    };

    updatedBoard.columns[newColumn.id] = newColumn; // Update column in board
    setBoard(updatedBoard);
     saveBoardState(currentTutorId, updatedBoard); // Persist change
    return;
  }

  // Moving task to a different column
  const startTaskIds = Array.from(startColumn.taskIds);
  startTaskIds.splice(source.index, 1); // Remove from source
  const newStartColumn = {
    ...startColumn,
    taskIds: startTaskIds,
  };

  const finishTaskIds = Array.from(finishColumn.taskIds);
  finishTaskIds.splice(destination.index, 0, draggableId); // Insert into destination
  const newFinishColumn = {
    ...finishColumn,
    taskIds: finishTaskIds,
  };

   updatedBoard.columns[newStartColumn.id] = newStartColumn;
   updatedBoard.columns[newFinishColumn.id] = newFinishColumn;

   setBoard(updatedBoard);
   saveBoardState(currentTutorId, updatedBoard); // Persist change
};


// --- Page Component ---
export default function TutorCollaborationPage() {
  const [boards, setBoards] = useState<CollaborationBoard[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<CollaborationBoard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Add state for creating/editing boards, tasks, columns

  useEffect(() => {
    const loadBoards = async () => {
      setIsLoading(true);
      try {
        const fetchedBoards = await fetchTutorBoards(currentTutorId);
        setBoards(fetchedBoards);
        // Select the first board by default if available
        if (fetchedBoards.length > 0 && !selectedBoard) {
           setSelectedBoard(fetchedBoards[0]);
        }
      } catch (error) {
        console.error("Failed to load boards:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadBoards();
     // In a real app, setup Firestore listener (onSnapshot) here for real-time updates
     // return () => unsubscribe(); // Cleanup listener on unmount
  }, [currentTutorId]); // Re-fetch if tutorId changes (though unlikely here)


   // Function to add a new task (example)
   const addTask = (columnId: string) => {
       if (!selectedBoard) return;

       const newTaskId = `task-${Date.now()}`;
       const newTaskContent = prompt("Enter task content:"); // Simple prompt for demo
       if (!newTaskContent) return;

       const newTask: BoardTask = { id: newTaskId, content: newTaskContent, order: selectedBoard.columns[columnId].taskIds.length };

       const updatedBoard = { ...selectedBoard };
       updatedBoard.tasks[newTaskId] = newTask;
       updatedBoard.columns[columnId].taskIds.push(newTaskId);

       setSelectedBoard(updatedBoard);
       saveBoardState(currentTutorId, updatedBoard);
   }
   // Similar functions needed for addColumn, editTask, deleteTask, editColumn, deleteColumn, addMember, etc.

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 text-center flex items-center justify-center">
        <Kanban className="h-8 w-8 mr-2 text-primary" /> Tutor Collaboration Boards
      </h1>
      <p className="text-muted-foreground mb-6 text-center max-w-2xl mx-auto">
        Plan lessons, share resources, and coordinate with fellow tutors in real-time.
      </p>

      {/* Board Selection & Creation Area */}
      <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
         {/* TODO: Replace with a Select dropdown for better scalability */}
         {boards.map(board => (
             <Button
                key={board.id}
                variant={selectedBoard?.id === board.id ? 'default' : 'outline'}
                onClick={() => setSelectedBoard(board)}
                disabled={isLoading}
             >
                {board.title}
             </Button>
         ))}
          <Button variant="secondary" disabled={isLoading} onClick={() => alert("Create new board (not implemented)")}>
             <Plus className="mr-2 h-4 w-4" /> Create New Board
          </Button>
      </div>

      {/* Kanban Board Area */}
      <Card className="overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
          </div>
        ) : selectedBoard ? (
           <>
           <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
               <div>
                 <CardTitle className="text-xl">{selectedBoard.title}</CardTitle>
                 <CardDescription className="flex items-center text-xs mt-1">
                    <Users className="h-3 w-3 mr-1"/> {selectedBoard.members.length} Members
                    {selectedBoard.ownerId !== currentTutorId && <span className="ml-2 flex items-center text-amber-600"><Lock className="h-3 w-3 mr-1"/> Read-only (View only)</span>}
                 </CardDescription>
               </div>
                {/* TODO: Add Edit Board Title/Members Button */}
               <div>
                   <Button variant="ghost" size="sm" onClick={() => alert("Add/Manage members (not implemented)")}><UserPlus className="h-4 w-4 mr-1"/> Manage Members</Button>
               </div>
           </CardHeader>
           <CardContent className="pt-4">
              {/* Using DragDropContext requires client-side rendering ONLY after mount */}
              {typeof window !== 'undefined' && (
                  <DragDropContext onDragEnd={(result) => onDragEnd(result, selectedBoard, setSelectedBoard)}>
                       <Droppable droppableId="all-columns" direction="horizontal" type="column">
                           {(provided) => (
                              <div
                                 {...provided.droppableProps}
                                 ref={provided.innerRef}
                                 className="flex space-x-4 min-w-max pb-4" // Ensure columns don't wrap unexpectedly
                              >
                                 {selectedBoard.columnOrder.map((columnId, index) => {
                                    const column = selectedBoard.columns[columnId];
                                    const tasks = column.taskIds.map(taskId => selectedBoard.tasks[taskId]);

                                    return (
                                        <Draggable key={column.id} draggableId={column.id} index={index}>
                                            {(provided) => (
                                               <div
                                                  {...provided.draggableProps}
                                                  ref={provided.innerRef}
                                                  className="w-72 bg-muted rounded-lg flex flex-col"
                                               >
                                                  {/* Column Header */}
                                                   <div {...provided.dragHandleProps} className="p-3 border-b flex justify-between items-center cursor-grab active:cursor-grabbing">
                                                        <h3 className="font-semibold text-sm">{column.title}</h3>
                                                        {/* TODO: Add Edit/Delete Column buttons */}
                                                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                                                   </div>

                                                  {/* Column Tasks */}
                                                   <Droppable droppableId={column.id} type="task">
                                                      {(provided, snapshot) => (
                                                          <ScrollArea
                                                              ref={provided.innerRef}
                                                              {...provided.droppableProps}
                                                              className={`flex-grow p-2 transition-colors duration-200 ${snapshot.isDraggingOver ? 'bg-accent/30' : ''}`}
                                                              style={{ minHeight: '100px' }} // Ensure droppable area is visible
                                                          >
                                                              {tasks.map((task, index) => (
                                                                  <Draggable key={task.id} draggableId={task.id} index={index}>
                                                                     {(provided, snapshot) => (
                                                                         <Card
                                                                            ref={provided.innerRef}
                                                                             {...provided.draggableProps}
                                                                             {...provided.dragHandleProps}
                                                                            className={`mb-2 p-3 bg-card shadow-sm text-sm group ${snapshot.isDragging ? 'shadow-lg scale-105' : ''}`}
                                                                             style={{...provided.draggableProps.style}} // Important for position calculation
                                                                         >
                                                                             {task.content}
                                                                             {/* TODO: Add Edit/Delete Task buttons (show on hover) */}
                                                                              <div className="absolute top-1 right-1 flex opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => alert(`Edit task ${task.id}`)}><Edit className="h-3 w-3"/></Button>
                                                                                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => alert(`Delete task ${task.id}`)}><Trash2 className="h-3 w-3"/></Button>
                                                                              </div>
                                                                         </Card>
                                                                     )}
                                                                  </Draggable>
                                                              ))}
                                                              {provided.placeholder}
                                                          </ScrollArea>
                                                      )}
                                                   </Droppable>

                                                    {/* Add Task Button */}
                                                   <div className="p-2 mt-auto border-t">
                                                       <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={() => addTask(column.id)}>
                                                          <Plus className="h-4 w-4 mr-2"/> Add a card
                                                       </Button>
                                                   </div>
                                               </div>
                                            )}
                                        </Draggable>
                                    );
                                 })}
                                 {provided.placeholder}
                                  {/* Add Column Button */}
                                  <div className="w-72 shrink-0">
                                      <Button variant="outline" className="w-full bg-muted/50" onClick={() => alert("Add new column (not implemented)")}>
                                         <Plus className="h-4 w-4 mr-2"/> Add another list
                                      </Button>
                                  </div>
                              </div>
                           )}
                       </Droppable>
                  </DragDropContext>
              )}
            </CardContent>
           </>
        ) : (
          <div className="flex flex-col items-center justify-center h-64">
            <Kanban className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Select a board or create a new one to start collaborating.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
