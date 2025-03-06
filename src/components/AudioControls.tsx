
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";

interface AudioControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onSkipForward: () => void;
  onSkipBackward: () => void;
}

const AudioControls = ({
  isPlaying,
  onPlayPause,
  onSkipForward,
  onSkipBackward
}: AudioControlsProps) => {
  return (
    <div className="flex items-center justify-center space-x-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={onSkipBackward}
        className="h-8 w-8"
      >
        <SkipBack size={16} />
      </Button>
      
      <Button
        variant="default"
        size="icon"
        onClick={onPlayPause}
        className="h-10 w-10 rounded-full"
      >
        {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={onSkipForward}
        className="h-8 w-8"
      >
        <SkipForward size={16} />
      </Button>
    </div>
  );
};

export default AudioControls;
