import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Save, RefreshCw, User, LogOut, Hand, Sparkles } from "lucide-react";
import realisticHandImage from "@/assets/realistic-hand.png";

interface Finger {
  id: string;
  name: string;
  position: { x: number; y: number };
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
  const [selectedFingers, setSelectedFingers] = useState<Set<string>>(new Set());
  const [gesturePhrase, setGesturePhrase] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [savedGestures, setSavedGestures] = useState<Record<string, string>>({});

  const toggleFinger = (fingerId: string) => {
    const newSelected = new Set(selectedFingers);
    if (newSelected.has(fingerId)) {
      newSelected.delete(fingerId);
    } else {
      newSelected.add(fingerId);
    }
    setSelectedFingers(newSelected);
  };

  const generateGestureId = () => {
    return "G_" + fingers.map(finger =>
      selectedFingers.has(finger.id) ? "1" : "0"
    ).join("");
  };

  const handleSave = async () => {
    if (selectedFingers.size === 0) {
      toast.error("Please select at least one finger");
      return;
    }

    if (!gesturePhrase.trim()) {
      toast.error("Please enter a phrase for this gesture");
      return;
    }

    setIsLoading(true);
    const gestureId = generateGestureId();

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, we'll store it locally
      setSavedGestures(prev => ({
        ...prev,
        [gestureId]: gesturePhrase.trim()
      }));

      toast.success(`Gesture ${gestureId} saved successfully!`);
      setGesturePhrase("");
    } catch (error) {
      toast.error("Failed to save gesture. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearGesture = () => {
    setSelectedFingers(new Set());
    setGesturePhrase("");
    toast.info("Gesture cleared");
  };

  const currentGestureId = generateGestureId();
  const hasExistingPhrase = savedGestures[currentGestureId];

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

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Hand Interface */}
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
                
                {/* Finger Selection Buttons */}
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
              
              {/* Finger Labels */}
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

          {/* Gesture Configuration */}
          <Card className="shadow-glow border-0 bg-card/95 backdrop-blur-md animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-accent" />
                Gesture Configuration
              </CardTitle>
              <CardDescription>
                Configure the voice output for your gesture
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Gesture ID Display */}
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

              {/* Existing Phrase Alert */}
              {hasExistingPhrase && (
                <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
                  <p className="text-sm font-medium text-warning-foreground">
                    ⚠️ This gesture already has a phrase: "{hasExistingPhrase}"
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Saving will overwrite the existing phrase.
                  </p>
                </div>
              )}

              {/* Phrase Input */}
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

              {/* Action Buttons */}
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
                      Save Gesture
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

        {/* Saved Gestures */}
        {Object.keys(savedGestures).length > 0 && (
          <Card className="mt-8 shadow-glow border-0 bg-card/95 backdrop-blur-md animate-fade-in">
            <CardHeader>
              <CardTitle className="text-lg">Saved Gestures</CardTitle>
              <CardDescription>
                Your configured gesture-to-phrase mappings
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(savedGestures).map(([gestureId, phrase]) => (
                  <div
                    key={gestureId}
                    className="p-4 bg-gradient-card rounded-lg border transition-all duration-300 hover:shadow-primary hover:scale-105"
                  >
                    <div className="space-y-2">
                      <code className="text-sm font-mono text-primary font-bold">
                        {gestureId}
                      </code>
                      <p className="text-sm text-foreground">"{phrase}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
