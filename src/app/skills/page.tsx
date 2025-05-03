'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'; // Added CardFooter
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button'; // Import Button
import { Trees, CheckCircle, Lock, Loader2, BookOpen, Lightbulb, LinkIcon } from 'lucide-react'; // Added relevant icons
import { useToast } from '@/hooks/use-toast'; // Import useToast

// Mock Skill Tree Data Interface
interface SkillNode {
  id: string;
  name: string;
  description: string;
  dependencies: string[]; // IDs of nodes that must be completed first
  position: { x: number; y: number }; // Coordinates for visualization
  resources?: { // Optional learning resources
    link: string;
    label: string;
    type: 'lesson' | 'quiz' | 'tutor';
  }[];
}

interface SkillTree {
  subject: string;
  nodes: SkillNode[];
}

// Mock User ID
const userId = 'user123';

// Mock function to fetch skill tree data - replace with actual API call
const fetchSkillTree = async (subject: string): Promise<SkillTree | null> => {
  console.log(`Fetching skill tree for subject: ${subject}`);
  await new Promise(resolve => setTimeout(resolve, 800));

  const trees: Record<string, SkillTree> = {
    Mathematics: {
      subject: 'Mathematics',
      nodes: [
        { id: 'alg1', name: 'Algebra Basics', description: 'Understand variables, expressions, and solving simple equations.', dependencies: [], position: { x: 50, y: 50 }, resources: [{ link: '/lessons/alg1', label: 'Algebra Basics Lesson', type: 'lesson'}, { link: '/quizzes/alg1', label: 'Algebra Basics Quiz', type: 'quiz' }] },
        { id: 'geo1', name: 'Geometry Intro', description: 'Learn about points, lines, angles, and basic shapes.', dependencies: [], position: { x: 50, y: 200 }, resources: [{ link: '/lessons/geo1', label: 'Geometry Intro Lesson', type: 'lesson'}] },
        { id: 'alg2', name: 'Linear Equations', description: 'Solve single and systems of linear equations, graph lines.', dependencies: ['alg1'], position: { x: 250, y: 50 }, resources: [{ link: '/lessons/alg2', label: 'Linear Equations Lesson', type: 'lesson'}, { link: '/tutors?subject=algebra', label: 'Find an Algebra Tutor', type: 'tutor'}] },
        { id: 'alg3', name: 'Quadratics', description: 'Master factoring, the quadratic formula, and graphing parabolas.', dependencies: ['alg2'], position: { x: 450, y: 50 }, resources: [{ link: '/quizzes/alg3', label: 'Quadratics Quiz', type: 'quiz'}] },
        { id: 'trig1', name: 'Trigonometry Basics', description: 'Introduction to sine, cosine, tangent, and the unit circle.', dependencies: ['geo1', 'alg2'], position: { x: 350, y: 200 }, resources: [{ link: '/lessons/trig1', label: 'Trigonometry Lesson', type: 'lesson'}]},
        { id: 'calc1', name: 'Intro to Calculus', description: 'Grasp the concepts of limits and derivatives.', dependencies: ['alg3', 'trig1'], position: { x: 600, y: 125 }, resources: [{ link: '/lessons/calc1', label: 'Calculus Intro', type: 'lesson'}, { link: '/tutors?subject=calculus', label: 'Find a Calculus Tutor', type: 'tutor'}] },
      ],
    },
    Science: {
       subject: 'Science',
       nodes: [
          { id: 'bio1', name: 'Cell Biology', description: 'Structure and function of prokaryotic and eukaryotic cells.', dependencies: [], position: { x: 50, y: 50 } },
          { id: 'chem1', name: 'Basic Chemistry', description: 'Atoms, molecules, bonding, and basic reactions.', dependencies: [], position: { x: 50, y: 150 } },
          { id: 'bio2', name: 'Genetics', description: 'Fundamentals of heredity, DNA, RNA, and protein synthesis.', dependencies: ['bio1'], position: { x: 250, y: 50 } },
          { id: 'chem2', name: 'Organic Chemistry', description: 'Introduction to carbon compounds and functional groups.', dependencies: ['chem1'], position: { x: 250, y: 150 } },
          { id: 'phys1', name: 'Intro to Physics', description: 'Concepts of motion, forces, energy, and work (requires basic algebra).', dependencies: ['chem1'], position: { x: 250, y: 250 } }, // Assumes chem1 implies enough math for basic physics
           { id: 'eco1', name: 'Ecology Basics', description: 'Ecosystems, populations, and interactions.', dependencies: ['bio1'], position: { x: 450, y: 50 } },
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
   try {
        const storedProgress = localStorage.getItem(`tutorverseProgress_${userId}`);
        if (storedProgress) {
           return JSON.parse(storedProgress) as string[];
        }
   } catch (error) { console.error("Error reading progress:", error); }
  return ['alg1', 'geo1']; // Example default progress
};

// Mock function to update user progress - replace with actual API call
const updateUserProgress = async (userId: string, completedNodeId: string): Promise<boolean> => {
    console.log(`Updating progress for user ${userId}, adding node ${completedNodeId}`);
    await new Promise(resolve => setTimeout(resolve, 400)); // Simulate save delay
    try {
         const currentProgress = await fetchUserProgress(userId);
         if (!currentProgress.includes(completedNodeId)) {
             const updatedProgress = [...currentProgress, completedNodeId];
             localStorage.setItem(`tutorverseProgress_${userId}`, JSON.stringify(updatedProgress));
         }
         return true;
    } catch (error) { console.error("Error updating progress:", error); return false; }
}


// --- SVG Skill Tree Visualization ---

interface SvgSkillTreeProps {
  skillTree: SkillTree;
  completedNodes: string[];
  onNodeClick: (node: SkillNode) => void;
  selectedNodeId?: string | null; // Highlight selected node
  viewBoxWidth?: number;
  viewBoxHeight?: number;
}

const SvgSkillTree: React.FC<SvgSkillTreeProps> = ({
  skillTree,
  completedNodes,
  onNodeClick,
  selectedNodeId,
  viewBoxWidth = 800,
  viewBoxHeight = 450, // Increased height
}) => {
  const nodeRadius = 30; // Slightly larger nodes
  const nodeStrokeWidth = 2.5;
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
      className="overflow-visible"
    >
      {/* Lines */}
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="7" refY="3.5" orient="auto" markerUnits="strokeWidth">
          <polygon points="0 0, 10 3.5, 0 7" className="fill-current text-muted-foreground" />
        </marker>
         <marker id="arrowhead-completed" markerWidth="10" markerHeight="7" refX="7" refY="3.5" orient="auto" markerUnits="strokeWidth">
          <polygon points="0 0, 10 3.5, 0 7" className="fill-current text-primary" />
        </marker>
      </defs>
      <g className="lines">
        {skillTree.nodes.map(node =>
          node.dependencies.map(depId => {
            const depNode = getNodeById(depId);
            if (!depNode) return null;

            const startX = depNode.position.x;
            const startY = depNode.position.y;
            const endX = node.position.x;
            const endY = node.position.y;

            const angle = Math.atan2(endY - startY, endX - startX);
            const adjustedEndX = endX - Math.cos(angle) * (nodeRadius + nodeStrokeWidth);
            const adjustedEndY = endY - Math.sin(angle) * (nodeRadius + nodeStrokeWidth);
            const adjustedStartX = startX + Math.cos(angle) * (nodeRadius + nodeStrokeWidth); // Adjust start point too
            const adjustedStartY = startY + Math.sin(angle) * (nodeRadius + nodeStrokeWidth);

            const isDepCompleted = isNodeCompleted(depId);
            const strokeColor = isDepCompleted ? 'hsl(var(--primary))' : 'hsl(var(--border))';
            const markerId = isDepCompleted ? "url(#arrowhead-completed)" : "url(#arrowhead)";

            return (
              <line
                key={`${depId}-${node.id}`}
                x1={adjustedStartX}
                y1={adjustedStartY}
                x2={adjustedEndX}
                y2={adjustedEndY}
                stroke={strokeColor}
                strokeWidth={lineStrokeWidth}
                markerEnd={markerId}
                className="transition-colors duration-300"
              />
            );
          })
        )}
      </g>

      {/* Nodes */}
      <g className="nodes">
        {skillTree.nodes.map(node => {
          const completed = isNodeCompleted(node.id);
          const dependenciesMet = areDependenciesMet(node);
          const locked = !dependenciesMet && !completed;
          const isSelected = node.id === selectedNodeId;

          let fillColor = 'hsl(var(--card))';
          let strokeColor = 'hsl(var(--border))';
          let textColor = 'hsl(var(--muted-foreground))';
          let icon = null;
          let cursor = locked ? 'not-allowed' : 'pointer';
           let additionalClasses = '';

          if (completed) {
            fillColor = 'hsla(var(--primary)/0.8)'; // More opaque completed
            strokeColor = 'hsl(var(--primary))';
            textColor = 'hsl(var(--primary-foreground))';
            icon = <CheckCircle className="h-4 w-4 text-primary-foreground" />;
          } else if (dependenciesMet) {
            fillColor = 'hsl(var(--background))';
            strokeColor = 'hsl(var(--accent))';
            textColor = 'hsl(var(--accent))'; // Make text accent color for ready nodes
             additionalClasses = 'animate-pulse-border'; // Add subtle pulse/glow effect
          } else { // Locked
            fillColor = 'hsl(var(--muted))';
            strokeColor = 'hsl(var(--border))';
            textColor = 'hsl(var(--muted-foreground))';
            icon = <Lock className="h-3 w-3 text-muted-foreground" />;
             additionalClasses = 'opacity-60'; // Dim locked nodes
          }

           // Highlight selected node
           if (isSelected) {
              strokeColor = 'hsl(var(--ring))'; // Use ring color for selection border
              additionalClasses += ' scale-110'; // Slightly larger selected
           }

          return (
            <g
              key={node.id}
              transform={`translate(${node.position.x}, ${node.position.y})`}
              className={`transition-all duration-200 ease-in-out ${additionalClasses}`}
              style={{ cursor }}
              onClick={() => !locked && onNodeClick(node)}
              tabIndex={locked ? -1 : 0} // Make focusable if not locked
              aria-label={`${node.name}${completed ? ' (Completed)' : locked ? ' (Locked)' : ' (Ready)'}`}
               onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') !locked && onNodeClick(node); }}
            >
              <title>{`${node.name}${completed ? ' (Completed)' : locked ? ' (Locked)' : ' (Ready)'}\n${node.description}`}</title>
              <circle
                cx="0"
                cy="0"
                r={nodeRadius}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={nodeStrokeWidth}
                className="transition-colors duration-300"
              />
              {icon && (
                <foreignObject x={-nodeRadius / 2} y={-nodeRadius / 1.5} width={nodeRadius} height={nodeRadius}>
                   <div className="flex justify-center items-center h-full">
                      {React.cloneElement(icon)}
                   </div>
                </foreignObject>
              )}

              {/* Text - basic wrapping */}
              <text
                x="0"
                y={icon ? 10 : 5} // Position text lower if there's an icon
                textAnchor="middle"
                fontSize="9" // Slightly smaller text for more room
                fontWeight="500" // Medium weight
                fill={textColor}
                className="select-none pointer-events-none transition-colors duration-300"
              >
                {node.name.split(' ').map((word, index, words) => {
                  // Simple check for line break (adjust threshold as needed)
                  const lineBreak = index > 0 && words.slice(0, index+1).join(' ').length > 12; // Break approx every 12 chars
                  return (
                   <tspan key={index} x="0" dy={index === 0 || lineBreak ? '1.1em' : 0}>
                       {word + (index < words.length -1 ? ' ' : '')}
                   </tspan>
                  )
                 })}
              </text>
            </g>
          );
        })}
      </g>
      <style jsx>{`
         @keyframes pulse-border {
           0%, 100% { stroke: hsl(var(--accent)); opacity: 1; }
           50% { stroke: hsl(var(--accent) / 0.5); opacity: 0.7; }
         }
         .animate-pulse-border > circle {
           animation: pulse-border 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
         }
       `}</style>
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
   const { toast } = useToast();

  const subjects = ['Mathematics', 'Science']; // Subjects with defined trees

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setSelectedNode(null);
      try {
        const [treeData, progressData] = await Promise.all([
          fetchSkillTree(selectedSubject),
          fetchUserProgress(userId),
        ]);
        setSkillTree(treeData);
        setUserProgress(progressData);
      } catch (error) {
        console.error("Failed to load skill tree data:", error);
         toast({ title: "Error Loading Tree", description: "Could not load the skill tree. Please try again.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [selectedSubject, userId, toast]); // Added toast to dependency array

  const handleNodeClick = (node: SkillNode) => {
    setSelectedNode(node);
  };

   const markNodeAsComplete = async (nodeId: string) => {
       if (userProgress.includes(nodeId) || isUpdatingProgress) return;

       setIsUpdatingProgress(true);
       const success = await updateUserProgress(userId, nodeId);
       if (success) {
           setUserProgress(prev => [...prev, nodeId]);
            setSelectedNode(null); // Close details pane
            toast({ title: "Skill Unlocked!", description: `You've marked "${skillTree?.nodes.find(n=>n.id===nodeId)?.name}" as complete.` });
       } else {
            toast({ title: "Update Failed", description: "Could not update your progress. Please try again.", variant: "destructive" });
       }
       setIsUpdatingProgress(false);
   }

    const isSelectedNodeCompleted = selectedNode && userProgress.includes(selectedNode.id);
    const areSelectedNodeDepsMet = selectedNode && selectedNode.dependencies.every(depId => userProgress.includes(depId));
    const canCompleteSelectedNode = selectedNode && !isSelectedNodeCompleted && areSelectedNodeDepsMet;

   // Calculate overall progress percentage
   const progressPercentage = useMemo(() => {
     if (!skillTree || skillTree.nodes.length === 0) return 0;
     return Math.round((userProgress.length / skillTree.nodes.length) * 100);
   }, [userProgress, skillTree]);


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 text-center flex items-center justify-center">
        <Trees className="h-8 w-8 mr-2 text-primary" /> Skill Tree Learning Map
      </h1>
      <p className="text-muted-foreground mb-6 text-center max-w-2xl mx-auto">
        Visualize your learning path! Unlock new skills and track your mastery in {selectedSubject}.
      </p>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="w-full sm:w-[240px]">
            <SelectValue placeholder="Select Subject" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map(subject => (
              <SelectItem key={subject} value={subject}>
                {subject}
              </SelectItem>
            ))}
             <SelectItem value="History" disabled>History (Coming Soon)</SelectItem>
          </SelectContent>
        </Select>
         <div className="text-sm font-medium text-muted-foreground w-full sm:w-auto text-center sm:text-right">
            Progress: {progressPercentage}% Complete ({userProgress.length} / {skillTree?.nodes.length || 0} skills)
         </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
         {/* Skill Tree */}
         <Card className="flex-grow lg:w-2/3 shadow-md overflow-hidden">
           <CardHeader>
             <CardTitle>{selectedSubject} Skill Tree</CardTitle>
             <CardDescription>Click an unlocked node for details. Completed nodes are blue.</CardDescription>
           </CardHeader>
           <CardContent className="min-h-[450px] flex items-center justify-center relative p-2 md:p-4">
             {isLoading ? (
               <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
             ) : skillTree ? (
               <div className="w-full h-full">
                 <SvgSkillTree
                    skillTree={skillTree}
                    completedNodes={userProgress}
                    onNodeClick={handleNodeClick}
                    selectedNodeId={selectedNode?.id}
                 />
               </div>
             ) : (
               <p className="text-muted-foreground text-center p-10">Select a subject to view its skill tree.</p>
             )}
           </CardContent>
         </Card>

         {/* Details Pane */}
          <Card className={`lg:w-1/3 shadow-md transition-opacity duration-300 ${selectedNode ? 'opacity-100' : 'opacity-50 lg:opacity-100'}`}>
             <CardHeader>
                <CardTitle>Skill Details</CardTitle>
                <CardDescription>
                   {selectedNode ? `"${selectedNode.name}"` : "Select an unlocked node"}
                </CardDescription>
             </CardHeader>
             <CardContent className="space-y-4 min-h-[200px]">
                 {selectedNode ? (
                     <>
                         <p className="text-sm text-muted-foreground">{selectedNode.description}</p>
                         {selectedNode.dependencies.length > 0 && (
                             <div>
                                 <h4 className="text-sm font-medium mb-1">Prerequisites:</h4>
                                 <ul className="list-none space-y-1">
                                     {selectedNode.dependencies.map(depId => {
                                         const depNode = skillTree?.nodes.find(n => n.id === depId);
                                         const isDepMet = userProgress.includes(depId);
                                         return (
                                             <li key={depId} className={`flex items-center text-xs ${isDepMet ? 'text-green-600' : 'text-muted-foreground'}`}>
                                                 {isDepMet ? <CheckCircle className="h-3 w-3 mr-1.5 shrink-0"/> : <Lock className="h-3 w-3 mr-1.5 shrink-0"/>}
                                                 {depNode?.name || depId}
                                             </li>
                                         );
                                     })}
                                 </ul>
                             </div>
                         )}
                          {/* Resource Links */}
                          {selectedNode.resources && selectedNode.resources.length > 0 && (
                              <div className="pt-3 border-t">
                                 <h4 className="text-sm font-medium mb-2">Learning Resources:</h4>
                                  <div className="space-y-2">
                                     {selectedNode.resources.map(res => (
                                         <a
                                             key={res.link}
                                             href={res.link} // In Next.js use <Link href={res.link}>
                                             target="_blank" // Open resources in new tab
                                             rel="noopener noreferrer"
                                             className="flex items-center text-sm text-primary hover:underline"
                                         >
                                             {res.type === 'lesson' && <BookOpen className="h-4 w-4 mr-1.5 shrink-0"/>}
                                             {res.type === 'quiz' && <Lightbulb className="h-4 w-4 mr-1.5 shrink-0"/>}
                                             {res.type === 'tutor' && <Users className="h-4 w-4 mr-1.5 shrink-0"/>}
                                             {res.label}
                                             <LinkIcon className="h-3 w-3 ml-1 opacity-70"/>
                                         </a>
                                     ))}
                                  </div>
                              </div>
                          )}
                     </>
                 ) : (
                     <p className="text-muted-foreground text-center py-10">Click on an unlocked node in the skill tree to view details, access resources, and mark it as complete.</p>
                 )}
             </CardContent>
              {selectedNode && (
                  <CardFooter className="border-t pt-4">
                       {canCompleteSelectedNode ? (
                           <Button
                             onClick={() => markNodeAsComplete(selectedNode.id)}
                             disabled={isUpdatingProgress}
                             className="w-full"
                           >
                             {isUpdatingProgress ? (
                                 <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</>
                             ) : (
                                 <><CheckCircle className="mr-2 h-4 w-4" /> Mark as Complete</>
                             )}
                           </Button>
                       ) : isSelectedNodeCompleted ? (
                           <p className="text-sm font-semibold text-green-600 flex items-center w-full justify-center">
                               <CheckCircle className="h-4 w-4 mr-1"/> Completed!
                           </p>
                       ) : (
                            <p className="text-sm font-semibold text-amber-600 flex items-center w-full justify-center">
                               <Lock className="h-4 w-4 mr-1"/> Locked
                            </p>
                       )}
                  </CardFooter>
              )}
          </Card>
      </div>
    </div>
  );
}
