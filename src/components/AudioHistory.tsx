
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HistoryItem } from "./AudioHistoryItem";
import AudioHistoryItem from "./AudioHistoryItem";
import { Clock, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface AudioHistoryProps {
  historyItems: HistoryItem[];
  activeItemId: string | null;
  onPlayItem: (item: HistoryItem) => void;
  onDeleteItem: (id: string) => void;
}

const AudioHistory = ({
  historyItems,
  activeItemId,
  onPlayItem,
  onDeleteItem,
}: AudioHistoryProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredItems = searchQuery
    ? historyItems.filter(item => 
        item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.voiceName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : historyItems;
  
  return (
    <div className="rounded-lg border border-border/50 bg-background/50 backdrop-blur-sm h-full flex flex-col overflow-hidden">
      <div className="p-3 border-b border-border/50">
        <div className="flex items-center gap-2 mb-3">
          <Clock size={18} className="text-muted-foreground" />
          <h3 className="font-medium">History</h3>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search history..."
            className="pl-9 bg-background/50 border-border/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <AudioHistoryItem
                key={item.id}
                item={item}
                onPlay={onPlayItem}
                onDelete={onDeleteItem}
                isActive={activeItemId === item.id}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              {searchQuery ? (
                <>
                  <p className="text-muted-foreground mb-1">No results found</p>
                  <p className="text-xs text-muted-foreground">
                    Try a different search term
                  </p>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground mb-1">No history yet</p>
                  <p className="text-xs text-muted-foreground">
                    Generated audio will appear here
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default AudioHistory;
