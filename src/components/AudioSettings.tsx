
import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export interface AudioSettingsProps {
  speechRate: number;
  onSpeechRateChange: (value: number) => void;
  pitch: number;
  onPitchChange: (value: number) => void;
  stability: number;
  onStabilityChange: (value: number) => void;
  similarityBoost: number;
  onSimilarityBoostChange: (value: number) => void;
  style: number;
  onStyleChange: (value: number) => void;
  language: string;
  onLanguageChange: (value: string) => void;
  speakerBoost: boolean;
  onSpeakerBoostChange: (value: boolean) => void;
}

const languages = [
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
  { value: "es", label: "Spanish" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "pl", label: "Polish" },
  { value: "tr", label: "Turkish" },
  { value: "ru", label: "Russian" },
  { value: "nl", label: "Dutch" },
  { value: "cs", label: "Czech" },
  { value: "ar", label: "Arabic" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "hi", label: "Hindi" },
];

const AudioSettings = ({
  speechRate,
  onSpeechRateChange,
  pitch,
  onPitchChange,
  stability,
  onStabilityChange,
  similarityBoost,
  onSimilarityBoostChange,
  style,
  onStyleChange,
  language,
  onLanguageChange,
  speakerBoost,
  onSpeakerBoostChange,
}: AudioSettingsProps) => {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="settings" className="border-b-0">
        <AccordionTrigger className="text-sm py-2 px-1 hover:no-underline">
          Advanced Settings
        </AccordionTrigger>
        <AccordionContent className="pt-4">
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="speech-rate" className="text-sm">Speech Rate</Label>
                <span className="text-xs text-muted-foreground">{speechRate.toFixed(1)}</span>
              </div>
              <Slider
                id="speech-rate"
                min={0.5}
                max={2}
                step={0.1}
                value={[speechRate]}
                onValueChange={(value) => onSpeechRateChange(value[0])}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="pitch" className="text-sm">Pitch</Label>
                <span className="text-xs text-muted-foreground">{pitch.toFixed(1)}</span>
              </div>
              <Slider
                id="pitch"
                min={0.5}
                max={1.5}
                step={0.1}
                value={[pitch]}
                onValueChange={(value) => onPitchChange(value[0])}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language" className="text-sm">Language</Label>
                <Select value={language} onValueChange={onLanguageChange}>
                  <SelectTrigger id="language" className="w-full">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="speaker-boost" className="text-sm">
                    Speaker Boost
                  </Label>
                  <Switch
                    id="speaker-boost"
                    checked={speakerBoost}
                    onCheckedChange={onSpeakerBoostChange}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enhance voice clarity and presence
                </p>
              </div>
            </div>
            
            <div className="space-y-5 pt-2 border-t border-border/40">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="stability" className="text-sm">Stability</Label>
                  <span className="text-xs text-muted-foreground">{stability.toFixed(2)}</span>
                </div>
                <Slider
                  id="stability"
                  min={0}
                  max={1}
                  step={0.01}
                  value={[stability]}
                  onValueChange={(value) => onStabilityChange(value[0])}
                />
                <p className="text-xs text-muted-foreground">
                  Higher values create more consistent and stable speech
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="similarity-boost" className="text-sm">Similarity Boost</Label>
                  <span className="text-xs text-muted-foreground">{similarityBoost.toFixed(2)}</span>
                </div>
                <Slider
                  id="similarity-boost"
                  min={0}
                  max={1}
                  step={0.01}
                  value={[similarityBoost]}
                  onValueChange={(value) => onSimilarityBoostChange(value[0])}
                />
                <p className="text-xs text-muted-foreground">
                  Higher values make the voice more similar to the original
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="style" className="text-sm">Style</Label>
                  <span className="text-xs text-muted-foreground">{style.toFixed(2)}</span>
                </div>
                <Slider
                  id="style"
                  min={0}
                  max={1}
                  step={0.01}
                  value={[style]}
                  onValueChange={(value) => onStyleChange(value[0])}
                />
                <p className="text-xs text-muted-foreground">
                  Higher values add more emotional range to the voice
                </p>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default AudioSettings;
