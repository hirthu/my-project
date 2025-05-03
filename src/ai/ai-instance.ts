import { genkit, LogLevel } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Check for API Key
const apiKey = process.env.GOOGLE_GENAI_API_KEY;
if (!apiKey) {
  console.warn(
    'GOOGLE_GENAI_API_KEY environment variable not set. Genkit Google AI plugin may not function correctly.'
  );
  // Depending on requirements, you might want to throw an error here instead
  // throw new Error('GOOGLE_GENAI_API_KEY environment variable is required.');
}

// Determine the model to use, defaulting to gemini-2.0-flash
const modelName = process.env.GEMINI_MODEL || 'googleai/gemini-2.0-flash';
console.log(`Using Gemini model: ${modelName}`);

// Determine the log level, defaulting to 'info'
const validLogLevels = ['debug', 'info', 'warn', 'error'];
const logLevelInput = process.env.GENKIT_LOG_LEVEL?.toLowerCase();
const logLevel = (logLevelInput && validLogLevels.includes(logLevelInput) ? logLevelInput : 'info') as LogLevel;
console.log(`Genkit log level set to: ${logLevel}`);

export const ai = genkit({
  promptDir: './prompts',
  plugins: [
    googleAI({
      apiKey: apiKey, // Use the checked apiKey
    }),
  ],
  model: modelName, // Use the configured model name
  logLevel: logLevel, // Set the log level
  enableTracingAndMetrics: process.env.NODE_ENV === 'development', // Enable tracing only in development for performance
});

// Example of how to potentially add Firestore for tracing/state (requires additional setup)
/*
import { firebase } from '@genkit-ai/firebase';
import { firebaseApp } from '@/lib/firebase/server'; // Assuming you have server-side Firebase init

export const ai = genkit({
  promptDir: './prompts',
  plugins: [
    googleAI({
      apiKey: apiKey,
    }),
    // Add firebase plugin AFTER initializing the Firebase app
    firebase({
      firebaseApp: firebaseApp, // Pass your initialized Firebase app
      flowStateStore: { collection: 'genkitFlowStates' },
      traceStore: { collection: 'genkitTraces' },
      // Specify credentials if needed (e.g., for service accounts)
      // credentials: { ... }
    }),
  ],
  model: modelName,
  logLevel: logLevel,
  flowStateStore: 'firebase', // Use the firebase flow state store
  traceStore: 'firebase', // Use the firebase trace store
  enableTracingAndMetrics: true, // Always enable if using Firestore stores
});
*/
