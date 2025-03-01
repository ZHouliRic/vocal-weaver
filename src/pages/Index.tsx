
import { useState, useEffect, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Mic, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { availableVoices, generateAudio } from "@/services/audioService";

import VoiceSelector, { Voice } from "@/components/VoiceSelector";
import AudioPlayer from "@/components/AudioPlayer";
import AudioSettings from "@/components/AudioSettings";
import AudioHistory from "@/components/AudioHistory";
import { HistoryItem } from "@/components/AudioHistoryItem";

const Index = () => {
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(false);
  const [text, setText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("generate");
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [activeHistoryItemId, setActiveHistoryItemId] = useState<string | null>(null);
  
  // Settings state
  const [speechRate, setSpeechRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [stability, setStability] = useState(0.5);
  const [similarityBoost, setSimilarityBoost] = useState(0.75);
  const [style, setStyle] = useState(0.5);
  const [language, setLanguage] = useState("en");
  const [speakerBoost, setSpeakerBoost] = useState(true);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Set default voice on first load
  useEffect(() => {
    if (availableVoices.length > 0 && !selectedVoice) {
      setSelectedVoice(availableVoices[0]);
    }
    
    // Focus the textarea
    if (textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, []);
  
  const generateTextToSpeech = async () => {
    if (!text.trim()) {
      toast.error("Please enter some text to generate audio");
      return;
    }
    
    if (!selectedVoice) {
      toast.error("Please select a voice");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const audioUrl = await generateAudio(text, selectedVoice.id, {
        speechRate,
        pitch,
        stability,
        similarityBoost,
        style,
        language,
        speakerBoost,
      });
      
      setGeneratedAudioUrl(audioUrl);
      
      // Add to history
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        text,
        audioUrl,
        voiceName: selectedVoice.name,
        createdAt: new Date(),
      };
      
      setHistoryItems((prevItems) => [newHistoryItem, ...prevItems]);
      setActiveHistoryItemId(newHistoryItem.id);
      
      toast.success("Audio generated successfully");
    } catch (error) {
      console.error("Failed to generate audio:", error);
      toast.error("Failed to generate audio. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePlayFromHistory = (item: HistoryItem) => {
    setGeneratedAudioUrl(item.audioUrl);
    setActiveHistoryItemId(item.id);
    setText(item.text);
    
    // Find the matching voice
    const voice = availableVoices.find((v) => v.name === item.voiceName);
    if (voice) {
      setSelectedVoice(voice);
    }
  };
  
  const handleDeleteFromHistory = (id: string) => {
    setHistoryItems((prevItems) => prevItems.filter((item) => item.id !== id));
    
    if (activeHistoryItemId === id) {
      setActiveHistoryItemId(null);
    }
    
    toast.success("Item removed from history");
  };
  
  const handleRandomExample = () => {
    const examples = [
      "Welcome to our new product showcase! We're excited to present our latest innovation.",
      "The gentle rain created a soothing melody as it tapped against the windowpane.",
      "In this tutorial, I'll guide you through the steps to create your own website from scratch.",
      "The cosmic dance of stars and galaxies reveals the beautiful complexity of our universe.",
      "Thank you for joining our community. We're thrilled to have you on board!",
      "Today, we're going to explore the fascinating history of ancient civilizations.",
    ];
    
    const randomExample = examples[Math.floor(Math.random() * examples.length)];
    setText(randomExample);
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 lg:p-8 animate-fade-in">
      <div className="w-full max-w-7xl mx-auto">
        <div className="text-center mb-8 md:mb-12 animate-slide-down">
          <Badge variant="outline" className="mb-3 py-1 px-3 animate-fade-in">
            Audio Generation
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 text-balance">
            Transform Text into Natural Speech
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-balance">
            Convert your written words into lifelike audio with advanced voice technology.
            Choose from multiple voices and customize the output to suit your needs.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {!isMobile && (
            <div className="lg:col-span-1 animate-slide-up delayed-100">
              <AudioHistory
                historyItems={historyItems}
                activeItemId={activeHistoryItemId}
                onPlayItem={handlePlayFromHistory}
                onDeleteItem={handleDeleteFromHistory}
              />
            </div>
          )}
          
          <div className={`${isMobile ? "col-span-1" : "lg:col-span-2"} space-y-6 animate-slide-up delayed-200`}>
            {isMobile && (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="generate">Generate</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
                
                <TabsContent value="history" className="mt-0">
                  <AudioHistory
                    historyItems={historyItems}
                    activeItemId={activeHistoryItemId}
                    onPlayItem={handlePlayFromHistory}
                    onDeleteItem={handleDeleteFromHistory}
                  />
                </TabsContent>
                
                <TabsContent value="generate" className="mt-0 space-y-6">
                  {/* Mobile Generate Content */}
                  <Card className="p-4 border-border/50 bg-background/80 backdrop-blur-sm">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label htmlFor="text-input" className="text-sm font-medium">
                            Text to convert
                          </label>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={handleRandomExample}
                            className="h-7 text-xs"
                          >
                            Example
                          </Button>
                        </div>
                        
                        <div className="text-area-container">
                          <Textarea
                            ref={textareaRef}
                            id="text-input"
                            placeholder="Type or paste the text you want to convert to speech..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="min-h-32 resize-y bg-background/50 border-border/50 transition-all"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Voice
                        </label>
                        <VoiceSelector
                          voices={availableVoices}
                          selectedVoice={selectedVoice}
                          onSelectVoice={setSelectedVoice}
                        />
                      </div>
                      
                      <AudioSettings
                        speechRate={speechRate}
                        onSpeechRateChange={setSpeechRate}
                        pitch={pitch}
                        onPitchChange={setPitch}
                        stability={stability}
                        onStabilityChange={setStability}
                        similarityBoost={similarityBoost}
                        onSimilarityBoostChange={setSimilarityBoost}
                        style={style}
                        onStyleChange={setStyle}
                        language={language}
                        onLanguageChange={setLanguage}
                        speakerBoost={speakerBoost}
                        onSpeakerBoostChange={setSpeakerBoost}
                      />
                      
                      <div className="pt-2">
                        <Button
                          onClick={generateTextToSpeech}
                          disabled={isLoading || !text.trim() || !selectedVoice}
                          className="w-full h-12"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Wand2 className="mr-2 h-4 w-4" />
                              Generate Audio
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                  
                  {generatedAudioUrl && (
                    <AudioPlayer
                      audioUrl={generatedAudioUrl}
                    />
                  )}
                </TabsContent>
              </Tabs>
            )}
            
            {!isMobile && (
              <>
                <Card className="p-6 border-border/50 bg-background/80 backdrop-blur-sm">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label htmlFor="text-input" className="text-sm font-medium">
                          Text to convert
                        </label>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={handleRandomExample}
                          className="h-7 text-xs"
                        >
                          Example
                        </Button>
                      </div>
                      
                      <div className="text-area-container">
                        <Textarea
                          ref={textareaRef}
                          id="text-input"
                          placeholder="Type or paste the text you want to convert to speech..."
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          className="min-h-36 resize-y bg-background/50 border-border/50 transition-all"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Voice
                        </label>
                        <VoiceSelector
                          voices={availableVoices}
                          selectedVoice={selectedVoice}
                          onSelectVoice={setSelectedVoice}
                        />
                      </div>
                      
                      <div className="space-y-2 flex items-end">
                        <Button
                          onClick={generateTextToSpeech}
                          disabled={isLoading || !text.trim() || !selectedVoice}
                          className="w-full h-12"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Wand2 className="mr-2 h-4 w-4" />
                              Generate Audio
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <Separator className="my-2" />
                    
                    <AudioSettings
                      speechRate={speechRate}
                      onSpeechRateChange={setSpeechRate}
                      pitch={pitch}
                      onPitchChange={setPitch}
                      stability={stability}
                      onStabilityChange={setStability}
                      similarityBoost={similarityBoost}
                      onSimilarityBoostChange={setSimilarityBoost}
                      style={style}
                      onStyleChange={setStyle}
                      language={language}
                      onLanguageChange={setLanguage}
                      speakerBoost={speakerBoost}
                      onSpeakerBoostChange={setSpeakerBoost}
                    />
                  </div>
                </Card>
                
                {generatedAudioUrl && (
                  <AudioPlayer
                    audioUrl={generatedAudioUrl}
                  />
                )}
              </>
            )}
          </div>
        </div>
        
        <div className="mt-8 text-center text-xs text-muted-foreground animate-fade-in delayed-400">
          <p>Enter text, choose a voice, adjust settings, and generate natural-sounding audio.</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
