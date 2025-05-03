'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Repeat, Zap, CalendarCheck, Clock, BarChart, Target, Award, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

// Mock Data Interface
interface HabitData {
  loginStreak: number; // Consecutive days logged in
  sessionsAttended: number; // Total sessions attended this week/month
  practiceMinutes: number; // Total minutes spent on quizzes/practice this week/month
  lastLogin: Date | null;
  // Potentially add goals
  weeklySessionGoal?: number;
  weeklyPracticeGoal?: number;
}

// Mock function to fetch habit data - replace with Firestore query
const fetchHabitData = async (userId: string): Promise<HabitData> => {
  console.log(`Fetching habit data for user ${userId}...`);
  await new Promise(resolve => setTimeout(resolve, 700)); // Simulate network delay

    try {
        const storedData = localStorage.getItem(`tutorverseHabits_${userId}`);
        if (storedData) {
            const parsed = JSON.parse(storedData) as HabitData;
            return { ...parsed, lastLogin: parsed.lastLogin ? new Date(parsed.lastLogin) : null };
        }
    } catch (error) { console.error("Error reading habits:", error); }

  // Default mock data
  return {
    loginStreak: 3,
    sessionsAttended: 2,
    practiceMinutes: 45,
    lastLogin: new Date(Date.now() - 86400000), // Yesterday
    weeklySessionGoal: 3,
    weeklyPracticeGoal: 120,
  };
};

// Mock function to update habit data (e.g., on login, session completion) - replace with Firestore update/Cloud Function trigger
const updateHabitData = async (userId: string, updatedData: Partial<HabitData>): Promise<boolean> => {
    console.log(`Updating habit data for user ${userId}:`, updatedData);
    await new Promise(resolve => setTimeout(resolve, 300));
     try {
        const currentData = await fetchHabitData(userId);
        const newData = { ...currentData, ...updatedData, lastLogin: new Date() }; // Always update lastLogin on update
        // Basic streak logic (needs proper date checking in real app)
        if (updatedData.loginStreak !== undefined) {
            newData.loginStreak = updatedData.loginStreak;
        } else if (newData.lastLogin && currentData.lastLogin) {
            const today = new Date(); today.setHours(0,0,0,0);
            const lastLog = new Date(currentData.lastLogin); lastLog.setHours(0,0,0,0);
            const diffDays = (today.getTime() - lastLog.getTime()) / (1000 * 3600 * 24);
            if (diffDays === 1) {
                newData.loginStreak = (currentData.loginStreak || 0) + 1;
            } else if (diffDays > 1) {
                newData.loginStreak = 1; // Reset streak if missed more than a day
            }
            // If diffDays is 0 or less, streak remains the same
        } else {
             newData.loginStreak = 1; // First login
        }

        localStorage.setItem(`tutorverseHabits_${userId}`, JSON.stringify(newData));
        return true;
     } catch (error) {
        console.error("Error saving habits:", error);
        return false;
     }
}


