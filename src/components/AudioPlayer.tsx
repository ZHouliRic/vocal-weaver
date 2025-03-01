
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
      // For Web Speech API generated audio (usually in WAV format)
      if (audioUrl.startsWith('data:audio/wav;base64,')) {
        // Convert WAV base64 to MP3 (browser compatible format)
        try {
          console.log("Detected Web Speech API audio format, converting to playable format");
          convertAndPlayAudio(audioUrl);
        } catch (error) {
          console.error("Error converting audio:", error);
          setError("Could not process the audio format. Please try again.");
        }
        return;
      }
      
      // For other audio sources
      // Make sure the source is set
      if (!audioRef.current.src || audioRef.current.src !== audioUrl) {
        console.log("Resetting audio source");
        audioRef.current.src = audioUrl;
        audioRef.current.load();
      }
      
      // Play with a promise to catch any errors
      console.log("Attempting to play audio");
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPaused(false);
            setIsPlaying(true);
            console.log("Audio playing successfully");
          })
          .catch(error => {
            console.error("Play failed:", error);
            
            // Special handling for base64 data URLs
            if (audioUrl.startsWith('data:audio/')) {
              console.log("Trying alternative method for base64 audio");
              tryPlayBase64Audio(audioUrl);
            } else {
              // Try a fallback method for mobile devices
              setTimeout(() => {
                if (audioRef.current) {
                  console.log("Trying fallback play method");
                  audioRef.current.play()
                    .then(() => {
                      setIsPaused(false);
                      setIsPlaying(true);
                      console.log("Fallback play successful");
                    })
                    .catch(e => console.error("Fallback play failed:", e));
                }
              }, 100);
            }
          });
      }
    }
  };
  
  // Convert WAV to MP3 format for better browser compatibility
  const convertAndPlayAudio = (dataUrl: string) => {
    try {
      // For Web Speech API, we need to ensure we're using the right MIME type
      // Most browsers support MP3 better than WAV
      
      // Extract the base64 data
      const base64Data = dataUrl.split(',')[1];
      if (!base64Data) {
        setError("Invalid audio data format");
        return;
      }
      
      // Create blob with the correct MIME type
      // Force the MIME type to audio/mpeg for better compatibility
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      
      // Try with different MIME types if one doesn't work
      const mimeTypes = ['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/aac'];
      let audioBlob = null;
      let playSuccessful = false;
      
      // We need to handle the MIME types sequentially
      const tryMimeType = (index: number) => {
        if (index >= mimeTypes.length || playSuccessful) {
          // We've either tried all MIME types or found a successful one
          if (!playSuccessful && !audioBlob) {
            tryFallbackAudio();
          }
          return;
        }
        
        const mimeType = mimeTypes[index];
        
        try {
          audioBlob = new Blob([byteArray], { type: mimeType });
          const blobUrl = URL.createObjectURL(audioBlob);
          
          if (audioRef.current) {
            console.log(`Trying with MIME type: ${mimeType}`);
            audioRef.current.src = blobUrl;
            audioRef.current.load();
            
            // Play the audio
            audioRef.current.play()
              .then(() => {
                setIsPaused(false);
                setIsPlaying(true);
                console.log(`Audio playing successfully with ${mimeType}`);
                playSuccessful = true; // Mark as successful instead of using break
              })
              .catch(e => {
                console.error(`Failed to play with ${mimeType}:`, e);
                URL.revokeObjectURL(blobUrl); // Clean up
                // Try the next MIME type
                tryMimeType(index + 1);
              });
          } else {
            tryMimeType(index + 1);
          }
        } catch (error) {
          console.error(`Error with ${mimeType}:`, error);
          // Try the next MIME type
          tryMimeType(index + 1);
        }
      };
      
      // Start trying the first MIME type
      tryMimeType(0);
      
      // If all MIME types failed, try a different approach
      const tryFallbackAudio = () => {
        // Create an Audio object with the original URL as a fallback
        const fallbackAudio = new Audio(dataUrl);
        fallbackAudio.play()
          .then(() => {
            setIsPaused(false);
            setIsPlaying(true);
            console.log("Fallback audio playing successfully");
            
            // Update audio reference
            if (audioRef.current) {
              audioRef.current.pause();
            }
            audioRef.current = fallbackAudio;
            
            // Add event listeners
            fallbackAudio.addEventListener("timeupdate", () => setCurrentTime(fallbackAudio.currentTime));
            fallbackAudio.addEventListener("ended", () => {
              setIsPlaying(false);
              setCurrentTime(0);
              if (onEnded) onEnded();
            });
            fallbackAudio.volume = volume;
          })
          .catch(e => {
            console.error("All fallback methods failed:", e);
            setError("Could not play audio. Browser may not support this format.");
          });
      };
    } catch (e) {
      console.error("Error processing base64 audio:", e);
      setError("Failed to process audio data.");
    }
  };
  
  // Special handling for base64 data URLs
  const tryPlayBase64Audio = (dataUrl: string) => {
    try {
      // Convert base64 to blob
      const byteString = atob(dataUrl.split(',')[1]);
      const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      
      const blob = new Blob([ab], { type: mimeString });
      const blobUrl = URL.createObjectURL(blob);
      
      if (audioRef.current) {
        console.log("Playing from Blob URL:", blobUrl);
        audioRef.current.src = blobUrl;
        audioRef.current.load();
        audioRef.current.play()
          .then(() => {
            setIsPaused(false);
            setIsPlaying(true);
            console.log("Base64 audio playing successfully");
          })
          .catch(e => {
            console.error("Base64 play failed:", e);
            // Try with different MIME types
            convertAndPlayAudio(dataUrl);
          });
      }
    } catch (e) {
      console.error("Error processing base64 audio:", e);
      setError("Failed to process audio data.");
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
