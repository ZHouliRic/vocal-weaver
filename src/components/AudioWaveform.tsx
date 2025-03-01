
import { useEffect, useRef, useState } from "react";

interface AudioWaveformProps {
  isPlaying: boolean;
  isPaused?: boolean;
}

const AudioWaveform = ({ isPlaying, isPaused = false }: AudioWaveformProps) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (isPlaying) {
      setIsVisible(true);
    } else if (!isPaused) {
      const timeout = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      
      return () => clearTimeout(timeout);
    }
  }, [isPlaying, isPaused]);

  if (!isVisible) return null;
  
  return (
    <div className="flex items-end justify-center h-10 space-x-1 py-2 animate-fade-in">
      {[1, 2, 3, 4, 5].map((i) => (
        <div 
          key={i}
          className={`audio-wave ${isPlaying ? `animate-wave${i}` : "h-1"}`}
          style={{
            animationPlayState: isPaused ? "paused" : "running",
            height: isPaused ? "8px" : undefined
          }}
        />
      ))}
    </div>
  );
};

export default AudioWaveform;
