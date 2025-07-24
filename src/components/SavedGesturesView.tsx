import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";
import { Eye, Search, Volume2, Trash2 } from "lucide-react";
import type { Preset } from "./PresetManager";

interface SavedGesture {
  gestureId: string;
  phrase: string;
  presetId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SavedGesturesViewProps {
  savedGestures: Record<string, Record<string, SavedGesture>>;
  presets: Preset[];
  onDeleteGesture: (presetId: string, gestureId: string) => void;
  onTestPhrase: (phrase: string) => void;
}

export const SavedGesturesView = ({
  savedGestures,
  presets,
  onDeleteGesture,
  onTestPhrase
}: SavedGesturesViewProps) => {
  const [selectedPreset, setSelectedPreset] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const formatGestureBinary = (gestureId: string) => {
    const binary = gestureId.replace("G_", "");
    return binary.split("").join(" ");
  };

  const getFingerNames = (gestureId: string) => {
    const fingers = ["Thumb", "Index", "Middle", "Ring", "Pinky"];
    const binary = gestureId.replace("G_", "");
    return fingers.filter((_, index) => binary[index] === "1");
  };

  const getAllGestures = () => {
    const allGestures: (SavedGesture & { presetName: string })[] = [];
    
    Object.entries(savedGestures).forEach(([presetId, gestures]) => {
      const preset = presets.find(p => p.id === presetId);
      if (preset) {
        Object.values(gestures).forEach(gesture => {
          allGestures.push({
            ...gesture,
            presetName: preset.name
          });
        });
      }
    });

    return allGestures;
  };

  const getFilteredGestures = () => {
    let gestures = getAllGestures();

    // Filter by preset
    if (selectedPreset !== "all") {
      gestures = gestures.filter(g => g.presetId === selectedPreset);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      gestures = gestures.filter(g => 
        g.phrase.toLowerCase().includes(search) ||
        g.gestureId.toLowerCase().includes(search) ||
        g.presetName.toLowerCase().includes(search) ||
        getFingerNames(g.gestureId).some(finger => finger.toLowerCase().includes(search))
      );
    }

    return gestures.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  };

  const filteredGestures = getFilteredGestures();

  const handleDeleteGesture = (gesture: SavedGesture & { presetName: string }) => {
    if (confirm(`Are you sure you want to delete this gesture from "${gesture.presetName}"?\n\nGesture: ${gesture.gestureId}\nPhrase: "${gesture.phrase}"`)) {
      onDeleteGesture(gesture.presetId, gesture.gestureId);
      toast.success("Gesture deleted successfully");
    }
  };

  const totalGestures = getAllGestures().length;
  const uniqueGestureIds = new Set(getAllGestures().map(g => g.gestureId)).size;

  return (
    <Card className="shadow-glow border-0 bg-card/95 backdrop-blur-md animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-accent" />
              Saved Gestures
            </CardTitle>
            <CardDescription>
              View and manage all your gesture configurations
            </CardDescription>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{totalGestures} total gestures</span>
            <span>{uniqueGestureIds} unique patterns</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="flex gap-4 items-end">
          <div className="flex-1 space-y-2">
            <Label className="text-sm font-medium">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by phrase, gesture ID, or fingers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">Filter by Preset</Label>
            <Select value={selectedPreset} onValueChange={setSelectedPreset}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Presets</SelectItem>
                {presets.map((preset) => (
                  <SelectItem key={preset.id} value={preset.id}>
                    {preset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Gestures List */}
        {filteredGestures.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No gestures found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? "Try adjusting your search terms" : "Start creating gestures to see them here"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredGestures.map((gesture) => (
              <div
                key={`${gesture.presetId}-${gesture.gestureId}`}
                className="p-4 bg-gradient-card rounded-lg border transition-all duration-300 hover:shadow-primary hover:scale-105 group"
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <code className="text-sm font-mono text-primary font-bold">
                        {gesture.gestureId}
                      </code>
                      <Badge variant="secondary" className="text-xs">
                        {gesture.presetName}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onTestPhrase(gesture.phrase)}
                        title="Test phrase (Text-to-Speech)"
                      >
                        <Volume2 className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteGesture(gesture)}
                        title="Delete gesture"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Finger Pattern */}
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Finger Pattern:</p>
                    <div className="text-xs font-mono bg-muted/30 p-2 rounded">
                      {formatGestureBinary(gesture.gestureId)}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {getFingerNames(gesture.gestureId).map((finger) => (
                        <Badge key={finger} variant="outline" className="text-xs">
                          {finger}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Phrase */}
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Voice Output:</p>
                    <p className="text-sm text-foreground font-medium break-words">
                      "{gesture.phrase}"
                    </p>
                  </div>

                  {/* Timestamps */}
                  <div className="text-xs text-muted-foreground pt-2 border-t border-border/50">
                    <p>Updated: {gesture.updatedAt.toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};