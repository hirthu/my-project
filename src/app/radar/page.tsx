'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { RadioTower, Loader2, Activity, TrendingUp, Info, Sparkles, BookOpen } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, Legend } from 'recharts';
import { ChartTooltipContent, ChartContainer } from '@/components/ui/chart';
import { Button } from '@/components/ui/button'; // Import Button
import Link from 'next/link'; // Import Link

// Mock Data Interface
interface TrendingTopic {
  id: string; // Unique ID for the topic (e.g., 'calculus-derivatives')
  topic: string; // Display name
  mentions: number; // Number of times mentioned recently
  difficultyScore?: number; // Avg perceived difficulty (1-5 scale)
  relatedSubject: string; // e.g., 'Mathematics'
}

// Mock function to fetch trending topics - replace with Cloud Function / Firestore aggregation
const fetchTrendingTopics = async (): Promise<TrendingTopic[]> => {
  console.log('Fetching trending topics...');
  await new Promise(resolve => setTimeout(resolve, 1200));

  // Mock data - More realistic mentions and difficulty
  return [
    { id: 'calculus-derivatives', topic: 'Derivatives', mentions: 35, difficultyScore: 3.8, relatedSubject: 'Mathematics' },
    { id: 'physics-newton', topic: 'Newton\'s Laws', mentions: 28, difficultyScore: 3.1, relatedSubject: 'Science' },
    { id: 'biology-photosynthesis', topic: 'Photosynthesis', mentions: 42, difficultyScore: 2.5, relatedSubject: 'Science' },
    { id: 'english-essay', topic: 'Essay Structure', mentions: 25, difficultyScore: 3.3, relatedSubject: 'English' },
    { id: 'cs-python-loops', topic: 'Python Loops', mentions: 31, difficultyScore: 2.8, relatedSubject: 'Computer Science' },
    { id: 'chem-organic-reactions', topic: 'Organic Reactions', mentions: 18, difficultyScore: 4.5, relatedSubject: 'Science' },
    { id: 'math-quadratics', topic: 'Quadratic Formula', mentions: 39, difficultyScore: 2.1, relatedSubject: 'Mathematics' },
    { id: 'biology-respiration', topic: 'Cell Respiration', mentions: 29, difficultyScore: 3.5, relatedSubject: 'Science' },
     { id: 'history-world-war-1', topic: 'World War I Causes', mentions: 22, difficultyScore: 3.0, relatedSubject: 'History' },
  ].sort((a, b) => b.mentions - a.mentions);
};

