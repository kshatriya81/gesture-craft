import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Settings, Trash2, Edit } from "lucide-react";

export interface Preset {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
}

interface PresetManagerProps {
  presets: Preset[];
  activePreset: Preset | null;
  onCreatePreset: (preset: Omit<Preset, 'id' | 'createdAt'>) => void;
  onSelectPreset: (preset: Preset) => void;
  onDeletePreset: (presetId: string) => void;
  onUpdatePreset: (presetId: string, updates: Partial<Preset>) => void;
}

export const PresetManager = ({
  presets,
  activePreset,
  onCreatePreset,
  onSelectPreset,
  onDeletePreset,
  onUpdatePreset
}: PresetManagerProps) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState<Preset | null>(null);
  const [newPresetName, setNewPresetName] = useState("");
  const [newPresetDescription, setNewPresetDescription] = useState("");

  const handleCreatePreset = () => {
    if (!newPresetName.trim()) {
      toast.error("Please enter a preset name");
      return;
    }

    if (presets.some(p => p.name.toLowerCase() === newPresetName.toLowerCase())) {
      toast.error("A preset with this name already exists");
      return;
    }

    onCreatePreset({
      name: newPresetName.trim(),
      description: newPresetDescription.trim()
    });

    setNewPresetName("");
    setNewPresetDescription("");
    setIsCreateOpen(false);
    toast.success(`Preset "${newPresetName}" created successfully!`);
  };

  const handleEditPreset = () => {
    if (!editingPreset || !newPresetName.trim()) {
      toast.error("Please enter a preset name");
      return;
    }

    if (presets.some(p => p.id !== editingPreset.id && p.name.toLowerCase() === newPresetName.toLowerCase())) {
      toast.error("A preset with this name already exists");
      return;
    }

    onUpdatePreset(editingPreset.id, {
      name: newPresetName.trim(),
      description: newPresetDescription.trim()
    });

    setNewPresetName("");
    setNewPresetDescription("");
    setEditingPreset(null);
    setIsEditOpen(false);
    toast.success("Preset updated successfully!");
  };

  const handleDeletePreset = (preset: Preset) => {
    if (presets.length <= 1) {
      toast.error("Cannot delete the last preset");
      return;
    }

    if (confirm(`Are you sure you want to delete the preset "${preset.name}"? This will also delete all gestures in this preset.`)) {
      onDeletePreset(preset.id);
      toast.success(`Preset "${preset.name}" deleted`);
    }
  };

  const openEditDialog = (preset: Preset) => {
    setEditingPreset(preset);
    setNewPresetName(preset.name);
    setNewPresetDescription(preset.description);
    setIsEditOpen(true);
  };

  return (
    <Card className="shadow-glow border-0 bg-card/95 backdrop-blur-md">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="w-5 h-5 text-primary" />
              Gesture Presets
            </CardTitle>
            <CardDescription>
              Switch between different gesture contexts
            </CardDescription>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button variant="accent" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                New Preset
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Preset</DialogTitle>
                <DialogDescription>
                  Create a new gesture preset for different contexts (e.g., Home, Work, Emergency)
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="preset-name">Preset Name</Label>
                  <Input
                    id="preset-name"
                    placeholder="e.g., Home, Work, Emergency"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preset-description">Description (Optional)</Label>
                  <Input
                    id="preset-description"
                    placeholder="Brief description of this preset"
                    value={newPresetDescription}
                    onChange={(e) => setNewPresetDescription(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePreset}>
                    Create Preset
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Active Preset Selector */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Active Preset</Label>
          <Select
            value={activePreset?.id || ""}
            onValueChange={(value) => {
              const preset = presets.find(p => p.id === value);
              if (preset) onSelectPreset(preset);
            }}
          >
            <SelectTrigger className="transition-all duration-300 focus:shadow-primary/30">
              <SelectValue placeholder="Select a preset" />
            </SelectTrigger>
            <SelectContent>
              {presets.map((preset) => (
                <SelectItem key={preset.id} value={preset.id}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{preset.name}</span>
                    {preset.description && (
                      <span className="text-xs text-muted-foreground">
                        - {preset.description}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Preset List */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Manage Presets</Label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {presets.map((preset) => (
              <div
                key={preset.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${
                  preset.id === activePreset?.id
                    ? "bg-primary/10 border-primary/30"
                    : "bg-muted/30 border-border hover:bg-muted/50"
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{preset.name}</span>
                    {preset.id === activePreset?.id && (
                      <Badge variant="default" className="text-xs">
                        Active
                      </Badge>
                    )}
                  </div>
                  {preset.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {preset.description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEditDialog(preset)}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  {presets.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDeletePreset(preset)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Preset</DialogTitle>
              <DialogDescription>
                Update the preset name and description
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-preset-name">Preset Name</Label>
                <Input
                  id="edit-preset-name"
                  placeholder="e.g., Home, Work, Emergency"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-preset-description">Description (Optional)</Label>
                <Input
                  id="edit-preset-description"
                  placeholder="Brief description of this preset"
                  value={newPresetDescription}
                  onChange={(e) => setNewPresetDescription(e.target.value)}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditPreset}>
                  Update Preset
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};