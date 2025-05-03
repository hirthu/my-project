'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trees, CheckCircle, Lock, Loader2 } from 'lucide-react';

// Mock Skill Tree Data Interface
interface SkillNode {
  id: string;
  name: string;
  description: string;
  dependencies: string[]; // IDs of nodes that must be completed first
  position: { x: number; y: number }; // Coordinates for visualization
}

interface SkillTree {
  subject: string;
  nodes: SkillNode[];
}

// Mock function to fetch skill tree data - replace with actual API call
const fetchSkillTree = async (subject: string): Promise<SkillTree | null> => {
  console.log(`Fetching skill tree for subject: ${subject}`);
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay

  // Mock data - define trees for different subjects
  const trees: Record<string, SkillTree> = {
    Mathematics: {
      subject: 'Mathematics',
      nodes: [
        { id: 'alg1', name: 'Algebra Basics', description: 'Variables, equations, inequalities.', dependencies: [], position: { x: 50, y: 50 } },
        { id: 'geo1', name: 'Geometry Fundamentals', description: 'Shapes, angles, lines.', dependencies: [], position: { x: 50, y: 150 } },
        { id: 'alg2', name: 'Linear Equations', description: 'Solving systems, graphing lines.', dependencies: ['alg1'], position: { x: 250, y: 50 } },
        { id: 'alg3', name: 'Quadratics', description: 'Factoring, quadratic formula.', dependencies: ['alg2'], position: { x: 450, y: 50 } },
        { id: 'trig1', name: 'Trigonometry Basics', description: 'Sine, cosine, tangent.', dependencies: ['geo1', 'alg2'], position: { x: 350, y: 150 } },
        { id: 'calc1', name: 'Intro to Calculus', description: 'Limits, derivatives.', dependencies: ['alg3', 'trig1'], position: { x: 600, y: 100 } },
      ],
    },
    Science: {
       subject: 'Science',
       nodes: [
          { id: 'bio1', name: 'Cell Biology', description: 'Structure and function of cells.', dependencies: [], position: { x: 50, y: 50 } },
          { id: 'chem1', name: 'Basic Chemistry', description: 'Atoms, molecules, reactions.', dependencies: [], position: { x: 50, y: 150 } },
          { id: 'bio2', name: 'Genetics', description: 'Heredity and DNA.', dependencies: ['bio1'], position: { x: 250, y: 50 } },
          { id: 'chem2', name: 'Organic Chemistry', description: 'Carbon compounds.', dependencies: ['chem1'], position: { x: 250, y: 150 } },
          { id: 'phys1', name: 'Intro to Physics', description: 'Motion and forces.', dependencies: ['chem1'], position: { x: 250, y: 250 } },
       ]
    }
    // Add more subjects...
  };

  return trees[subject] || null;
};

// Mock function to fetch user progress - replace with actual API call
const fetchUserProgress = async (userId: string): Promise<string[]> => {
  console.log(`Fetching progress for user: ${userId}`);
   await new Promise(resolve => setTimeout(resolve, 300));
   // Load mock progress from localStorage or return defaults
   try {
        const storedProgress = localStorage.getItem(`tutorverseProgress_${userId}`);
        if (storedProgress) {
           return JSON.parse(storedProgress) as string[];
        }
   } catch (error) {
        console.error("Error reading progress from localStorage:", error);
   }
  return ['alg1', 'geo1']; // Example: User has completed Algebra Basics and Geometry Fundamentals
};

// Mock function to update user progress - replace with actual API call
const updateUserProgress = async (userId: string, completedNodeId: string): Promise<boolean> => {
    console.log(`Updating progress for user ${userId}, adding node ${completedNodeId}`);
    await new Promise(resolve => setTimeout(resolve, 200));
    try {
         const currentProgress = await fetchUserProgress(userId);
         if (!currentProgress.includes(completedNodeId)) {
             const updatedProgress = [...currentProgress, completedNodeId];
             localStorage.setItem(`tutorverseProgress_${userId}`, JSON.stringify(updatedProgress));
         }
         return true;
    } catch (error) {
         console.error("Error updating progress in localStorage:", error);
         return false;
    }
}


// --- SVG Skill Tree Visualization ---

interface SvgSkillTreeProps {
  skillTree: SkillTree;
  completedNodes: string[];
  onNodeClick: (node: SkillNode) => void; // Function to handle node click
  viewBoxWidth?: number;
  viewBoxHeight?: number;
}

