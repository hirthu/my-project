'use client';

import React, { useState, useRef, useEffect, useTransition } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { askQuestion } from '@/ai/flows/ai-study-companion'; // Import the Genkit flow
import type { AskQuestionInput, AskQuestionOutput } from '@/ai/flows/ai-study-companion';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

export default function AICompanionChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

   // Focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isPending) return;

    const userMessage: Message = {
      id: Date.now().toString() + '-user',
      text: trimmedInput,
      sender: 'user',
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // Add a placeholder AI message while waiting
    const aiPlaceholderMessage: Message = {
      id: Date.now().toString() + '-ai-loading',
      text: 'Thinking...',
      sender: 'ai',
    };
    setMessages((prev) => [...prev, aiPlaceholderMessage]);

    startTransition(async () => {
      try {
        const aiInput: AskQuestionInput = { question: trimmedInput };
        const aiOutput: AskQuestionOutput = await askQuestion(aiInput);

        const aiMessage: Message = {
          id: Date.now().toString() + '-ai',
          text: aiOutput.answer,
          sender: 'ai',
        };

        // Replace placeholder with actual response
         setMessages((prev) =>
           prev.map((msg) =>
             msg.id === aiPlaceholderMessage.id ? aiMessage : msg
           )
         );

      } catch (error) {
        console.error('AI request failed:', error);
         const errorMessage: Message = {
          id: Date.now().toString() + '-ai-error',
          text: 'Sorry, I encountered an error. Please try again.',
          sender: 'ai',
        };
        // Replace placeholder with error message
         setMessages((prev) =>
           prev.map((msg) =>
             msg.id === aiPlaceholderMessage.id ? errorMessage : msg
           )
         );
      }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col flex-grow border rounded-lg overflow-hidden shadow-sm bg-card">
      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {/* Initial message from AI */}
          {messages.length === 0 && (
             <div className="flex items-start space-x-3">
               <Avatar className="h-8 w-8">
                 <AvatarImage src="/placeholder-bot.png" alt="AI" data-ai-hint="robot face cute" />
                 <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
               </Avatar>
               <div className="bg-muted p-3 rounded-lg max-w-[75%]">
                 <p className="text-sm">Hello! I'm your AI Study Companion. Ask me anything about your studies!</p>
               </div>
             </div>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex items-start space-x-3',
                message.sender === 'user' ? 'justify-end' : ''
              )}
            >
              {message.sender === 'ai' && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-bot.png" alt="AI" data-ai-hint="robot face cute"/>
                  <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'p-3 rounded-lg max-w-[75%]',
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted',
                  message.id.endsWith('-loading') && 'flex items-center space-x-2 text-muted-foreground italic'
                )}
              >
                 {message.id.endsWith('-loading') && <Loader2 className="h-4 w-4 animate-spin" />}
                 <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              </div>
               {message.sender === 'user' && (
                <Avatar className="h-8 w-8">
                  {/* Placeholder User Avatar */}
                   <AvatarImage src="/placeholder-user.png" alt="User" data-ai-hint="person silhouette anonymous"/>
                  <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t bg-background">
        <div className="flex items-center space-x-2">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Ask a question..."
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isPending}
            className="flex-grow"
          />
          <Button
            type="submit"
            onClick={handleSendMessage}
            disabled={isPending || !input.trim()}
            size="icon"
            aria-label="Send message"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
           {/* Optional: Button for suggested prompts */}
          {/* <Button variant="outline" size="icon" disabled={isPending} aria-label="Suggest prompt">
             <Sparkles className="h-4 w-4" />
          </Button> */}
        </div>
      </div>
    </div>
  );
}
