
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Volume2, Volume1, VolumeX } from "lucide-react";

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (value: number[]) => void;
  onToggleMute: () => void;
}

const VolumeControl = ({
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute
}: VolumeControlProps) => {
  return (
    <div className="flex items-center space-x-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleMute}
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
          onValueChange={onVolumeChange}
        />
      </div>
    </div>
  );
};

export default VolumeControl;
