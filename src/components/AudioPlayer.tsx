
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

  // Reset state when audioUrl changes
  useEffect(() => {
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentTime(0);
  }, [audioUrl]);

  useEffect(() => {
    // Create new audio element
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };
    
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (onEnded) onEnded();
    };
    
    // Add event listeners
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    
    // Set initial volume
    audio.volume = volume;
    
    // Cleanup function
    return () => {
      audio.pause();
      audio.src = "";
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl, onEnded]);
  
  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPaused(true);
    } else {
      // Explicitly set the current src again to ensure it's loaded
      if (!audioRef.current.src || audioRef.current.src !== audioUrl) {
        audioRef.current.src = audioUrl;
      }
      
      // Play with a promise to catch any errors
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPaused(false);
            setIsPlaying(true);
          })
          .catch(error => {
            console.error("Play failed:", error);
            // Try a fallback method for mobile devices
            setTimeout(() => {
              if (audioRef.current) {
                audioRef.current.play()
                  .then(() => {
                    setIsPaused(false);
                    setIsPlaying(true);
                  })
                  .catch(e => console.error("Fallback play failed:", e));
              }
            }, 100);
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
  
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };
  
  return (
    <div className="w-full px-4 py-3 rounded-lg bg-background/50 backdrop-blur-sm border border-border/50 transition-all duration-300 ease-out-expo animate-in animate-scale-in">
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
