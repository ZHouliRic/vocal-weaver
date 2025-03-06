import { RefObject } from "react";

// Format seconds to mm:ss format
export const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Calculate audio waveform data from an audio element
export const calculateWaveform = async (
  audioElement: HTMLAudioElement,
  numPoints = 100
): Promise<number[]> => {
  return new Promise((resolve) => {
    try {
      // If audio isn't loaded yet, return dummy data
      if (!audioElement || !audioElement.src || audioElement.src === "") {
        return resolve(Array(numPoints).fill(0.1));
      }
      
      // Create audio context
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) {
        console.warn("AudioContext not supported in this browser");
        return resolve(Array(numPoints).fill(0.1)); 
      }
      
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      
      // Create a buffer source from the audio element
      const source = audioContext.createMediaElementSource(audioElement);
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      
      // Create a buffer for the frequency data
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      // Get frequency data
      analyser.getByteFrequencyData(dataArray);
      
      // Process the data to create a simplified waveform
      const step = Math.floor(bufferLength / numPoints);
      const waveform = Array(numPoints).fill(0);
      
      for (let i = 0; i < numPoints; i++) {
        const startIndex = i * step;
        let sum = 0;
        let count = 0;
        
        for (let j = 0; j < step && startIndex + j < bufferLength; j++) {
          sum += dataArray[startIndex + j];
          count++;
        }
        
        // Normalize between 0.1 and 1 (for visual appeal)
        const avg = count > 0 ? sum / count : 0;
        waveform[i] = 0.1 + (avg / 255) * 0.9;
      }
      
      // Close the audio context to free up resources
      audioContext.close();
      
      resolve(waveform);
    } catch (error) {
      console.error("Error generating waveform:", error);
      resolve(Array(numPoints).fill(0.1));
    }
  });
};

// Test if the Web Speech API is supported in this browser
export const isWebSpeechSupported = (): boolean => {
  return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
};

// Safe play function that handles browser autoplay policy
export const safePlay = async (audioRef: RefObject<HTMLAudioElement>): Promise<void> => {
  if (!audioRef.current) return;
  
  try {
    // Try to play normally
    await audioRef.current.play();
  } catch (error) {
    console.warn("Autoplay prevented by browser, using muted play as fallback");
    
    // Try with muted first (to accommodate autoplay policies)
    if (audioRef.current) {
      const wasMuted = audioRef.current.muted;
      
      // Set to muted and try to play
      audioRef.current.muted = true;
      
      try {
        await audioRef.current.play();
        
        // If successful, restore original muted state
        if (!wasMuted && audioRef.current) {
          audioRef.current.muted = false;
        }
      } catch (mutedError) {
        console.error("Even muted autoplay failed:", mutedError);
        
        // Let the user know they need to interact
        if (audioRef.current) {
          // Reset to original mute state
          audioRef.current.muted = wasMuted;
        }
      }
    }
  }
};

// Setup MediaSession API for media controls
export const setupMediaSession = (
  audioRef: RefObject<HTMLAudioElement>,
  title: string,
  artist: string = "Vocal Weaver",
  playPauseHandler: () => void,
  stopHandler: () => void
): void => {
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist,
      album: 'Generated Audio',
      artwork: [
        { src: '/placeholder.svg', sizes: '512x512', type: 'image/svg+xml' }
      ]
    });
    
    navigator.mediaSession.setActionHandler('play', playPauseHandler);
    navigator.mediaSession.setActionHandler('pause', playPauseHandler);
    navigator.mediaSession.setActionHandler('stop', stopHandler);
    
    // Optionally add seekto if needed
    if (audioRef.current) {
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (!audioRef.current || details.seekTime === undefined) return;
        
        audioRef.current.currentTime = details.seekTime;
      });
    }
  }
};

// Play base64 encoded audio
export const playBase64Audio = (
  base64Data: string,
  audioRef: RefObject<HTMLAudioElement>,
  callbacks: {
    onPlayStart?: () => void;
    onPlayError?: (errorMsg: string) => void;
    onTimeUpdate?: (currentTime: number) => void;
    onPlayEnd?: () => void;
    setCurrentVolume?: (volume: number) => void;
  }
): void => {
  const { onPlayStart, onPlayError, onTimeUpdate, onPlayEnd, setCurrentVolume } = callbacks;
  
  if (!audioRef.current) {
    if (onPlayError) onPlayError("Audio element not available");
    return;
  }
  
  // Check if the data URL is valid
  if (!base64Data || !base64Data.startsWith('data:audio/')) {
    if (onPlayError) onPlayError("Invalid audio data");
    return;
  }
  
  try {
    // Set the source to the base64 data
    audioRef.current.src = base64Data;
    
    // Set up event handlers
    const handlePlay = () => {
      if (onPlayStart) onPlayStart();
    };
    
    const handleTimeUpdate = () => {
      if (audioRef.current && onTimeUpdate) {
        onTimeUpdate(audioRef.current.currentTime);
      }
    };
    
    const handleEnded = () => {
      if (onPlayEnd) onPlayEnd();
      
      // Clean up event listeners
      if (audioRef.current) {
        audioRef.current.removeEventListener('play', handlePlay);
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        audioRef.current.removeEventListener('ended', handleEnded);
      }
    };
    
    // Check if volume can be set
    if (audioRef.current && setCurrentVolume) {
      setCurrentVolume(audioRef.current.volume);
    }
    
    // Add the event listeners
    audioRef.current.addEventListener('play', handlePlay);
    audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
    audioRef.current.addEventListener('ended', handleEnded);
    
    // Try to play the audio
    audioRef.current.load();
    
    audioRef.current.play()
      .then(() => {
        if (onPlayStart) onPlayStart();
      })
      .catch((error) => {
        console.error("Error playing base64 audio:", error);
        if (onPlayError) onPlayError("Couldn't play audio: " + error.message);
      });
    
  } catch (error) {
    console.error("Exception playing base64 audio:", error);
    if (onPlayError) onPlayError("Couldn't process audio data");
  }
};
