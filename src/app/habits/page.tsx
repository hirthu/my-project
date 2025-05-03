'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'; // Added CardFooter
import { Button } from '@/components/ui/button';
import { Repeat, Zap, CalendarCheck, Clock, BarChart, Target, Award, Loader2, Info } from 'lucide-react'; // Added Info
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast'; // Import useToast

// Mock Data Interface
interface HabitData {
  userId: string;
  loginStreak: number;
  sessionsAttendedThisWeek: number;
  practiceMinutesThisWeek: number;
  lastLogin: Date | null;
  // Goals
  weeklySessionGoal: number;
  weeklyPracticeGoal: number; // in minutes
}

// Mock User ID
const userId = 'user123';

// --- Mock API Functions ---

// Fetch habit data - replace with Firestore query
const fetchHabitData = async (userId: string): Promise<HabitData> => {
  console.log(`Fetching habit data for user ${userId}...`);
  await new Promise(resolve => setTimeout(resolve, 700));

    try {
        const storedData = localStorage.getItem(`tutorverseHabits_${userId}`);
        if (storedData) {
            const parsed = JSON.parse(storedData) as any; // Use any for date parsing
            return {
               ...parsed,
               userId: userId,
               lastLogin: parsed.lastLogin ? new Date(parsed.lastLogin) : null,
               // Ensure defaults if goals are missing
               weeklySessionGoal: parsed.weeklySessionGoal ?? 3,
               weeklyPracticeGoal: parsed.weeklyPracticeGoal ?? 120,
            };
        }
    } catch (error) { console.error("Error reading habits:", error); }

  // Default mock data if nothing found
  return {
    userId: userId,
    loginStreak: 0, // Start at 0, update on load
    sessionsAttendedThisWeek: 0,
    practiceMinutesThisWeek: 0,
    lastLogin: null,
    weeklySessionGoal: 3,
    weeklyPracticeGoal: 120,
  };
};

// Update habit data - replace with Firestore update/Cloud Function trigger
const updateHabitData = async (userId: string, updates: Partial<Omit<HabitData, 'userId' | 'lastLogin'>>): Promise<HabitData> => {
    console.log(`Updating habit data for ${userId}:`, updates);
    await new Promise(resolve => setTimeout(resolve, 300));

    let currentData = await fetchHabitData(userId); // Get current state
    let newData = { ...currentData, ...updates }; // Apply updates

    // --- Login Streak Logic ---
    const today = new Date(); today.setHours(0,0,0,0);
    const lastLog = currentData.lastLogin ? new Date(currentData.lastLogin) : null;
    if (lastLog) lastLog.setHours(0,0,0,0);

    const isSameDayLogin = lastLog && lastLog.getTime() === today.getTime();

    if (!isSameDayLogin) { // Only update streak if it's a new day login
        if (lastLog) {
            const diffDays = (today.getTime() - lastLog.getTime()) / (1000 * 3600 * 24);
            if (diffDays === 1) {
                newData.loginStreak = (currentData.loginStreak || 0) + 1; // Increment streak
            } else if (diffDays > 1) {
                newData.loginStreak = 1; // Reset streak if missed more than a day
            }
            // If diffDays <= 0 (shouldn't happen with !isSameDayLogin), streak remains
        } else {
             newData.loginStreak = 1; // First login ever
        }
        newData.lastLogin = new Date(); // Update lastLogin timestamp only on new day login
    }
     // If it *is* the same day, don't change streak or lastLogin for streak purposes

     // --- Weekly Reset Logic (Simplified Example) ---
     // In a real app, use server-side logic (Cloud Function) and track week start/end
     const currentWeek = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7));
     const storedWeek = localStorage.getItem(`tutorverseHabitsWeek_${userId}`);
     if (!storedWeek || parseInt(storedWeek) < currentWeek) {
         console.log("New week detected, resetting weekly stats.");
         newData.sessionsAttendedThisWeek = updates.sessionsAttendedThisWeek ?? 0; // Start fresh with current update or 0
         newData.practiceMinutesThisWeek = updates.practiceMinutesThisWeek ?? 0;
         localStorage.setItem(`tutorverseHabitsWeek_${userId}`, currentWeek.toString());
     } else {
        // Accumulate if within the same week
         if (updates.sessionsAttendedThisWeek !== undefined) {
            newData.sessionsAttendedThisWeek = (currentData.sessionsAttendedThisWeek || 0) + updates.sessionsAttendedThisWeek;
         }
          if (updates.practiceMinutesThisWeek !== undefined) {
            newData.practiceMinutesThisWeek = (currentData.practiceMinutesThisWeek || 0) + updates.practiceMinutesThisWeek;
         }
     }


    // Save the final updated state
     try {
        localStorage.setItem(`tutorverseHabits_${userId}`, JSON.stringify(newData));
        return newData; // Return the fully updated data
     } catch (error) {
        console.error("Error saving habits:", error);
        throw error; // Rethrow error to be caught by caller
     }
}


