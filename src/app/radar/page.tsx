'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioTower, Loader2, Activity, TrendingUp, Info } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, Legend } from 'recharts'; // Using recharts via shadcn/ui setup
import { ChartTooltipContent, ChartContainer } from '@/components/ui/chart'; // Using shadcn chart components

// Mock Data Interface
interface TrendingTopic {
  topic: string; // The keyword or phrase
  mentions: number; // Number of times mentioned recently
  difficultyScore?: number; // Optional: Avg perceived difficulty (e.g., based on "stuck" mentions)
}

// Mock function to fetch trending topics - replace with Cloud Function call / Firestore query
const fetchTrendingTopics = async (): Promise<TrendingTopic[]> => {
  console.log('Fetching trending topics...');
  await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate network delay

  // Mock data - In reality, this would come from analyzing recent chat messages, notes, etc.
  return [
    { topic: 'Derivatives', mentions: 25, difficultyScore: 3.5 },
    { topic: 'Newton\'s Laws', mentions: 18, difficultyScore: 2.8 },
    { topic: 'Photosynthesis', mentions: 30, difficultyScore: 2.2 },
    { topic: 'Essay Structure', mentions: 15, difficultyScore: 3.1 },
    { topic: 'Python Loops', mentions: 22, difficultyScore: 2.5 },
    { topic: 'Organic Reactions', mentions: 12, difficultyScore: 4.1 },
    { topic: 'Quadratic Formula', mentions: 28, difficultyScore: 1.9 },
     { topic: 'Cellular Respiration', mentions: 19, difficultyScore: 3.0 },
  ].sort((a, b) => b.mentions - a.mentions); // Sort by mentions desc
};


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
        // Handle error state
      } finally {
        setIsLoading(false);
      }
    };
    loadTopics();
     // Optionally set up a refresh interval or real-time listener
     // const intervalId = setInterval(loadTopics, 60000); // Refresh every minute
     // return () => clearInterval(intervalId);
  }, []);

  // Prepare data for the Radar Chart (top N topics)
  const chartData = useMemo(() => {
    const topN = 8; // Show top 8 topics for clarity
    return topics.slice(0, topN).map(t => ({
      subject: t.topic, // Recharts expects 'subject' key for PolarAngleAxis
      Mentions: t.mentions,
      // Optionally include difficulty - requires dual-axis or different chart
      // Difficulty: t.difficultyScore || 0
    }));
  }, [topics]);

   // Find max mentions for chart domain
   const maxMentions = useMemo(() => {
       if (chartData.length === 0) return 0;
       return Math.max(...chartData.map(d => d.Mentions));
   }, [chartData]);

   const chartConfig = useMemo(() => ({
     Mentions: {
       label: "Mentions",
        // color: "hsl(var(--chart-1))", // Use theme color
        theme: { // Specify light/dark theme colors explicitly if needed
          light: "hsl(var(--chart-1))",
          dark: "hsl(var(--chart-1))",
        },
     },
     // Example if adding difficulty:
     // Difficulty: {
     //   label: "Avg. Difficulty",
     //   color: "hsl(var(--chart-2))",
     // }
   }), []);


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 text-center flex items-center justify-center">
        <RadioTower className="h-8 w-8 mr-2 text-primary animate-pulse" /> Study Radar
      </h1>
      <p className="text-muted-foreground mb-8 text-center max-w-2xl mx-auto">
        Discover what topics are currently trending and being discussed most frequently among students on TutorVerse.
      </p>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
             <TrendingUp className="h-5 w-5 mr-2 text-green-500"/> Trending Topics Radar
          </CardTitle>
          <CardDescription>Visualizing the most mentioned topics right now.</CardDescription>
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
                       content={<ChartTooltipContent indicator="line" labelKey="Mentions" />}
                     />
                     <PolarGrid gridType="polygon" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                      {/* Adjust domain based on max mentions */}
                     <PolarRadiusAxis angle={90} domain={[0, Math.ceil(maxMentions / 10) * 10]} tick={false} axisLine={false} />
                     <Radar
                       name="Mentions"
                       dataKey="Mentions"
                       // Use the variable defined in ChartStyle via chartConfig
                       stroke="var(--color-Mentions)"
                       fill="var(--color-Mentions)"
                       fillOpacity={0.6}
                       dot={{ r: 4, fillOpacity: 1 }}
                       activeDot={{ r: 6 }}
                     />
                       {/* Example if adding a second metric like difficulty */}
                       {/* <Radar name="Difficulty" dataKey="Difficulty" stroke="var(--color-Difficulty)" fill="var(--color-Difficulty)" fillOpacity={0.4} /> */}
                      <Legend content={({ payload }) => {
                          return (
                            <div className="flex items-center justify-center gap-4 mt-4">
                              {payload?.map((entry, index) => (
                                <div key={`item-${index}`} className="flex items-center gap-1.5 text-xs">
                                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                  {entry.value}
                                </div>
                              ))}
                            </div>
                          )
                        }} />
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
             <Info className="h-4 w-4 mr-2 shrink-0"/> Data is based on recent activity across sessions and notes (updated periodically). Difficulty scores are experimental.
         </CardFooter>
      </Card>

       {/* Optional: List view of topics */}
       {/* <Card className="mt-6">
           <CardHeader><CardTitle>Top Topics List</CardTitle></CardHeader>
           <CardContent>
               {isLoading ? <p>Loading...</p> : (
                   <ul className="space-y-2">
                       {topics.map(topic => (
                           <li key={topic.topic} className="flex justify-between items-center text-sm p-2 border-b">
                               <span>{topic.topic}</span>
                               <span className="text-muted-foreground">{topic.mentions} mentions</span>
                           </li>
                       ))}
                   </ul>
               )}
           </CardContent>
       </Card> */}
    </div>
  );
}
