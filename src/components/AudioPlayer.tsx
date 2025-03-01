
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
      
      // For data URL audio (base64 encoded)
      if (audioUrl.startsWith('data:audio/')) {
        try {
          console.log("Detected data URL audio, attempting to play directly");
          playBase64Audio(audioUrl);
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
  
  // Handle base64 audio data
  const playBase64Audio = (dataUrl: string) => {
    console.log("Processing base64 audio");
    
    try {
      // Detect the MIME type
      const mimeType = dataUrl.split(':')[1].split(';')[0];
      console.log("Detected MIME type:", mimeType);
      
      // Extract the base64 data
      const base64Data = dataUrl.split(',')[1];
      
      if (!base64Data) {
        console.error("No base64 data found in URL");
        setError("Invalid audio data format");
        return;
      }
      
      // Try to play directly first
      if (audioRef.current) {
        console.log("Trying to play base64 audio directly");
        audioRef.current.src = dataUrl;
        audioRef.current.load();
        
        audioRef.current.play()
          .then(() => {
            setIsPaused(false);
            setIsPlaying(true);
            console.log("Base64 audio playing directly");
          })
          .catch(error => {
            console.error("Direct play failed:", error);
            
            // Try with a blob approach
            console.log("Trying blob approach");
            try {
              // Create a Blob from the base64 data
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
              
              // Try common audio MIME types
              const tryWithMimeType = (index = 0) => {
                const mimeTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac'];
                
                if (index >= mimeTypes.length) {
                  console.error("All MIME types failed");
                  setError("Could not play audio. Browser may not support this format.");
                  return;
                }
                
                const currentMimeType = mimeTypes[index];
                console.log(`Trying with MIME type: ${currentMimeType}`);
                
                const blob = new Blob(byteArrays, { type: currentMimeType });
                const blobUrl = URL.createObjectURL(blob);
                
                if (audioRef.current) {
                  audioRef.current.src = blobUrl;
                  audioRef.current.load();
                  
                  audioRef.current.oncanplaythrough = () => {
                    // When can play through, actually play
                    audioRef.current?.play()
                      .then(() => {
                        console.log(`Playing successfully with ${currentMimeType}`);
                        setIsPaused(false);
                        setIsPlaying(true);
                      })
                      .catch(e => {
                        console.error(`Failed to play with ${currentMimeType}:`, e);
                        URL.revokeObjectURL(blobUrl);
                        // Try next MIME type
                        tryWithMimeType(index + 1);
                      });
                  };
                  
                  audioRef.current.onerror = () => {
                    console.error(`Error with ${currentMimeType}`);
                    URL.revokeObjectURL(blobUrl);
                    // Try next MIME type
                    tryWithMimeType(index + 1);
                  };
                } else {
                  URL.revokeObjectURL(blobUrl);
                  setError("Audio player not initialized");
                }
              };
              
              // Start trying different MIME types
              tryWithMimeType();
              
            } catch (e) {
              console.error("Blob approach failed:", e);
              
              // Final fallback - try with a new Audio element
              console.log("Trying final fallback with new Audio element");
              const fallbackAudio = new Audio(dataUrl);
              
              fallbackAudio.oncanplaythrough = () => {
                fallbackAudio.play()
                  .then(() => {
                    console.log("Fallback audio playing successfully");
                    setIsPaused(false);
                    setIsPlaying(true);
                    
                    // Replace the current audio reference
                    if (audioRef.current) {
                      audioRef.current.pause();
                    }
                    audioRef.current = fallbackAudio;
                    
                    // Add event listeners to the new audio element
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
                    console.error("Final fallback failed:", e);
                    setError("Could not play audio. Browser may not support this format.");
                  });
              };
              
              fallbackAudio.onerror = () => {
                console.error("Fallback audio error");
                setError("Could not play audio. Browser may not support this format.");
              };
            }
          });
      } else {
        setError("Audio player not available");
      }
    } catch (e) {
      console.error("Error processing base64 audio:", e);
      setError("Failed to process audio data");
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
