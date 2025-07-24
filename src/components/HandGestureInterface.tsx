import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Save, RefreshCw, User, LogOut, Hand, Sparkles, Eye, Volume2 } from "lucide-react";
import realisticHandImage from "@/assets/realistic-hand.png";
import { PresetManager, type Preset } from "./PresetManager";
import { SavedGesturesView } from "./SavedGesturesView";

interface Finger {
  id: string;
  name: string;
  position: { x: number; y: number };
}

interface SavedGesture {
  gestureId: string;
  phrase: string;
  presetId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface HandGestureInterfaceProps {
  username: string;
  onLogout: () => void;
}

const fingers: Finger[] = [
  { id: "thumb", name: "Thumb", position: { x: 15, y: 65 } },
  { id: "index", name: "Index", position: { x: 35, y: 20 } },
  { id: "middle", name: "Middle", position: { x: 50, y: 15 } },
  { id: "ring", name: "Ring", position: { x: 65, y: 25 } },
  { id: "pinky", name: "Pinky", position: { x: 80, y: 45 } }
];

export const HandGestureInterface = ({ username, onLogout }: HandGestureInterfaceProps) => {
  // Core gesture state (keeping exact same functionality)
  const [selectedFingers, setSelectedFingers] = useState<Set<string>>(new Set());
  const [gesturePhrase, setGesturePhrase] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Preset management state
  const [presets, setPresets] = useState<Preset[]>([]);
  const [activePreset, setActivePreset] = useState<Preset | null>(null);
  const [savedGestures, setSavedGestures] = useState<Record<string, Record<string, SavedGesture>>>({});
  const [activeTab, setActiveTab] = useState("create");

  // Initialize with default preset
  useEffect(() => {
    const defaultPreset: Preset = {
      id: "default",
      name: "Default",
      description: "Default gesture preset",
      createdAt: new Date()
    };
    setPresets([defaultPreset]);
    setActivePreset(defaultPreset);
    setSavedGestures({ default: {} });
  }, []);

  // EXACT SAME toggle finger functionality
  const toggleFinger = (fingerId: string) => {
    const newSelected = new Set(selectedFingers);
    if (newSelected.has(fingerId)) {
      newSelected.delete(fingerId);
    } else {
      newSelected.add(fingerId);
    }
    setSelectedFingers(newSelected);
  };

  // EXACT SAME gesture ID generation
  const generateGestureId = () => {
    return "G_" + fingers.map(finger => 
      selectedFingers.has(finger.id) ? "1" : "0"
    ).join("");
  };

  // Enhanced save function with preset support
  const handleSave = async () => {
    if (selectedFingers.size === 0) {
      toast.error("Please select at least one finger");
      return;
    }

    if (!gesturePhrase.trim()) {
      toast.error("Please enter a phrase for this gesture");
      return;
    }

    if (!activePreset) {
      toast.error("No active preset selected");
      return;
    }

    setIsLoading(true);
    const gestureId = generateGestureId();

    try {
      // Simulate API call (same as before)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save to preset-specific storage
      const newGesture: SavedGesture = {
        gestureId,
        phrase: gesturePhrase.trim(),
        presetId: activePreset.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setSavedGestures(prev => ({
        ...prev,
        [activePreset.id]: {
          ...prev[activePreset.id],
          [gestureId]: newGesture
        }
      }));

      toast.success(`Gesture ${gestureId} saved to "${activePreset.name}"!`);
      setGesturePhrase("");
    } catch (error) {
      toast.error("Failed to save gesture. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // EXACT SAME clear functionality
  const clearGesture = () => {
    setSelectedFingers(new Set());
    setGesturePhrase("");
    toast.info("Gesture cleared");
  };

  // Preset management functions
  const handleCreatePreset = (presetData: Omit<Preset, 'id' | 'createdAt'>) => {
    const newPreset: Preset = {
      ...presetData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    
    setPresets(prev => [...prev, newPreset]);
    setSavedGestures(prev => ({ ...prev, [newPreset.id]: {} }));
    setActivePreset(newPreset);
  };

  const handleSelectPreset = (preset: Preset) => {
    setActivePreset(preset);
    // Clear current gesture when switching presets
    clearGesture();
  };

  const handleDeletePreset = (presetId: string) => {
    setPresets(prev => prev.filter(p => p.id !== presetId));
    setSavedGestures(prev => {
      const newSaved = { ...prev };
      delete newSaved[presetId];
      return newSaved;
    });
    
    // If deleted preset was active, switch to first available
    if (activePreset?.id === presetId) {
      const remainingPresets = presets.filter(p => p.id !== presetId);
      setActivePreset(remainingPresets[0] || null);
    }
  };

  const handleUpdatePreset = (presetId: string, updates: Partial<Preset>) => {
    setPresets(prev => prev.map(p => 
      p.id === presetId ? { ...p, ...updates } : p
    ));
    
    if (activePreset?.id === presetId) {
      setActivePreset(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const handleDeleteGesture = (presetId: string, gestureId: string) => {
    setSavedGestures(prev => {
      const newSaved = { ...prev };
      if (newSaved[presetId]) {
        delete newSaved[presetId][gestureId];
      }
      return newSaved;
    });
  };

  const handleTestPhrase = (phrase: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(phrase);
      speechSynthesis.speak(utterance);
      toast.success("Playing phrase...");
    } else {
      toast.error("Text-to-speech not supported in this browser");
    }
  };

  // EXACT SAME gesture ID and phrase logic
  const currentGestureId = generateGestureId();
  const currentPresetGestures = activePreset ? savedGestures[activePreset.id] || {} : {};
  const hasExistingPhrase = currentPresetGestures[currentGestureId];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center shadow-primary">
              <Hand className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                GestureCraft
              </h1>
              <p className="text-sm text-muted-foreground">Gesture Customization Interface</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-card/80 rounded-lg backdrop-blur-sm border">
              <User className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{username}</span>
            </div>
            <Button variant="outline" onClick={onLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Preset Manager */}
          <div className="lg:col-span-1">
            <PresetManager
              presets={presets}
              activePreset={activePreset}
              onCreatePreset={handleCreatePreset}
              onSelectPreset={handleSelectPreset}
              onDeletePreset={handleDeletePreset}
              onUpdatePreset={handleUpdatePreset}
            />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="create" className="gap-2">
                  <Hand className="w-4 h-4" />
                  Create Gesture
                </TabsTrigger>
                <TabsTrigger value="view" className="gap-2">
                  <Eye className="w-4 h-4" />
                  View Saved
                </TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="space-y-8">
                {!activePreset ? (
                  <Card className="shadow-glow border-0 bg-card/95 backdrop-blur-md">
                    <CardContent className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <h3 className="text-lg font-medium mb-2">No Active Preset</h3>
                        <p className="text-muted-foreground">Please create or select a preset to start creating gestures.</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* Hand Interface - EXACT SAME as before */}
                    <Card className="shadow-glow border-0 bg-card/95 backdrop-blur-md animate-fade-in">
                      <CardHeader className="text-center">
                        <CardTitle className="flex items-center justify-center gap-2">
                          <Sparkles className="w-5 h-5 text-primary" />
                          Interactive Hand
                        </CardTitle>
                        <CardDescription>
                          Click on fingers to create your gesture combination
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="flex flex-col items-center space-y-6">
                        <div className="relative w-full max-w-md">
                          <img 
                            src={realisticHandImage} 
                            alt="Interactive Hand" 
                            className="w-full h-auto rounded-lg shadow-lg"
                          />
                          
                          {/* Finger Selection Buttons - EXACT SAME as before */}
                          {fingers.map((finger) => (
                            <Button
                              key={finger.id}
                              variant={selectedFingers.has(finger.id) ? "finger-active" : "finger"}
                              size="finger"
                              className="absolute transform -translate-x-1/2 -translate-y-1/2"
                              style={{
                                left: `${finger.position.x}%`,
                                top: `${finger.position.y}%`,
                              }}
                              onClick={() => toggleFinger(finger.id)}
                            >
                              <div className="text-center">
                                <div className="text-xs font-bold">
                                  {finger.name.slice(0, 3)}
                                </div>
                                <div className="text-xs opacity-75">
                                  {selectedFingers.has(finger.id) ? "1" : "0"}
                                </div>
                              </div>
                            </Button>
                          ))}
                        </div>
                        
                        {/* Finger Labels - EXACT SAME as before */}
                        <div className="grid grid-cols-5 gap-2 w-full max-w-md">
                          {fingers.map((finger) => (
                            <Badge
                              key={finger.id}
                              variant={selectedFingers.has(finger.id) ? "default" : "secondary"}
                              className="justify-center text-xs transition-all duration-300"
                            >
                              {finger.name}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Gesture Configuration - Enhanced with preset context */}
                    <Card className="shadow-glow border-0 bg-card/95 backdrop-blur-md animate-fade-in">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <RefreshCw className="w-5 h-5 text-accent" />
                          Gesture Configuration
                        </CardTitle>
                        <CardDescription>
                          Configure the voice output for your gesture in "{activePreset.name}"
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="space-y-6">
                        {/* Gesture ID Display - EXACT SAME as before */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Generated Gesture ID</Label>
                          <div className="p-4 bg-muted/50 rounded-lg border-2 border-dashed border-border">
                            <code className="text-lg font-mono text-primary font-bold">
                              {currentGestureId}
                            </code>
                            <p className="text-xs text-muted-foreground mt-1">
                              Binary: {fingers.map(f => selectedFingers.has(f.id) ? "1" : "0").join(" ")}
                            </p>
                          </div>
                        </div>

                        {/* Enhanced Existing Phrase Alert with preset info */}
                        {hasExistingPhrase && (
                          <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
                            <p className="text-sm font-medium text-warning-foreground">
                              ⚠️ This gesture already exists in "{activePreset.name}": "{hasExistingPhrase.phrase}"
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Saving will overwrite the existing phrase.
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-2 gap-2 h-8"
                              onClick={() => handleTestPhrase(hasExistingPhrase.phrase)}
                            >
                              <Volume2 className="w-3 h-3" />
                              Test Current Phrase
                            </Button>
                          </div>
                        )}

                        {/* Phrase Input - EXACT SAME as before */}
                        <div className="space-y-2">
                          <Label htmlFor="phrase" className="text-sm font-medium">
                            Voice Output Phrase
                          </Label>
                          <Input
                            id="phrase"
                            placeholder="Enter the phrase to be spoken..."
                            value={gesturePhrase}
                            onChange={(e) => setGesturePhrase(e.target.value)}
                            className="transition-all duration-300 focus:shadow-primary/30 focus:scale-[1.02]"
                          />
                          <p className="text-xs text-muted-foreground">
                            This phrase will be spoken when the gesture is performed
                          </p>
                        </div>

                        {/* Action Buttons - EXACT SAME as before */}
                        <div className="flex gap-3">
                          <Button
                            onClick={handleSave}
                            disabled={isLoading || selectedFingers.size === 0}
                            className="flex-1 gap-2"
                            variant="default"
                          >
                            {isLoading ? (
                              <>
                                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4" />
                                Save to {activePreset.name}
                              </>
                            )}
                          </Button>
                          
                          <Button
                            onClick={clearGesture}
                            variant="outline"
                            className="gap-2"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Clear
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="view">
                <SavedGesturesView
                  savedGestures={savedGestures}
                  presets={presets}
                  onDeleteGesture={handleDeleteGesture}
                  onTestPhrase={handleTestPhrase}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};
