
import { useState, useEffect } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface Voice {
  id: string;
  name: string;
  description?: string;
}

interface VoiceSelectorProps {
  voices: Voice[];
  selectedVoice: Voice | null;
  onSelectVoice: (voice: Voice) => void;
}

const VoiceSelector = ({
  voices,
  selectedVoice,
  onSelectVoice,
}: VoiceSelectorProps) => {
  const [open, setOpen] = useState(false);
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-12 px-4 border-border/50 hover:bg-background/80 backdrop-blur-sm transition-all"
        >
          {selectedVoice
            ? selectedVoice.name
            : "Select voice..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-full min-w-[240px] max-w-[400px]" align="start">
        <Command>
          <CommandInput placeholder="Search voices..." />
          <CommandEmpty>No voice found.</CommandEmpty>
          <ScrollArea className="max-h-[300px]">
            <CommandGroup>
              {voices.map((voice) => (
                <CommandItem
                  key={voice.id}
                  value={voice.name}
                  onSelect={() => {
                    onSelectVoice(voice);
                    setOpen(false);
                  }}
                  className="flex items-center py-2"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedVoice?.id === voice.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{voice.name}</span>
                    {voice.description && (
                      <span className="text-xs text-muted-foreground">
                        {voice.description}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </ScrollArea>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default VoiceSelector;
