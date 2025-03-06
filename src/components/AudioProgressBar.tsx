
import { Slider } from "@/components/ui/slider";
import { formatTime } from "@/utils/audioUtils";

interface AudioProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (value: number[]) => void;
}

const AudioProgressBar = ({
  currentTime,
  duration,
  onSeek
}: AudioProgressBarProps) => {
  return (
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
          onValueChange={onSeek}
          className="cursor-pointer"
        />
      </div>
      
      <span className="text-xs text-muted-foreground">
        {formatTime(duration)}
      </span>
    </div>
  );
};

export default AudioProgressBar;
