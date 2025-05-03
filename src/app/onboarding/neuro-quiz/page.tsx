'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { BrainCog, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock questions for the quiz
const quizQuestions = [
  {
    id: 1,
    question: 'When learning something new, you prefer to:',
    options: [
      { value: 'visual', label: 'See diagrams, charts, or read text.' },
      { value: 'auditory', label: 'Listen to explanations or discussions.' },
      { value: 'kinesthetic', label: 'Try it out yourself, hands-on.' },
    ],
  },
  {
    id: 2,
    question: 'How do you best remember instructions?',
    options: [
      { value: 'visual', label: 'Written down or in a diagram.' },
      { value: 'auditory', label: 'Spoken clearly to you.' },
      { value: 'kinesthetic', label: 'By doing the steps physically.' },
    ],
  },
  {
    id: 3,
    question: 'When assembling something, you are most likely to:',
    options: [
      { value: 'visual', label: 'Follow the written instructions or diagrams carefully.' },
      { value: 'auditory', label: 'Prefer someone talks you through it.' },
      { value: 'kinesthetic', label: 'Jump right in and figure it out by trying.' },
    ],
  },
   {
    id: 4,
    question: 'What helps you concentrate best?',
    options: [
      { value: 'visual', label: 'A quiet environment with visual aids.' },
      { value: 'auditory', label: 'Background music or listening to the task explained.' },
      { value: 'kinesthetic', label: 'Moving around or fidgeting slightly while working.' },
    ],
  },
    {
    id: 5,
    question: 'When you meet someone new, you are more likely to remember their:',
    options: [
      { value: 'visual', label: 'Face and what they were wearing.' },
      { value: 'auditory', label: 'Name (if you heard it clearly) and the conversation.' },
      { value: 'kinesthetic', label: 'Handshake and overall presence/feeling.' },
    ],
  },
];

type Answers = Record<number, string>;
type LearningStyles = Record<'visual' | 'auditory' | 'kinesthetic', number>;

// Mock user ID
const currentUserId = 'user123';

// Mock function to save profile - replace with Firestore update
const saveNeuroProfile = async (userId: string, dominantStyle: string): Promise<boolean> => {
   console.log(`Saving neuro profile for user ${userId}: ${dominantStyle}`);
   await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    try {
       localStorage.setItem(`tutorverseNeuroProfile_${userId}`, JSON.stringify({ neuroType: dominantStyle, completedAt: new Date() }));
       return true;
    } catch (error) {
        console.error("Error saving neuro profile:", error);
        return false;
    }
};


