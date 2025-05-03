'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Video, Mic, UploadCloud, History, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Mock function to simulate saving data
const saveTimeCapsuleNote = async (data: { type: 'video' | 'audio', mediaBlob: Blob, releaseDate: Date, title: string }) => {
  console.log('Saving Time Capsule Note:', {
    type: data.type,
    size: data.mediaBlob.size,
    releaseDate: data.releaseDate.toISOString(),
    title: data.title,
  });
  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  // Simulate success/failure
  if (Math.random() > 0.1) { // 90% success rate
    return { success: true, id: `capsule_${Date.now()}` };
  } else {
    throw new Error('Simulated upload failure.');
  }
};

export default function RecordCapsulePage() {
  const [noteType, setNoteType] = useState<'video' | 'audio' | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);
  const [releaseDate, setReleaseDate] = useState<Date | undefined>(undefined);
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Indicate component has mounted on client
  }, []);

  const requestPermissions = async (type: 'video' | 'audio') => {
    try {
      const constraints = type === 'video' ? { video: true, audio: true } : { audio: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (type === 'video') {
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }
      setHasMicPermission(true);
      return true;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      if (type === 'video') setHasCameraPermission(false);
      setHasMicPermission(false);
      toast({
        variant: 'destructive',
        title: 'Permission Denied',
        description: `Please enable ${type === 'video' ? 'camera and microphone' : 'microphone'} permissions in your browser settings.`,
      });
      return false;
    }
  };

  const startRecording = async () => {
    if (!noteType) return;
    const permissionGranted = await requestPermissions(noteType);
    if (!permissionGranted || !streamRef.current) return;

    try {
      const options = { mimeType: noteType === 'video' ? 'video/webm;codecs=vp9' : 'audio/webm' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
         console.warn(`${options.mimeType} not supported, trying default.`);
         // Fallback to default or try other codecs if needed
         options.mimeType = noteType === 'video' ? 'video/webm' : 'audio/ogg; codecs=opus';
         if (!MediaRecorder.isTypeSupported(options.mimeType)) {
           toast({ title: "Recording Error", description: "Browser doesn't support required media types.", variant: "destructive" });
           return;
         }
       }

      mediaRecorderRef.current = new MediaRecorder(streamRef.current, options);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: options.mimeType });
        setMediaBlob(blob);
        setIsRecording(false);
        if (noteType === 'video' && videoRef.current) {
          videoRef.current.srcObject = null; // Stop showing live feed
          videoRef.current.src = URL.createObjectURL(blob);
          videoRef.current.controls = true;
           videoRef.current.muted = false; // Allow playback sound
        } else if (noteType === 'audio' && audioRef.current) {
          audioRef.current.src = URL.createObjectURL(blob);
           audioRef.current.controls = true;
        }
        // Stop all tracks to turn off camera/mic light
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setMediaBlob(null); // Clear previous recording
       if (videoRef.current) videoRef.current.controls = false;
       if (audioRef.current) audioRef.current.controls = false;
    } catch (error) {
       console.error("Failed to start recorder:", error);
       toast({ title: "Recording Error", description: "Could not start media recorder.", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      // Tracks are stopped in onstop handler
    }
  };

   const handleReset = () => {
       setNoteType(null);
       setIsRecording(false);
       setMediaBlob(null);
       setReleaseDate(undefined);
       setTitle('');
       setShowSuccess(false);
       if (videoRef.current) {
          videoRef.current.src = '';
          videoRef.current.srcObject = null;
          videoRef.current.controls = false;
           videoRef.current.muted = true;
       }
       if (audioRef.current) {
           audioRef.current.src = '';
            audioRef.current.controls = false;
       }
       streamRef.current?.getTracks().forEach(track => track.stop());
       streamRef.current = null;
       setHasCameraPermission(null);
       setHasMicPermission(null);
   }

  const handleSave = async () => {
    if (!mediaBlob || !releaseDate || !title.trim() || !noteType) {
       toast({ title: "Missing Information", description: "Please record a note, set a title, and choose a release date.", variant: "destructive"});
       return;
    }
    if (releaseDate <= new Date()) {
       toast({ title: "Invalid Date", description: "Release date must be in the future.", variant: "destructive"});
       return;
    }

    setIsSaving(true);
    try {
      const result = await saveTimeCapsuleNote({ type: noteType, mediaBlob, releaseDate, title: title.trim() });
      if (result.success) {
         setShowSuccess(true);
         toast({ title: "Capsule Saved!", description: `Your note "${title.trim()}" will unlock on ${format(releaseDate, 'PPP')}.` });
         // Reset fields after successful save might be desired, or navigate away
         // handleReset(); // Optionally reset form
      }
    } catch (error) {
      console.error('Failed to save time capsule:', error);
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Could not save your time capsule note. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

   // Memoize today's date to prevent re-calculation causing Calendar issues
   const today = React.useMemo(() => new Date(), []);

    if (!isClient) {
     // Render loading state or null during SSR/hydration
     return <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]"><Loader2 className="h-8 w-8 animate-spin"/></div>;
   }

   if (showSuccess) {
       return (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
             <Card className="w-full max-w-md text-center p-6 shadow-lg">
                <CardHeader>
                   <div className="flex justify-center mb-4">
                       <UploadCloud className="h-16 w-16 text-green-500" />
                    </div>
                   <CardTitle className="text-2xl">Time Capsule Sealed!</CardTitle>
                   <CardDescription>Your reflection has been safely stored.</CardDescription>
                </CardHeader>
                 <CardContent>
                   <p className="text-lg mb-4">
                       Your note titled <span className="font-semibold">"{title}"</span> will automatically unlock and notify you on:
                   </p>
                   <p className="text-2xl font-bold text-accent mb-6">
                      {releaseDate ? format(releaseDate, 'PPP') : 'Selected Date'}
                   </p>
                    <Button className="mt-6 mr-2" onClick={handleReset}>Record Another Note</Button>
                    {/* TODO: Add Link to view all capsules */}
                    <Button variant="outline" className="mt-6" onClick={() => {/* Navigate to dashboard */}}>Go to Dashboard</Button>
                 </CardContent>
             </Card>
          </div>
       );
   }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2 text-center">Create Time Capsule Note</h1>
      <p className="text-muted-foreground mb-6 text-center">Record a short video or audio reflection about your session.</p>

      <Card className="shadow-md">
         <CardHeader>
             <CardTitle>1. Choose Note Type</CardTitle>
         </CardHeader>
         <CardContent className="flex gap-4">
            <Button
                variant={noteType === 'video' ? 'default' : 'outline'}
                onClick={() => setNoteType('video')}
                disabled={isRecording || !!mediaBlob}
                className="flex-1"
            >
                <Video className="mr-2 h-5 w-5" /> Video Note
            </Button>
             <Button
                 variant={noteType === 'audio' ? 'default' : 'outline'}
                 onClick={() => setNoteType('audio')}
                 disabled={isRecording || !!mediaBlob}
                 className="flex-1"
            >
                <Mic className="mr-2 h-5 w-5" /> Audio Note
            </Button>
         </CardContent>
      </Card>

       {noteType && (
           <Card className="mt-6 shadow-md">
               <CardHeader>
                   <CardTitle>2. Record Your Reflection</CardTitle>
                    {(hasCameraPermission === false || hasMicPermission === false) && (
                        <Alert variant="destructive" className="mt-4">
                          <AlertTitle>Permissions Required</AlertTitle>
                          <AlertDescription>
                              {noteType === 'video' && hasCameraPermission === false && "Camera access denied. "}
                              {hasMicPermission === false && "Microphone access denied. "}
                              Please enable permissions in your browser settings to record.
                          </AlertDescription>
                        </Alert>
                    )}
               </CardHeader>
               <CardContent className="flex flex-col items-center">
                   {noteType === 'video' && (
                       <video ref={videoRef} className={cn("w-full aspect-video rounded-md bg-muted mb-4", mediaBlob ? '' : 'border')} autoPlay muted={!mediaBlob} playsInline></video>
                   )}
                    {noteType === 'audio' && (
                        <div className="w-full p-4 flex flex-col items-center justify-center min-h-[100px] bg-muted rounded-md mb-4 border">
                             {isRecording ? (
                                 <p className="text-primary flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Recording Audio...</p>
                             ) : mediaBlob ? (
                                 <audio ref={audioRef} controls className="w-full"></audio>
                             ) : (
                                 <Mic className="h-12 w-12 text-muted-foreground" />
                             )}
                        </div>
                   )}

                   {!isRecording && !mediaBlob && (
                       <Button onClick={startRecording} disabled={!noteType || isSaving}>
                           <span className="flex items-center">
                                {noteType === 'video' ? <Video className="mr-2 h-4 w-4"/> : <Mic className="mr-2 h-4 w-4"/>}
                                Start Recording
                           </span>
                       </Button>
                   )}
                   {isRecording && (
                       <Button onClick={stopRecording} variant="destructive" disabled={isSaving}>
                          <span className="flex items-center">
                             <Loader2 className="mr-2 h-4 w-4 animate-spin"/> Stop Recording
                          </span>
                       </Button>
                   )}
                    {mediaBlob && !isRecording && (
                       <Button onClick={handleReset} variant="outline" disabled={isSaving}>
                          Record Again
                       </Button>
                   )}
               </CardContent>
           </Card>
       )}

       {mediaBlob && !isRecording && (
           <Card className="mt-6 shadow-md">
               <CardHeader>
                   <CardTitle>3. Set Details & Save</CardTitle>
               </CardHeader>
                <CardContent className="space-y-4">
                   <div>
                      <Label htmlFor="title">Note Title</Label>
                      <Input
                         id="title"
                         value={title}
                         onChange={(e) => setTitle(e.target.value)}
                         placeholder="e.g., Key takeaways from Algebra session"
                         disabled={isSaving}
                      />
                   </div>
                   <div>
                      <Label>Release Date (When to unlock this note)</Label>
                       <Popover>
                          <PopoverTrigger asChild>
                            <Button
                               variant={"outline"}
                               className={cn(
                                 "w-full justify-start text-left font-normal",
                                 !releaseDate && "text-muted-foreground"
                               )}
                               disabled={isSaving}
                            >
                               <CalendarIcon className="mr-2 h-4 w-4" />
                               {releaseDate ? format(releaseDate, "PPP") : <span>Pick a future date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                               mode="single"
                               selected={releaseDate}
                               onSelect={setReleaseDate}
                               disabled={(date) => date <= today } // Disable past dates using memoized today
                               initialFocus
                            />
                          </PopoverContent>
                       </Popover>
                   </div>
                   <Button onClick={handleSave} disabled={isSaving || !releaseDate || !title.trim()} className="w-full">
                      {isSaving ? (
                          <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Capsule...
                          </>
                      ) : (
                         <span className="flex items-center"><History className="mr-2 h-4 w-4"/> Seal Time Capsule</span>
                      )}
                   </Button>
               </CardContent>
           </Card>
       )}
    </div>
  );
}
