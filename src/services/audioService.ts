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

// API Configuration - Using Cloud Run URL
// Update this with your actual Cloud Run URL after deployment
const PYTHON_API_URL = "https://tts-api-493811274849.us-central1.run.app";
// Set timeout duration for API calls in milliseconds
const API_TIMEOUT = 10000;

// Generate audio with remote Python API, falling back to Web Speech API if API is unavailable
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
  console.log("Generating audio for text:", text.substring(0, 30) + "...");
  console.log("Using API URL:", PYTHON_API_URL);
  
  if (!text || text.trim() === '') {
    console.warn("Empty text provided to generateAudio");
    return Promise.reject("Empty text - nothing to speak");
  }
  
  // Try to use the Python API first
  try {
    const response = await fetch(`${PYTHON_API_URL}/generate-audio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voiceId,
        options,
      }),
      // Set a timeout to avoid hanging if API is unresponsive
      signal: AbortSignal.timeout(API_TIMEOUT)
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Audio generated via Python API successfully");
    return data.audioUrl;
  } catch (error) {
    console.warn("Could not connect to Python API, falling back to Web Speech API", error);
    // Fall back to Web Speech API if API is unreachable
    return generateAudioWithWebSpeechAPI(text, voiceId, options);
  }
};

// Improved Web Speech API method with better browser compatibility
const generateAudioWithWebSpeechAPI = (
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
      console.log("Using Web Speech API");
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
      
      // Try to match voice if possible
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        // Try to find a matching voice by language
        const matchingVoice = voices.find(voice => 
          voice.lang.startsWith(options.language) || 
          voice.lang.startsWith(options.language.split('-')[0])
        );
        
        if (matchingVoice) {
          utterance.voice = matchingVoice;
          console.log("Using matching voice:", matchingVoice.name);
        }
      }
      
      console.log("Web Speech API configured with:", {
        lang: utterance.lang,
        rate: utterance.rate,
        pitch: utterance.pitch,
        voice: utterance.voice?.name || "default"
      });

      // Simpler fallback for browsers without MediaRecorder
      // This creates a dummy audio that's marked for the right mime type
      const dummyAudio = "data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADwADMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzM//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAA8CRRKyUAAAAAAAAAAAAAAAAAAAA";

      try {
        // Small message to speak to generate an immediate response
        window.speechSynthesis.speak(utterance);
        
        // Listen for the speech to end
        utterance.onend = () => {
          console.log("Speech synthesis ended");
          // Return the dummy audio since we can't record the speech
          resolve(dummyAudio);
        };
        
        // Handle errors
        utterance.onerror = (event) => {
          console.error("Speech synthesis error:", event);
          reject(new Error(`Speech synthesis error: ${event.error}`));
        };
      } catch (error) {
        console.error("Speech synthesis error:", error);
        // Return dummy audio as a last resort
        resolve(dummyAudio);
      }
    } catch (error) {
      console.error("Web Speech API error:", error);
      reject(error);
    }
  });
};