export default function HabitTrackerPage() {
  const [habitData, setHabitData] = useState<HabitData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock user ID
  const userId = 'user123';

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
          // Simulate login update on page load for demo purposes
          // In a real app, this would likely happen server-side or on auth state change
         await updateHabitData(userId, {}); // Pass empty object to trigger login/streak update
         const data = await fetchHabitData(userId);
         setHabitData(data);
      } catch (error) {
        console.error("Failed to load habit data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [userId]);

   const getProgress = (value: number | undefined, goal: number | undefined): number => {
       if (goal && goal > 0 && value !== undefined) {
           return Math.min(100, Math.round((value / goal) * 100));
       }
       return 0;
   }

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Login Streak Card */}
          <Card className="shadow hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Login Streak</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{habitData.loginStreak} Day{habitData.loginStreak !== 1 ? 's' : ''}</div>
              <p className="text-xs text-muted-foreground">Keep the momentum going!</p>
              {/* Optionally show a small progress bar towards next milestone */}
            </CardContent>
          </Card>

          {/* Sessions Attended Card */}
          <Card className="shadow hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Sessions This Week</CardTitle>
              <CalendarCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
               {habitData.weeklySessionGoal !== undefined ? (
                  <>
                    <div className="text-2xl font-bold">
                        {habitData.sessionsAttended} / {habitData.weeklySessionGoal}
                    </div>
                    <Progress value={getProgress(habitData.sessionsAttended, habitData.weeklySessionGoal)} className="mt-2 h-2" />
                    <p className="text-xs text-muted-foreground mt-1">Towards your weekly goal.</p>
                  </>
               ) : (
                  <>
                     <div className="text-2xl font-bold">{habitData.sessionsAttended}</div>
                     <p className="text-xs text-muted-foreground">Total sessions attended.</p>
                  </>
               )}
            </CardContent>
             {/* TODO: Add button to set/adjust goal */}
             {/* <CardFooter><Button variant="link" size="sm">Set Goal</Button></CardFooter> */}
          </Card>

          {/* Practice Time Card */}
          <Card className="shadow hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Practice This Week</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
               {habitData.weeklyPracticeGoal !== undefined ? (
                    <>
                       <div className="text-2xl font-bold">
                           {habitData.practiceMinutes} / {habitData.weeklyPracticeGoal} min
                       </div>
                       <Progress value={getProgress(habitData.practiceMinutes, habitData.weeklyPracticeGoal)} className="mt-2 h-2" />
                        <p className="text-xs text-muted-foreground mt-1">Towards your weekly goal.</p>
                    </>
               ) : (
                    <>
                       <div className="text-2xl font-bold">{habitData.practiceMinutes} min</div>
                       <p className="text-xs text-muted-foreground">Total practice time.</p>
                    </>
               )}
            </CardContent>
             {/* <CardFooter><Button variant="link" size="sm">Set Goal</Button></CardFooter> */}
          </Card>

           {/* Placeholder: Weekly Goal Summary */}
           <Card className="md:col-span-2 lg:col-span-1 shadow hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                 <CardTitle className="text-sm font-medium">Weekly Goals</CardTitle>
                 <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-3">
                  <div className="text-sm">
                      <p>Sessions: {habitData.sessionsAttended} / {habitData.weeklySessionGoal || 'N/A'}</p>
                      <Progress value={getProgress(habitData.sessionsAttended, habitData.weeklySessionGoal)} className="mt-1 h-1" />
                  </div>
                   <div className="text-sm">
                      <p>Practice: {habitData.practiceMinutes} / {habitData.weeklyPracticeGoal || 'N/A'} min</p>
                      <Progress value={getProgress(habitData.practiceMinutes, habitData.weeklyPracticeGoal)} className="mt-1 h-1" />
                  </div>
              </CardContent>
                <CardFooter>
                    <Button variant="link" size="sm" className="text-xs" onClick={() => alert("Set/Adjust Goals (not implemented)")}>Adjust Goals</Button>
                </CardFooter>
           </Card>

           {/* Placeholder: Achievements/Badges */}
            <Card className="md:col-span-2 lg:col-span-2 shadow hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                 <CardTitle className="text-sm font-medium flex items-center"><Award className="h-4 w-4 mr-1"/> Achievements</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4 items-center justify-center text-center text-muted-foreground py-6">
                  {/* Example Badges */}
                 <div className="flex flex-col items-center">
                     <div className={`p-3 rounded-full ${habitData.loginStreak >= 7 ? 'bg-green-100 dark:bg-green-900' : 'bg-muted'}`}>
                         <Zap className={`h-6 w-6 ${habitData.loginStreak >= 7 ? 'text-green-600' : 'text-muted-foreground'}`} />
                     </div>
                     <span className="text-xs mt-1">7-Day Streak</span>
                 </div>
                  <div className="flex flex-col items-center">
                     <div className={`p-3 rounded-full ${habitData.sessionsAttended >= 5 ? 'bg-blue-100 dark:bg-blue-900' : 'bg-muted'}`}>
                         <CalendarCheck className={`h-6 w-6 ${habitData.sessionsAttended >= 5 ? 'text-blue-600' : 'text-muted-foreground'}`} />
                     </div>
                     <span className="text-xs mt-1">5 Sessions</span>
                 </div>
                  <div className="flex flex-col items-center">
                     <div className={`p-3 rounded-full ${habitData.practiceMinutes >= 180 ? 'bg-purple-100 dark:bg-purple-900' : 'bg-muted'}`}>
                         <Clock className={`h-6 w-6 ${habitData.practiceMinutes >= 180 ? 'text-purple-600' : 'text-muted-foreground'}`} />
                     </div>
                     <span className="text-xs mt-1">3 Hours Practice</span>
                 </div>
                 <p className="text-sm w-full mt-4">More achievements coming soon!</p>
              </CardContent>
           </Card>

        </div>
      ) : (
        <div className="text-center py-10 text-muted-foreground">
           <p>Could not load your habit data.</p>
        </div>
      )}

       <Card className="mt-8 border-dashed border-sky-500">
           <CardHeader>
               <CardTitle className="flex items-center"><Info className="h-5 w-5 mr-2 text-sky-500"/> How it Works</CardTitle>
               <CardDescription>
                  This tracker automatically logs your activity like logins, completed sessions, and time spent on practice exercises. Consistent engagement helps build strong learning habits. We'll send occasional reminders and encouragement via notifications (manage in settings).
               </CardDescription>
           </CardHeader>
       </Card>
    </div>
  );
}