// --- Component ---
export default function StudyRadarPage() {
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTopics = async () => {
      setIsLoading(true);
      try {
        const fetchedTopics = await fetchTrendingTopics();
        setTopics(fetchedTopics);
      } catch (error) {
        console.error("Failed to load trending topics:", error);
        // Handle error state (e.g., show toast)
      } finally {
        setIsLoading(false);
      }
    };
    loadTopics();
     // Optional: Refresh data periodically
     // const intervalId = setInterval(loadTopics, 60000); // Refresh every minute
     // return () => clearInterval(intervalId);
  }, []);

  // Prepare data for the Radar Chart (top N topics, focusing on mentions and difficulty)
  const chartData = useMemo(() => {
    const topN = 8; // Limit chart complexity
    return topics.slice(0, topN).map(t => ({
      subject: t.topic, // Recharts expects 'subject' key for PolarAngleAxis
      Mentions: t.mentions,
      Difficulty: t.difficultyScore || 0, // Use 0 if undefined
      // Add other metrics if needed
    }));
  }, [topics]);

   // Find max values for chart domains
   const maxMentions = useMemo(() => Math.max(10, ...chartData.map(d => d.Mentions)), [chartData]); // Ensure minimum domain of 10
   const maxDifficulty = 5; // Assuming a 1-5 scale

   // Configure chart colors and labels using useMemo
   const chartConfig = useMemo(() => ({
     Mentions: {
       label: "Mentions",
        color: "hsl(var(--chart-1))", // Use theme color variable
     },
     Difficulty: {
       label: "Avg. Difficulty",
       color: "hsl(var(--chart-2))",
     }
   }), []);


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 text-center flex items-center justify-center">
        <RadioTower className="h-8 w-8 mr-2 text-primary animate-pulse" /> Study Radar
      </h1>
      <p className="text-muted-foreground mb-8 text-center max-w-2xl mx-auto">
        Discover what's buzzing! See the most frequently discussed topics and perceived difficulty across TutorVerse right now.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Radar Chart Card */}
         <Card className="shadow-lg lg:col-span-2">
           <CardHeader>
             <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-500"/> Trending Topics Radar
             </CardTitle>
             <CardDescription>Visualizing the top {chartData.length} most mentioned topics and their average perceived difficulty.</CardDescription>
           </CardHeader>
           <CardContent>
             {isLoading ? (
               <div className="flex items-center justify-center h-[400px]">
                 <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
               </div>
             ) : chartData.length > 0 ? (
                <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[450px]">
                   <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent indicator="line" />} // Let tooltip show both values
                        />
                        <PolarGrid gridType="polygon" className="stroke-border/50" />
                         <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }} className="text-muted-foreground"/>
                         {/* Multiple Radius Axes for different scales */}
                        <PolarRadiusAxis angle={90} dataKey="Mentions" domain={[0, Math.ceil(maxMentions / 10) * 10]} orientation="left" axisLine={false} tick={false} />
                        <PolarRadiusAxis angle={90} dataKey="Difficulty" domain={[0, maxDifficulty]} orientation="right" axisLine={false} tick={false} />

                        <Radar
                          name="Mentions"
                          dataKey="Mentions"
                          stroke="var(--color-Mentions)"
                          fill="var(--color-Mentions)"
                          fillOpacity={0.5}
                          dot={{ r: 3, fillOpacity: 0.8 }}
                          activeDot={{ r: 5 }}
                        />
                         <Radar
                           name="Difficulty"
                           dataKey="Difficulty"
                           stroke="var(--color-Difficulty)"
                           fill="var(--color-Difficulty)"
                           fillOpacity={0.3}
                            dot={{ r: 3, fillOpacity: 0.8 }}
                            activeDot={{ r: 5 }}
                         />
                         <Legend content={<ChartLegend content={undefined} />} />
                      </RadarChart>
                    </ResponsiveContainer>
                </ChartContainer>
             ) : (
               <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                  <Activity className="h-12 w-12 mb-4"/>
                  <p>No trending data available at the moment.</p>
               </div>
             )}
           </CardContent>
            <CardFooter className="text-xs text-muted-foreground border-t pt-4">
                <Info className="h-4 w-4 mr-2 shrink-0"/> Data aggregates recent anonymous activity (chats, notes). Difficulty is based on user interactions indicating struggle (e.g., "help", "stuck"). Updates periodically.
            </CardFooter>
         </Card>

          {/* Topic List Card */}
          <Card className="shadow-sm">
             <CardHeader>
                <CardTitle className="text-lg flex items-center"><Sparkles className="h-5 w-5 mr-2 text-amber-500"/> Hot Topics List</CardTitle>
                <CardDescription>Explore resources for currently trending topics.</CardDescription>
             </CardHeader>
             <CardContent>
                 {isLoading ? (
                    <div className="space-y-3">
                       {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                    </div>
                 ) : topics.length > 0 ? (
                     <ScrollArea className="h-[400px] pr-3 -mr-3">
                        <ul className="space-y-3">
                            {topics.map(topic => (
                               <li key={topic.id} className="flex items-center justify-between p-2 border rounded-md hover:bg-muted/50 transition-colors">
                                  <div className="flex flex-col overflow-hidden">
                                     <span className="font-medium text-sm truncate" title={topic.topic}>{topic.topic}</span>
                                     <span className="text-xs text-muted-foreground">
                                        {topic.relatedSubject} - {topic.mentions} mentions
                                         {topic.difficultyScore && ` (Difficulty: ${topic.difficultyScore.toFixed(1)}/5)`}
                                     </span>
                                  </div>
                                   {/* Link to explore resources or find tutors for this topic */}
                                  <Link href={`/explore?topic=${encodeURIComponent(topic.topic)}&subject=${encodeURIComponent(topic.relatedSubject)}`} passHref>
                                     <Button variant="ghost" size="sm" className="ml-2 shrink-0 text-primary hover:text-primary">
                                        <BookOpen className="h-4 w-4 mr-1"/> Explore
                                     </Button>
                                  </Link>
                               </li>
                            ))}
                        </ul>
                     </ScrollArea>
                 ) : (
                      <p className="text-sm text-muted-foreground text-center py-6">No topics trending right now.</p>
                 )}
             </CardContent>
          </Card>

      </div>
    </div>
  );
}

// Custom Legend component for ShadCN Charts
const ChartLegend = ({ payload }: { payload?: Array<any>, content: any }) => {
  const { config } = useChart();

  if (!payload) return null;

  return (
    <div className="flex items-center justify-center gap-4 mt-4">
      {payload.map((entry) => {
        const itemConfig = config[entry.dataKey as keyof typeof config];
        if (!itemConfig) return null;
        return (
          <div key={entry.dataKey} className="flex items-center gap-1.5 text-xs">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: `var(--color-${entry.dataKey})` }} />
            {itemConfig.label || entry.dataKey}
          </div>
        );
      })}
    </div>
  );
};

// Ensure useChart hook is defined (assuming it comes from chart context setup)
// This is a simplified placeholder - replace with actual useChart import if needed
const useChart = () => {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a ChartContainer");
  }
  return context;
};
// Assuming ChartContext is also defined elsewhere like in chart.tsx
const ChartContext = React.createContext<{ config: any } | null>(null);