export default function NeuroQuizPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [learningStyle, setLearningStyle] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter(); // Initialize router

  const handleAnswerSelect = (questionId: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNextQuestion = () => {
    if (answers[quizQuestions[currentQuestionIndex].id]) {
      if (currentQuestionIndex < quizQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        handleSubmitQuiz();
      }
    } else {
      toast({
        title: 'Please select an answer',
        description: 'You must choose an option before proceeding.',
        variant: 'destructive',
      });
    }
  };

   const handlePreviousQuestion = () => {
      if (currentQuestionIndex > 0) {
         setCurrentQuestionIndex(currentQuestionIndex - 1);
      }
   };


  const handleSubmitQuiz = async () => {
    // Calculate the predominant learning style
    const styleCounts: LearningStyles = { visual: 0, auditory: 0, kinesthetic: 0 };
    Object.values(answers).forEach((answer) => {
      if (answer === 'visual' || answer === 'auditory' || answer === 'kinesthetic') {
        styleCounts[answer]++;
      }
    });

    // Determine the dominant style
    let dominantStyle: keyof LearningStyles = 'visual'; // Default
    let maxCount = 0;
    (Object.keys(styleCounts) as Array<keyof LearningStyles>).forEach((style) => {
      if (styleCounts[style] > maxCount) {
        maxCount = styleCounts[style];
        dominantStyle = style;
      }
      // Basic tie-breaking: if counts are equal, prioritize visual > auditory > kinesthetic (can be refined)
       else if (styleCounts[style] === maxCount) {
           if (style === 'visual') dominantStyle = 'visual';
           else if (style === 'auditory' && dominantStyle !== 'visual') dominantStyle = 'auditory';
       }
    });

    setLearningStyle(dominantStyle);
    setIsSaving(true);

    try {
      const success = await saveNeuroProfile(currentUserId, dominantStyle);
       if (success) {
          setQuizCompleted(true);
          toast({
             title: 'Quiz Complete!',
             description: `Your primary learning style appears to be ${dominantStyle}.`,
          });
       } else {
          throw new Error("Failed to save profile");
       }
    } catch (error) {
       console.error('Quiz Submission Error:', error);
       toast({
         title: 'Error Saving Profile',
         description: 'Could not save your learning style. Please try finishing again.',
         variant: 'destructive',
       });
        setLearningStyle(null); // Reset style on error
    } finally {
       setIsSaving(false);
    }

  };

  const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;

  if (quizCompleted && learningStyle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Card className="w-full max-w-md text-center p-6 shadow-lg animate-fade-in-up">
          <CardHeader>
             <div className="flex justify-center mb-4">
               <CheckCircle className="h-16 w-16 text-green-500" />
             </div>
            <CardTitle className="text-2xl">Learning Style Identified!</CardTitle>
            <CardDescription>Thank you for completing the assessment.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg mb-2">
              Your primary learning style appears to be:
            </p>
            <p className="text-3xl font-bold text-primary capitalize mb-4">{learningStyle}</p>
             <p className="text-base mb-6">
                {learningStyle === 'visual' && 'You likely learn best through seeing information, like diagrams, text, and demonstrations.'}
                {learningStyle === 'auditory' && 'You probably retain information well by listening to lectures, discussions, and verbal instructions.'}
                 {learningStyle === 'kinesthetic' && 'You tend to learn most effectively by doing, hands-on activities, and physical engagement.'}
             </p>
            <p className="text-muted-foreground text-sm">
              We'll use this insight to help suggest suitable tutors and learning resources.
            </p>
             <Button className="mt-6" onClick={() => router.push('/')}> {/* Navigate back to home */}
                Back to Dashboard
             </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = quizQuestions[currentQuestionIndex];

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2 text-center flex items-center justify-center">
         <BrainCog className="h-8 w-8 mr-2 text-primary"/> Learning Style Quiz
      </h1>
      <p className="text-muted-foreground mb-6 text-center">Help us understand how you learn best! (Just {quizQuestions.length} questions)</p>
      <Card className="shadow-md">
         <CardHeader>
           <Progress value={progress} className="w-full mb-4" />
           <CardTitle className="text-lg">Question {currentQuestion.id} / {quizQuestions.length}</CardTitle>
           <CardDescription className="text-base pt-2">{currentQuestion.question}</CardDescription>
         </CardHeader>
        <CardContent>
          <RadioGroup
            value={answers[currentQuestion.id] || ''}
            onValueChange={(value) => handleAnswerSelect(currentQuestion.id, value)}
            className="space-y-3"
          >
            {currentQuestion.options.map((option) => (
              <Label
                key={option.value}
                htmlFor={`${currentQuestion.id}-${option.value}`}
                 className={cn(
                    "flex items-center space-x-3 p-3 border rounded-md cursor-pointer transition-colors hover:bg-muted/50",
                    answers[currentQuestion.id] === option.value && "border-primary bg-primary/10"
                )}
              >
                <RadioGroupItem value={option.value} id={`${currentQuestion.id}-${option.value}`} />
                <span className="flex-1 text-sm">{option.label}</span>
              </Label>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex justify-between pt-4 border-t">
           <Button variant="outline" onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0 || isSaving}>
             Previous
           </Button>
           <Button onClick={handleNextQuestion} disabled={isSaving || !answers[currentQuestion.id]}>
             {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
             {currentQuestionIndex === quizQuestions.length - 1 ? (isSaving ? 'Saving...' : 'Finish Quiz') : 'Next Question'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
