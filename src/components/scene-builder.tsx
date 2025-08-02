
"use client";

import { DragDropContext, Droppable, Draggable, OnDragEndResponder } from "@hello-pangea/dnd";
import { GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ScriptLine } from "@/ai/flows/generate-podcast-script";
import { Card } from "./ui/card";

interface SceneBuilderProps {
  scenes: ScriptLine[];
  setScenes: (scenes: ScriptLine[]) => void;
  speakers: string[];
}

export function SceneBuilder({ scenes, setScenes, speakers }: SceneBuilderProps) {
  const onDragEnd: OnDragEndResponder = (result) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(scenes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setScenes(items);
  };

  const handleSceneChange = (index: number, field: "speaker" | "line", value: string) => {
    const newScenes = [...scenes];
    newScenes[index] = { ...newScenes[index], [field]: value };
    setScenes(newScenes);
  };

  const handleRemoveScene = (index: number) => {
    const newScenes = scenes.filter((_, i) => i !== index);
    setScenes(newScenes);
  };
  
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="scenes">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
            {scenes.map((scene, index) => (
              <Draggable key={index} draggableId={`scene-${index}`} index={index}>
                {(provided, snapshot) => (
                  <Card
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`p-4 flex items-start gap-2 ${snapshot.isDragging ? "shadow-lg ring-2 ring-primary" : ""}`}
                  >
                    <button
                      {...provided.dragHandleProps}
                      className="p-2 text-muted-foreground hover:bg-accent rounded-md mt-1"
                      aria-label="Drag scene"
                    >
                      <GripVertical />
                    </button>
                    <div className="flex-grow space-y-2">
                      <Input
                        value={scene.speaker}
                        onChange={(e) => handleSceneChange(index, "speaker", e.target.value)}
                        placeholder="Speaker (e.g. Host)"
                        className="font-bold"
                      />
                      <Textarea
                        value={scene.line}
                        onChange={(e) => handleSceneChange(index, "line", e.target.value)}
                        placeholder="Dialogue..."
                        rows={3}
                        className="text-base font-mono"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveScene(index)}
                      className="text-muted-foreground hover:text-destructive shrink-0 mt-1"
                      aria-label="Delete scene"
                    >
                      <Trash2 />
                    </Button>
                  </Card>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