const SvgSkillTree: React.FC<SvgSkillTreeProps> = ({
  skillTree,
  completedNodes,
  onNodeClick,
  viewBoxWidth = 800,
  viewBoxHeight = 400,
}) => {
  const nodeRadius = 25;
  const nodeStrokeWidth = 2;
  const lineStrokeWidth = 2;

  const isNodeCompleted = (nodeId: string) => completedNodes.includes(nodeId);

  const areDependenciesMet = (node: SkillNode) => {
    return node.dependencies.every(depId => completedNodes.includes(depId));
  };

  const getNodeById = (id: string) => skillTree.nodes.find(n => n.id === id);

  return (
    <svg
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      width="100%"
      height="100%"
      className="overflow-visible" // Allow lines/nodes to potentially go slightly out if needed
    >
      {/* Draw Lines (Dependencies) */}
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#9ca3af" /> {/* gray-400 */}
        </marker>
      </defs>
      {skillTree.nodes.map(node =>
        node.dependencies.map(depId => {
          const depNode = getNodeById(depId);
          if (!depNode) return null;

          const startX = depNode.position.x;
          const startY = depNode.position.y;
          const endX = node.position.x;
          const endY = node.position.y;

          // Calculate endpoint slightly offset from the node center for the arrowhead
           const angle = Math.atan2(endY - startY, endX - startX);
           const adjustedEndX = endX - Math.cos(angle) * (nodeRadius + nodeStrokeWidth);
           const adjustedEndY = endY - Math.sin(angle) * (nodeRadius + nodeStrokeWidth);

          const isDepCompleted = isNodeCompleted(depId);
          const strokeColor = isDepCompleted ? 'hsl(var(--primary))' : 'hsl(var(--border))'; // Use theme colors

          return (
            <line
              key={`${depId}-${node.id}`}
              x1={startX}
              y1={startY}
              x2={adjustedEndX}
              y2={adjustedEndY}
              stroke={strokeColor}
              strokeWidth={lineStrokeWidth}
               markerEnd={isDepCompleted ? "url(#arrowhead)" : ""} // Add arrowhead if dependency met
            />
          );
        })
      )}

      {/* Draw Nodes */}
      {skillTree.nodes.map(node => {
        const completed = isNodeCompleted(node.id);
        const dependenciesMet = areDependenciesMet(node);
        const locked = !dependenciesMet && !completed;

        let fillColor = 'hsl(var(--card))'; // Default background
        let strokeColor = 'hsl(var(--border))';
        let textColor = 'hsl(var(--muted-foreground))';
        let icon = null;

        if (completed) {
          fillColor = 'hsla(var(--primary)/0.1)';
          strokeColor = 'hsl(var(--primary))';
          textColor = 'hsl(var(--primary-foreground))'; // Should be light on primary background
           icon = <CheckCircle className="h-4 w-4 text-primary" />;
        } else if (dependenciesMet) {
          fillColor = 'hsl(var(--background))'; // Ready to learn
          strokeColor = 'hsl(var(--accent))';
          textColor = 'hsl(var(--accent-foreground))'; // Should be light on accent background
          // No icon for 'ready' state, but could add one
        } else { // Locked
           fillColor = 'hsl(var(--muted))';
           strokeColor = 'hsl(var(--border))';
           textColor = 'hsl(var(--muted-foreground))';
           icon = <Lock className="h-4 w-4 text-muted-foreground" />;
        }

        return (
          <g
            key={node.id}
            transform={`translate(${node.position.x}, ${node.position.y})`}
            className={`cursor-pointer transition-transform duration-150 ease-in-out ${!locked ? 'hover:scale-110' : 'opacity-70 cursor-not-allowed'}`}
            onClick={() => !locked && onNodeClick(node)}
          >
            <title>{`${node.name}${completed ? ' (Completed)' : locked ? ' (Locked)' : ' (Ready)'}\n${node.description}`}</title>
            <circle
              cx="0"
              cy="0"
              r={nodeRadius}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={nodeStrokeWidth}
            />
             {icon && React.cloneElement(icon, { x: -8, y: -20 })} {/* Position icon top */}

             {/* Simple text wrapping (adjust as needed) */}
             <text
               x="0"
               y={5} // Adjust vertical position
               textAnchor="middle"
               fontSize="10"
               fill={textColor}
               className="select-none pointer-events-none"
             >
                {/* Basic word splitting */}
               {node.name.split(' ').map((word, index, words) => (
                   <tspan key={index} x="0" dy={index === 0 ? 0 : '1.2em'}>
                       {word}
                   </tspan>
               ))}

             </text>
          </g>
        );
      })}
    </svg>
  );
};

// --- Main Page Component ---

