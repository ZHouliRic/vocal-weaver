
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Volume2, Volume1, VolumeX } from "lucide-react";
import AudioWaveform from "./AudioWaveform";

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
      
      // For Web Speech API generated audio (usually in WAV format)
      if (audioUrl.startsWith('data:audio/')) {
        // Handle base64 audio data
        try {
          console.log("Detected base64 audio format, attempting to play");
          handleBase64Audio(audioUrl);
        } catch (error) {
          console.error("Error handling base64 audio:", error);
          setError("Could not process the audio format. Please try again.");
        }
        return;
      }
      
      // For other audio sources
      // Make sure the source is set
      if (!audioRef.current.src || audioRef.current.src !== audioUrl) {
        console.log("Setting audio source to:", audioUrl);
        audioRef.current.src = audioUrl;
        audioRef.current.load();
      }
      
      // Play with a promise to catch any errors
      console.log("Attempting to play audio from URL");
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPaused(false);
            setIsPlaying(true);
            console.log("Audio playing successfully from URL");
          })
          .catch(error => {
            console.error("Play failed:", error);
            
            // Try a fallback method
            setTimeout(() => {
              if (audioRef.current) {
                console.log("Trying fallback play method");
                audioRef.current.play()
                  .then(() => {
                    setIsPaused(false);
                    setIsPlaying(true);
                    console.log("Fallback play successful");
                  })
                  .catch(e => {
                    console.error("Fallback play failed:", e);
                    setError("Could not play audio. Browser may not support this format.");
                  });
              }
            }, 100);
          });
      }
    }
  };
  
  // Handle base64 audio data
  const handleBase64Audio = (dataUrl: string) => {
    console.log("Processing base64 audio");
    
    try {
      // Get the MIME type from the data URL
      const mimeType = dataUrl.split(':')[1].split(';')[0];
      console.log("Detected MIME type:", mimeType);
      
      // Extract the base64 data
      const base64Data = dataUrl.split(',')[1];
      
      // Check if data is valid
      if (!base64Data) {
        console.error("No base64 data found in URL");
        setError("Invalid audio data format");
        return;
      }
      
      // Create a proper audio URL from the base64 data
      const properAudioUrl = `data:${mimeType || 'audio/mpeg'};base64,${base64Data}`;
      console.log("Created proper audio URL with MIME type:", mimeType || 'audio/mpeg');
      
      // First try to play directly
      if (audioRef.current) {
        audioRef.current.src = properAudioUrl;
        audioRef.current.load();
        
        audioRef.current.play()
          .then(() => {
            setIsPaused(false);
            setIsPlaying(true);
            console.log("Direct base64 playback successful");
          })
          .catch(e => {
            console.error("Direct base64 playback failed:", e);
            
            // Try several backup MIME types
            tryWithDifferentMimeTypes(base64Data);
          });
      }
    } catch (e) {
      console.error("Error processing base64 audio:", e);
      setError("Failed to process audio data");
    }
  };
  
  // Try playing the audio with different MIME types
  const tryWithDifferentMimeTypes = (base64Data: string) => {
    console.log("Trying with different MIME types");
    
    // List of MIME types to try
    const mimeTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/mp4', 'audio/aac', 'audio/ogg'];
    let currentIndex = 0;
    let playSuccessful = false;
    
    const tryNextMimeType = () => {
      if (currentIndex >= mimeTypes.length || playSuccessful) {
        if (!playSuccessful) {
          console.error("All MIME types failed");
          setError("Could not play audio. Browser may not support this format.");
        }
        return;
      }
      
      const mimeType = mimeTypes[currentIndex];
      console.log(`Trying with MIME type: ${mimeType} (${currentIndex + 1}/${mimeTypes.length})`);
      
      try {
        // Create binary data from base64
        const byteCharacters = atob(base64Data);
        const byteArrays = [];
        
        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
          const slice = byteCharacters.slice(offset, offset + 512);
          
          const byteNumbers = new Array(slice.length);
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
          
          const byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
        }
        
        // Create blob with current MIME type
        const blob = new Blob(byteArrays, { type: mimeType });
        const blobUrl = URL.createObjectURL(blob);
        
        if (audioRef.current) {
          audioRef.current.src = blobUrl;
          audioRef.current.load();
          
          audioRef.current.oncanplaythrough = () => {
            console.log(`Audio can play through with ${mimeType}`);
            audioRef.current?.play()
              .then(() => {
                console.log(`Successfully playing with ${mimeType}`);
                setIsPaused(false);
                setIsPlaying(true);
                playSuccessful = true;
              })
              .catch(e => {
                console.error(`Failed to play with ${mimeType}:`, e);
                URL.revokeObjectURL(blobUrl);
                currentIndex++;
                tryNextMimeType();
              });
          };
          
          audioRef.current.onerror = () => {
            console.error(`Error loading audio with ${mimeType}`);
            URL.revokeObjectURL(blobUrl);
            currentIndex++;
            tryNextMimeType();
          };
        } else {
          currentIndex++;
          tryNextMimeType();
        }
      } catch (e) {
        console.error(`Error with ${mimeType}:`, e);
        currentIndex++;
        tryNextMimeType();
      }
    };
    
    // Start trying MIME types
    tryNextMimeType();
    
    // If all else fails, try directly with a new Audio object
    if (!playSuccessful) {
      setTimeout(() => {
        if (!playSuccessful) {
          try {
            const fallbackUrl = `data:audio/mpeg;base64,${base64Data}`;
            console.log("Final fallback: trying with new Audio object");
            
            const fallbackAudio = new Audio(fallbackUrl);
            fallbackAudio.oncanplaythrough = () => {
              fallbackAudio.play()
                .then(() => {
                  console.log("Fallback audio playing successfully");
                  setIsPaused(false);
                  setIsPlaying(true);
                  
                  // Update reference and add listeners
                  if (audioRef.current) {
                    audioRef.current.pause();
                  }
                  audioRef.current = fallbackAudio;
                  
                  fallbackAudio.addEventListener("timeupdate", () => {
                    setCurrentTime(fallbackAudio.currentTime);
                  });
                  
                  fallbackAudio.addEventListener("ended", () => {
                    setIsPlaying(false);
                    setCurrentTime(0);
                    if (onEnded) onEnded();
                  });
                  
                  fallbackAudio.volume = volume;
                })
                .catch(e => {
                  console.error("Ultimate fallback failed:", e);
                  setError("Could not play audio. Please try generating it again.");
                });
            };
            
            fallbackAudio.onerror = () => {
              console.error("Error with fallback audio");
              setError("Could not play audio. Browser may not support this format.");
            };
          } catch (e) {
            console.error("Error in final fallback:", e);
            setError("Failed to play audio after multiple attempts.");
          }
        }
      }, 1000);
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
  
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };
  
  return (
    <div className="w-full px-4 py-3 rounded-lg bg-background/50 backdrop-blur-sm border border-border/50 transition-all duration-300 ease-out-expo animate-in animate-scale-in">
      {error && (
        <div className="text-red-500 text-sm mb-2 text-center">{error}</div>
      )}
      
      <div className="flex justify-center mb-2">
        <AudioWaveform isPlaying={isPlaying} isPaused={isPaused} />
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-muted-foreground">
          {formatTime(currentTime)}
        </span>
        
        <div className="flex-1 mx-2">
          <Slider
            value={[currentTime]}
            min={0}
            max={duration || 100}
            step={0.1}
            onValueChange={(value) => seekTo(value[0])}
            className="cursor-pointer"
          />
        </div>
        
        <span className="text-xs text-muted-foreground">
          {formatTime(duration)}
        </span>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            {isMuted ? (
              <VolumeX size={16} />
            ) : volume < 0.5 ? (
              <Volume1 size={16} />
            ) : (
              <Volume2 size={16} />
            )}
          </Button>
          
          <div className="w-20">
            <Slider
              value={[isMuted ? 0 : volume]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
            />
          </div>
        </div>
        
        <div className="flex items-center justify-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={skipBackward}
            className="h-8 w-8"
          >
            <SkipBack size={16} />
          </Button>
          
          <Button
            variant="default"
            size="icon"
            onClick={togglePlayPause}
            className="h-10 w-10 rounded-full"
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={skipForward}
            className="h-8 w-8"
          >
            <SkipForward size={16} />
          </Button>
        </div>
        
        <div className="w-20" />
      </div>
    </div>
  );
};

export default AudioPlayer;
