'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { BrainCog, CheckCircle } from 'lucide-react';
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

export default function NeuroQuizPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [learningStyle, setLearningStyle] = useState<string | null>(null);
  const { toast } = useToast();

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


  const handleSubmitQuiz = () => {
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
    setQuizCompleted(true);

    // TODO: Save results to Firestore
    console.log('Quiz Submitted. Dominant Style:', dominantStyle);
    console.log('All Answers:', answers);
     toast({
        title: 'Quiz Complete!',
        description: `Your primary learning style appears to be ${dominantStyle}.`,
     });
    // Example: await saveNeuroProfile(userId, dominantStyle);
  };

  const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;

  if (quizCompleted && learningStyle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Card className="w-full max-w-md text-center p-6 shadow-lg">
          <CardHeader>
             <div className="flex justify-center mb-4">
               <CheckCircle className="h-16 w-16 text-green-500" />
             </div>
            <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
            <CardDescription>Thank you for completing the learning style assessment.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg mb-4">
              Based on your answers, your primary learning style seems to be:
            </p>
            <p className="text-2xl font-bold text-accent capitalize mb-6">{learningStyle}</p>
            <p className="text-muted-foreground text-sm">
              We'll use this insight to help match you with tutors and suggest learning strategies best suited for you.
            </p>
             {/* TODO: Add link back to dashboard or next onboarding step */}
              <Button className="mt-6" onClick={() => { /* Navigate back or to next step */ }}>
                 Continue Onboarding
              </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = quizQuestions[currentQuestionIndex];

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2 text-center">Learning Style Quiz</h1>
      <p className="text-muted-foreground mb-6 text-center">Help us understand how you learn best!</p>
      <Card className="shadow-md">
         <CardHeader>
           <Progress value={progress} className="w-full mb-4" />
           <CardTitle className="text-xl">Question {currentQuestion.id} of {quizQuestions.length}</CardTitle>
           <CardDescription className="text-lg pt-2">{currentQuestion.question}</CardDescription>
         </CardHeader>
        <CardContent>
          <RadioGroup
            value={answers[currentQuestion.id] || ''}
            onValueChange={(value) => handleAnswerSelect(currentQuestion.id, value)}
            className="space-y-3"
          >
            {currentQuestion.options.map((option) => (
              <div key={option.value} className="flex items-center space-x-3 p-3 border rounded-md hover:bg-muted/50 transition-colors">
                <RadioGroupItem value={option.value} id={`${currentQuestion.id}-${option.value}`} />
                <Label htmlFor={`${currentQuestion.id}-${option.value}`} className="flex-1 cursor-pointer text-base">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex justify-between pt-4 border-t">
           <Button variant="outline" onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0}>
             Previous
           </Button>
          <Button onClick={handleNextQuestion}>
            {currentQuestionIndex === quizQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