export default function SkillTreeMapPage() {
  const [selectedSubject, setSelectedSubject] = useState<string>('Mathematics');
  const [skillTree, setSkillTree] = useState<SkillTree | null>(null);
  const [userProgress, setUserProgress] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);
   const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);

   // Mock user ID - replace with actual auth user ID
  const userId = 'user123';

  const subjects = ['Mathematics', 'Science']; // Example subjects with defined trees

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setSelectedNode(null); // Reset selected node when subject changes
      try {
        const [treeData, progressData] = await Promise.all([
          fetchSkillTree(selectedSubject),
          fetchUserProgress(userId),
        ]);
        setSkillTree(treeData);
        setUserProgress(progressData);
      } catch (error) {
        console.error("Failed to load skill tree data:", error);
        // Handle error state, e.g., show toast
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [selectedSubject, userId]);

  const handleNodeClick = (node: SkillNode) => {
    console.log("Node clicked:", node.name);
     setSelectedNode(node);
     // In a real app, this might open a modal with learning resources, quizzes, or tutor booking options for this skill.
  };

   const markNodeAsComplete = async (nodeId: string) => {
       if (userProgress.includes(nodeId) || isUpdatingProgress) return;

       setIsUpdatingProgress(true);
       const success = await updateUserProgress(userId, nodeId);
       if (success) {
           setUserProgress(prev => [...prev, nodeId]);
            setSelectedNode(null); // Close details pane after marking complete
       } else {
            // Show error toast
           console.error("Failed to update progress");
       }
       setIsUpdatingProgress(false);
   }

    const isSelectedNodeCompleted = selectedNode && userProgress.includes(selectedNode.id);
    const areSelectedNodeDepsMet = selectedNode && selectedNode.dependencies.every(depId => userProgress.includes(depId));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 text-center flex items-center justify-center">
        <Trees className="h-8 w-8 mr-2 text-primary" /> Skill Tree Learning Map
      </h1>
      <p className="text-muted-foreground mb-6 text-center max-w-2xl mx-auto">
        Visualize your learning journey! Unlock new skills as you master concepts in each subject.
      </p>

      <div className="flex justify-center mb-6">
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="w-full md:w-[240px]">
            <SelectValue placeholder="Select Subject" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map(subject => (
              <SelectItem key={subject} value={subject}>
                {subject}
              </SelectItem>
            ))}
             {/* Add a disabled item for subjects without trees */}
             <SelectItem value="History" disabled>History (Coming Soon)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
         {/* Skill Tree Visualization Area */}
         <Card className="flex-grow lg:w-2/3 shadow-md">
           <CardHeader>
             <CardTitle>{selectedSubject} Skill Tree</CardTitle>
             <CardDescription>Click on a node to view details or mark as complete.</CardDescription>
           </CardHeader>
           <CardContent className="min-h-[400px] flex items-center justify-center relative">
             {isLoading ? (
               <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
             ) : skillTree ? (
               <div className="w-full h-full">
                 <SvgSkillTree
                    skillTree={skillTree}
                    completedNodes={userProgress}
                    onNodeClick={handleNodeClick}
                 />
               </div>
             ) : (
               <p className="text-muted-foreground">Skill tree not available for this subject yet.</p>
             )}
           </CardContent>
         </Card>

         {/* Selected Node Details Area */}
          <Card className={`lg:w-1/3 shadow-md ${selectedNode ? 'animate-in fade-in' : 'hidden lg:block lg:opacity-50'}`}>
             <CardHeader>
                <CardTitle>Node Details</CardTitle>
                <CardDescription>
                   {selectedNode ? `Details for "${selectedNode.name}"` : "Select a node from the tree."}
                </CardDescription>
             </CardHeader>
             {selectedNode ? (
                <CardContent className="space-y-4">
                   <h3 className="text-lg font-semibold">{selectedNode.name}</h3>
                   <p className="text-sm text-muted-foreground">{selectedNode.description}</p>
                   {selectedNode.dependencies.length > 0 && (
                       <div>
                           <h4 className="text-sm font-medium mb-1">Prerequisites:</h4>
                           <ul className="list-disc list-inside text-xs space-y-1">
                              {selectedNode.dependencies.map(depId => {
                                   const depNode = skillTree?.nodes.find(n => n.id === depId);
                                   const isDepMet = userProgress.includes(depId);
                                   return (
                                       <li key={depId} className={isDepMet ? 'text-green-600 flex items-center' : 'text-muted-foreground flex items-center'}>
                                           {isDepMet ? <CheckCircle className="h-3 w-3 mr-1 inline-block"/> : <Lock className="h-3 w-3 mr-1 inline-block"/>}
                                            {depNode?.name || depId}
                                       </li>
                                   );
                               })}
                           </ul>
                       </div>
                   )}

                   {!isSelectedNodeCompleted && areSelectedNodeDepsMet && (
                       <button
                         onClick={() => markNodeAsComplete(selectedNode.id)}
                         disabled={isUpdatingProgress}
                         className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 mt-4" // Manually styled button
                       >
                         {isUpdatingProgress ? (
                             <>
                               <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Marking...
                             </>
                         ) : (
                             <>
                               <CheckCircle className="mr-2 h-4 w-4" /> Mark as Complete
                             </>
                         )}
                       </button>
                   )}
                    {isSelectedNodeCompleted && (
                       <p className="text-sm font-semibold text-green-600 flex items-center mt-4">
                           <CheckCircle className="h-4 w-4 mr-1"/> Completed!
                       </p>
                    )}
                    {!areSelectedNodeDepsMet && !isSelectedNodeCompleted && (
                        <p className="text-sm font-semibold text-amber-600 flex items-center mt-4">
                           <Lock className="h-4 w-4 mr-1"/> Locked - Complete prerequisites first.
                        </p>
                    )}
                    {/* Add links to resources/quizzes/tutors for this node */}

                </CardContent>
             ) : (
                 <CardContent>
                     <p className="text-muted-foreground text-center py-10">Click on an unlocked node in the skill tree to see more information and mark it as complete.</p>
                 </CardContent>
             )}
          </Card>
      </div>
    </div>
  );
}
