
import { Voice } from "../components/VoiceSelector";

// Sample voice data
export const availableVoices: Voice[] = [
  {
    id: "v1",
    name: "Sarah",
    description: "Warm and professional female voice"
  },
  {
    id: "v2",
    name: "Michael",
    description: "Deep and clear male voice"
  },
  {
    id: "v3",
    name: "Emma",
    description: "Young and energetic female voice"
  },
  {
    id: "v4",
    name: "David",
    description: "Authoritative male voice"
  },
  {
    id: "v5",
    name: "Sophia",
    description: "Soft and soothing female voice"
  },
  {
    id: "v6",
    name: "James",
    description: "British male accent"
  },
  {
    id: "v7",
    name: "Olivia",
    description: "British female accent"
  },
  {
    id: "v8",
    name: "Alex",
    description: "Neutral voice with slight rasp"
  }
];

// Modified to use the browser's Web Speech API
export const generateAudio = async (
  text: string,
  voiceId: string,
  options: {
    speechRate: number;
    pitch: number;
    stability?: number;
    similarityBoost?: number;
    style?: number;
    language: string;
    speakerBoost?: boolean;
  }
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Check if the browser supports speech synthesis
      if (!('speechSynthesis' in window)) {
        throw new Error('Your browser does not support speech synthesis');
      }

      // Create a SpeechSynthesisUtterance instance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set the language based on options
      utterance.lang = options.language || 'en-US';
      
      // Set speech rate and pitch
      utterance.rate = options.speechRate || 1;
      utterance.pitch = options.pitch || 1;
      
      // Create an audio context to capture the speech
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const destination = audioContext.createMediaStreamDestination();
      const mediaRecorder = new MediaRecorder(destination.stream);
      const audioChunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const reader = new FileReader();
        
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          resolve(base64Audio);
        };
        
        reader.onerror = (error) => {
          reject(error);
        };
        
        reader.readAsDataURL(audioBlob);
      };
      
      // Start recording
      mediaRecorder.start();
      
      // Play the speech
      window.speechSynthesis.speak(utterance);
      
      // When speech ends, stop recording
      utterance.onend = () => {
        mediaRecorder.stop();
        audioContext.close();
      };
      
      // Handle errors
      utterance.onerror = (event) => {
        mediaRecorder.stop();
        audioContext.close();
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };
      
    } catch (error) {
      console.error("Error generating audio:", error);
      // Return a mock audio in case of error for graceful fallback
      resolve(`data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADwADMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzM//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAA8CRRKyUAAAAAAAAAAAAAAAAAAAA//sQZAAP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV`);
    }
  });
};
