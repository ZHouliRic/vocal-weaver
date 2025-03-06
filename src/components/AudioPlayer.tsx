
import { useRef, useState, useEffect } from "react";
import AudioWaveform from "./AudioWaveform";
import AudioControls from "./AudioControls";
import VolumeControl from "./VolumeControl";
import AudioProgressBar from "./AudioProgressBar";
import { playBase64Audio } from "@/utils/audioUtils";

interface AudioPlayerProps {
  audioUrl: string;
  onEnded?: () => void;
}

const AudioPlayer = ({ audioUrl, onEnded }: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [isMuted, setIsMuted] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when audioUrl changes
  useEffect(() => {
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentTime(0);
    setAudioLoaded(false);
    setError(null);
    
    // Log for debugging
    console.log("Audio URL changed:", audioUrl);
  }, [audioUrl]);

  useEffect(() => {
    // Create new audio element
    const audio = new Audio();
    audioRef.current = audio;
    
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setAudioLoaded(true);
      console.log("Audio metadata loaded, duration:", audio.duration);
    };
    
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (onEnded) onEnded();
      console.log("Audio playback ended");
    };
    
    const handleError = (e: ErrorEvent) => {
      console.error("Audio error:", e);
      setError("Failed to load audio. Please try again.");
      setIsPlaying(false);
    };
    
    // Add event listeners
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError as EventListener);
    
    // Set audio source and preload
    audio.src = audioUrl;
    audio.preload = "auto";
    
    // Set initial volume
    audio.volume = volume;
    
    // Try to load the audio
    audio.load();
    console.log("Audio element created with src:", audioUrl);
    
    // Cleanup function
    return () => {
      console.log("Cleaning up audio element");
      audio.pause();
      audio.src = "";
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError as EventListener);
    };
  }, [audioUrl, onEnded]);
  
  const togglePlayPause = () => {
    if (!audioRef.current) {
      console.error("Audio element not available");
      return;
    }
    
    console.log("Toggle play/pause, current state:", isPlaying);
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPaused(true);
      setIsPlaying(false);
      console.log("Audio paused");
    } else {
      // Check if audio URL is valid
      if (!audioUrl || audioUrl === 'undefined' || audioUrl === 'null') {
        setError("No audio available to play");
        console.error("Invalid audio URL:", audioUrl);
        return;
      }
      
      // For data URL audio (base64 encoded)
      if (audioUrl.startsWith('data:audio/')) {
        try {
          console.log("Detected data URL audio, attempting to play directly");
          playBase64Audio(audioUrl, audioRef, {
            onPlayStart: () => {
              setIsPaused(false);
              setIsPlaying(true);
            },
            onPlayError: (errorMsg) => {
              setError(errorMsg);
            },
            onTimeUpdate: (time) => {
              setCurrentTime(time);
            },
            onPlayEnd: () => {
              setIsPlaying(false);
              setCurrentTime(0);
              if (onEnded) onEnded();
            },
            setCurrentVolume: (vol) => {
              setVolume(vol);
            }
          });
          return;
        } catch (error) {
          console.error("Error handling data URL audio:", error);
        }
      }
      
      // For standard audio files
      if (audioRef.current) {
        // Make sure the source is set
        if (audioRef.current.src !== audioUrl) {
          console.log("Setting audio source to:", audioUrl);
          audioRef.current.src = audioUrl;
          audioRef.current.load();
        }
        
        // Play with a promise
        console.log("Attempting to play audio from URL");
        audioRef.current.play()
          .then(() => {
            setIsPaused(false);
            setIsPlaying(true);
            console.log("Audio playing successfully");
          })
          .catch(error => {
            console.error("Play failed:", error);
            setError("Could not play audio. Please try again.");
          });
      }
    }
  };
  
  const seekTo = (time: number) => {
    if (!audioRef.current) return;
    
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };
  
  const skipForward = () => {
    if (!audioRef.current) return;
    
    const newTime = Math.min(audioRef.current.currentTime + 10, duration);
    seekTo(newTime);
  };
  
  const skipBackward = () => {
    if (!audioRef.current) return;
    
    const newTime = Math.max(audioRef.current.currentTime - 10, 0);
    seekTo(newTime);
  };
  
  const handleVolumeChange = (value: number[]) => {
    if (!audioRef.current) return;
    
    const newVolume = value[0];
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
    
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };
  
  const toggleMute = () => {
    if (!audioRef.current) return;
    
    if (isMuted) {
      audioRef.current.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };
  
  const handleSeek = (value: number[]) => {
    seekTo(value[0]);
  };
  
  return (
    <div className="w-full px-4 py-3 rounded-lg bg-background/50 backdrop-blur-sm border border-border/50 transition-all duration-300 ease-out-expo animate-in animate-scale-in">
      {error && (
        <div className="text-red-500 text-sm mb-2 text-center">{error}</div>
      )}
      
      <div className="flex justify-center mb-2">
        <AudioWaveform isPlaying={isPlaying} isPaused={isPaused} />
      </div>
      
      <AudioProgressBar
        currentTime={currentTime}
        duration={duration}
        onSeek={handleSeek}
      />
      
      <div className="flex items-center justify-between">
        <VolumeControl
          volume={volume}
          isMuted={isMuted}
          onVolumeChange={handleVolumeChange}
          onToggleMute={toggleMute}
        />
        
        <AudioControls
          isPlaying={isPlaying}
          onPlayPause={togglePlayPause}
          onSkipForward={skipForward}
          onSkipBackward={skipBackward}
        />
        
        <div className="w-20" />
      </div>
    </div>
  );
};

export default AudioPlayer;
