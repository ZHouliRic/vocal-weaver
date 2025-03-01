
import { useState } from "react";
import { MoreVertical, Trash2, Download, Copy, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface HistoryItem {
  id: string;
  text: string;
  audioUrl: string;
  voiceName: string;
  createdAt: Date;
}

interface AudioHistoryItemProps {
  item: HistoryItem;
  onPlay: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  isActive: boolean;
}

const AudioHistoryItem = ({ 
  item, 
  onPlay, 
  onDelete,
  isActive 
}: AudioHistoryItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };
  
  const handleCopyText = () => {
    navigator.clipboard.writeText(item.text);
    toast.success("Text copied to clipboard");
  };
  
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = item.audioUrl;
    link.download = `audio-${item.id}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Audio downloaded");
  };
  
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };
  
  return (
    <div 
      className={cn(
        "flex items-center justify-between p-3 rounded-lg transition-all duration-200 hover:bg-secondary/50 group cursor-pointer",
        isActive && "bg-secondary/80"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onPlay(item)}
    >
      <div className="flex items-center mr-2">
        <div className={cn(
          "mr-3 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
          isActive || isHovered ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
        )}>
          <PlayCircle size={16} />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-sm truncate max-w-[180px] md:max-w-xs">
            {truncateText(item.text, 60)}
          </p>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-xs text-muted-foreground">{item.voiceName}</span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</span>
          </div>
        </div>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreVertical size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={(e) => {
            e.stopPropagation();
            handleCopyText();
          }}>
            <Copy className="mr-2 h-4 w-4" />
            <span>Copy text</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => {
            e.stopPropagation();
            handleDownload();
          }}>
            <Download className="mr-2 h-4 w-4" />
            <span>Download audio</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-destructive focus:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default AudioHistoryItem;