// --- Page Component ---
export default function HabitTrackerPage() {
  const [habitData, setHabitData] = useState<HabitData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load data and simulate login on mount
  const loadDataAndLogLogin = useCallback(async () => {
    setIsLoading(true);
    try {
        // Trigger updateHabitData to check/update login streak
        const data = await updateHabitData(userId, {}); // Empty update just logs login
        setHabitData(data);
    } catch (error) {
      console.error("Failed to load habit data:", error);
      toast({ title: "Error", description: "Could not load habit tracking data.", variant: "destructive"});
    } finally {
      setIsLoading(false);
    }
  }, [toast]); // Include toast in dependencies

  useEffect(() => {
    loadDataAndLogLogin();
  }, [loadDataAndLogLogin]);


   // Simulate adding practice time
   const logPracticeTime = async (minutes: number) => {
      if (!habitData) return;
      console.log(`Logging ${minutes} minutes of practice...`);
      try {
         // Optimistic update (optional but improves perceived speed)
         setHabitData(prev => prev ? ({
             ...prev,
             practiceMinutesThisWeek: (prev.practiceMinutesThisWeek || 0) + minutes
         }) : null);
          const updatedData = await updateHabitData(userId, { practiceMinutesThisWeek: minutes });
         setHabitData(updatedData); // Update with confirmed data
         toast({title: "Practice Logged!", description: `${minutes} minutes added to your weekly total.`});
      } catch (error) {
         toast({ title: "Error", description: "Could not log practice time.", variant: "destructive"});
         loadDataAndLogLogin(); // Reload data on error
      }
   }

   // Simulate attending a session
    const logSessionAttended = async () => {
       if (!habitData) return;
       console.log("Logging session attendance...");
        try {
            setHabitData(prev => prev ? ({
                ...prev,
                sessionsAttendedThisWeek: (prev.sessionsAttendedThisWeek || 0) + 1
            }) : null);
           const updatedData = await updateHabitData(userId, { sessionsAttendedThisWeek: 1 }); // Send increment of 1
           setHabitData(updatedData);
           toast({title: "Session Logged!", description: "Attendance added to your weekly total."});
        } catch (error) {
           toast({ title: "Error", description: "Could not log session attendance.", variant: "destructive"});
           loadDataAndLogLogin(); // Reload data on error
        }
    }


   const getProgress = (value: number | undefined, goal: number | undefined): number => {
       if (goal && goal > 0 && value !== undefined) {
           return Math.min(100, Math.round((value / goal) * 100));
       }
       return 0;
   }

   // Define achievements based on habitData
   const achievements = useMemo(() => {
       if (!habitData) return [];
       const achieved = [];
        if (habitData.loginStreak >= 7) achieved.push({ id: 'streak7', name: '7-Day Streak', icon: Zap, color: 'text-green-600 bg-green-100 dark:bg-green-900' });
        if (habitData.loginStreak >= 3) achieved.push({ id: 'streak3', name: '3-Day Streak', icon: Zap, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900' });
       if (habitData.sessionsAttendedThisWeek >= (habitData.weeklySessionGoal || 3)) achieved.push({ id: 'sessionsGoal', name: 'Weekly Session Goal', icon: CalendarCheck, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900'});
       if (habitData.practiceMinutesThisWeek >= (habitData.weeklyPracticeGoal || 120)) achieved.push({ id: 'practiceGoal', name: 'Weekly Practice Goal', icon: Clock, color: 'text-orange-600 bg-orange-100 dark:bg-orange-900'});
       // Add more complex achievements later
       return achieved;
   }, [habitData]);


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 text-center flex items-center justify-center">
        <Repeat className="h-8 w-8 mr-2 text-primary" /> Habit Loop Tracker
      </h1>
      <p className="text-muted-foreground mb-8 text-center max-w-2xl mx-auto">
        Build consistent study habits! Track your streaks, session attendance, and practice time to stay motivated.
      </p>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
        </div>
      ) : habitData ? (
        <div className="space-y-6">
           {/* Core Stats Grid */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {/* Login Streak Card */}
             <Card className="shadow hover:shadow-md transition-shadow">
               <CardHeader className="flex flex-row items-center justify-between pb-2">
                 <CardTitle className="text-sm font-medium">Login Streak</CardTitle>
                 <Zap className="h-4 w-4 text-yellow-500" />
               </CardHeader>
               <CardContent>
                 <div className="text-2xl font-bold text-primary">{habitData.loginStreak} Day{habitData.loginStreak !== 1 ? 's' : ''}</div>
                 <p className="text-xs text-muted-foreground">
                    {habitData.loginStreak > 0 ? `Last login: ${habitData.lastLogin ? formatDistanceToNow(habitData.lastLogin, { addSuffix: true }) : 'Just now'}` : 'Log in daily to build your streak!'}
                 </p>
               </CardContent>
             </Card>

             {/* Sessions Attended Card */}
             <Card className="shadow hover:shadow-md transition-shadow">
               <CardHeader className="flex flex-row items-center justify-between pb-2">
                 <CardTitle className="text-sm font-medium">Sessions This Week</CardTitle>
                 <CalendarCheck className="h-4 w-4 text-blue-500" />
               </CardHeader>
               <CardContent>
                   <div className="text-2xl font-bold">
                       {habitData.sessionsAttendedThisWeek} / {habitData.weeklySessionGoal}
                   </div>
                   <Progress value={getProgress(habitData.sessionsAttendedThisWeek, habitData.weeklySessionGoal)} aria-label={`${getProgress(habitData.sessionsAttendedThisWeek, habitData.weeklySessionGoal)}% of weekly session goal`} className="mt-2 h-2" />
                   <p className="text-xs text-muted-foreground mt-1">Towards your weekly goal.</p>
               </CardContent>
                <CardFooter className="pt-0 pb-3 px-4">
                    <Button variant="outline" size="sm" className="text-xs" onClick={logSessionAttended}>Log Session (+1)</Button>
                </CardFooter>
             </Card>

             {/* Practice Time Card */}
             <Card className="shadow hover:shadow-md transition-shadow">
               <CardHeader className="flex flex-row items-center justify-between pb-2">
                 <CardTitle className="text-sm font-medium">Practice This Week</CardTitle>
                 <Clock className="h-4 w-4 text-green-500" />
               </CardHeader>
               <CardContent>
                   <div className="text-2xl font-bold">
                       {habitData.practiceMinutesThisWeek} / {habitData.weeklyPracticeGoal} min
                   </div>
                   <Progress value={getProgress(habitData.practiceMinutesThisWeek, habitData.weeklyPracticeGoal)} aria-label={`${getProgress(habitData.practiceMinutesThisWeek, habitData.weeklyPracticeGoal)}% of weekly practice goal`} className="mt-2 h-2" />
                   <p className="text-xs text-muted-foreground mt-1">Towards your weekly goal.</p>
               </CardContent>
                <CardFooter className="pt-0 pb-3 px-4">
                    {/* Simple buttons to simulate logging practice */}
                   <Button variant="outline" size="sm" className="text-xs mr-2" onClick={() => logPracticeTime(15)}>Log 15 min</Button>
                   <Button variant="outline" size="sm" className="text-xs" onClick={() => logPracticeTime(30)}>Log 30 min</Button>
                </CardFooter>
             </Card>
           </div>

           {/* Achievements Section */}
            <Card className="shadow hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                 <CardTitle className="text-base font-medium flex items-center"><Award className="h-5 w-5 mr-2 text-amber-500"/> Achievements</CardTitle>
                 <CardDescription className="text-xs">Badges earned based on your habits.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4 p-4 min-h-[80px]">
                 {achievements.length > 0 ? (
                    achievements.map(ach => (
                       <div key={ach.id} className="flex flex-col items-center text-center w-20 group" title={ach.name}>
                           <div className={`p-3 rounded-full ${ach.color} transition-transform group-hover:scale-110`}>
                               <ach.icon className={`h-6 w-6`} />
                           </div>
                           <span className="text-xs mt-1 text-muted-foreground truncate w-full">{ach.name}</span>
                       </div>
                    ))
                 ) : (
                    <p className="text-sm text-muted-foreground w-full text-center py-4">Keep going to unlock achievements!</p>
                 )}
              </CardContent>
           </Card>

           {/* Info/Settings Card */}
           <Card className="border-dashed border-sky-500 bg-sky-50 dark:bg-sky-900/20">
               <CardHeader>
                   <CardTitle className="flex items-center text-sky-700 dark:text-sky-300"><Info className="h-5 w-5 mr-2"/> How Habits Work</CardTitle>
                   <CardDescription className="text-sky-600 dark:text-sky-400">
                      Your activity is logged automatically. Consistency builds strong learning habits! We can send optional reminders and encouragements (manage in settings). Weekly stats reset on Monday.
                   </CardDescription>
               </CardHeader>
                <CardFooter>
                    <Button variant="link" size="sm" className="text-xs text-sky-700 dark:text-sky-300" onClick={() => alert("Set/Adjust Goals & Notifications (not implemented)")}>Adjust Goals & Notifications</Button>
                </CardFooter>
           </Card>

        </div>
      ) : (
        <div className="text-center py-10 text-muted-foreground">
           <p>Could not load your habit data. Please try refreshing.</p>
           <Button variant="outline" onClick={loadDataAndLogLogin} className="mt-4">Refresh</Button>
        </div>
      )}
    </div>
  );
}
