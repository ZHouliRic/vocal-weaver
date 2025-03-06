
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
const PYTHON_API_URL = "https://tts-api-xxxxxxxxxxxx-uc.a.run.app/generate-audio";
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
    const response = await fetch(PYTHON_API_URL, {
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

      // Method to generate audio and return as base64
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const destination = audioContext.createMediaStreamDestination();
        
        // Use a widely supported format (WebM is good for Chrome/Firefox)
        const mediaRecorder = new MediaRecorder(destination.stream, {
          mimeType: MediaRecorder.isTypeSupported('audio/webm') 
            ? 'audio/webm' 
            : (MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : '')
        });
        
        console.log("Using MediaRecorder with MIME type:", mediaRecorder.mimeType);
        
        const audioChunks: BlobPart[] = [];
        
        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };
        
        mediaRecorder.onstop = () => {
          // Create a proper audio blob with browser-compatible format
          let mimeType = 'audio/mpeg'; // Widely supported
          if (mediaRecorder.mimeType && mediaRecorder.mimeType !== '') {
            mimeType = mediaRecorder.mimeType;
          }
          
          const audioBlob = new Blob(audioChunks, { type: mimeType });
          const reader = new FileReader();
          
          reader.onloadend = () => {
            const base64Audio = reader.result as string;
            console.log("Audio generated via Web Speech API successfully");
            audioContext.close();
            resolve(base64Audio);
          };
          
          reader.onerror = (error) => {
            console.error("Error reading audio blob:", error);
            audioContext.close();
            reject(error);
          };
          
          reader.readAsDataURL(audioBlob);
        };
        
        // Start recording
        mediaRecorder.start();
        console.log("Started recording Web Speech API output");
        
        // Play the speech
        window.speechSynthesis.speak(utterance);
        console.log("Speech synthesis started");
        
        // When speech ends, stop recording
        utterance.onend = () => {
          console.log("Speech synthesis ended, stopping recorder");
          mediaRecorder.stop();
        };
        
        // Handle errors
        utterance.onerror = (event) => {
          console.error("Speech synthesis error:", event);
          mediaRecorder.stop();
          audioContext.close();
          reject(new Error(`Speech synthesis error: ${event.error}`));
        };
      } catch (error) {
        console.error("MediaRecorder error:", error);
        
        // Fallback for browsers without MediaRecorder support
        const dummyAudio = "data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADwADMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzM//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAA8CRRKyUAAAAAAAAAAAAAAAAAAAA";
        console.log("Using dummy audio fallback");
        resolve(dummyAudio);
      }
    } catch (error) {
      console.error("Web Speech API error:", error);
      reject(error);
    }
  });
};
