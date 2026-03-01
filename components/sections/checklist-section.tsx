"use client";

import { useState } from "react";
import { useTravel } from "@/context/travel-context";
import { CheckSquare, Plus, Trash2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function ChecklistSection() {
  const { checklist, toggleChecklistItem, addChecklistItem, deleteChecklistItem } = useTravel();
  const [newTask, setNewTask] = useState("");
  const [newCategory, setNewCategory] = useState("Otros");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const completed = checklist.filter((i) => i.completed).length;
  const total = checklist.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  const categories = Array.from(new Set(checklist.map((i) => i.category)));

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newTask.trim()) return;
    addChecklistItem({
      id: generateId(),
      category: newCategory,
      text: newTask.trim(),
      completed: false,
    });
    setNewTask("");
  }

  function shareOnWhatsApp() {
    let message = `*Checklist de Viaje* (${completed}/${total} completadas)\n\n`;

    categories.forEach((cat) => {
      const items = checklist.filter((i) => i.category === cat);
      message += `*${cat}*\n`;
      items.forEach((item) => {
        message += `${item.completed ? "[x]" : "[ ]"} ${item.text}\n`;
      });
      message += "\n";
    });

    message += `Progreso: ${progress}%`;

    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Checklist</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {completed} de {total} tareas completadas
          </p>
        </div>
        <Button
          onClick={shareOnWhatsApp}
          variant="outline"
          size="sm"
          className="border-border text-muted-foreground hover:text-foreground"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Compartir
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-card-foreground">Progreso</span>
          <span className="text-2xl font-bold text-primary">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2 bg-secondary [&>div]:bg-primary" />
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <select
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground w-32 shrink-0"
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
          <option value="Otros">Otros</option>
        </select>
        <Input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Nueva tarea..."
          className="bg-input border-border text-foreground flex-1"
        />
        <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0">
          <Plus className="w-4 h-4" />
        </Button>
      </form>

      <div className="space-y-6">
        {categories.map((cat) => {
          const items = checklist.filter((i) => i.category === cat);
          const catDone = items.filter((i) => i.completed).length;
          return (
            <div key={cat} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-card-foreground">{cat}</h3>
                <span className="text-xs text-muted-foreground">{catDone}/{items.length}</span>
              </div>
              <div className="space-y-1">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-secondary/50 transition-colors group"
                  >
                    <button
                      onClick={() => toggleChecklistItem(item.id)}
                      className={`flex items-center justify-center w-5 h-5 rounded border-2 transition-all shrink-0 ${
                        item.completed
                          ? "bg-primary border-primary"
                          : "border-muted-foreground/30 hover:border-primary"
                      }`}
                    >
                      {item.completed && <CheckSquare className="w-3 h-3 text-primary-foreground" />}
                    </button>
                    <span
                      className={`text-sm flex-1 transition-all ${
                        item.completed
                          ? "text-muted-foreground line-through"
                          : "text-card-foreground"
                      }`}
                    >
                      {item.text}
                    </span>
                    <button
                      onClick={() => setDeleteTarget(item.id)}
                      className="p-1 rounded text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
                      aria-label="Eliminar tarea"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Eliminar tarea"
        description="Esta tarea sera eliminada permanentemente del checklist."
        onConfirm={() => { if (deleteTarget) deleteChecklistItem(deleteTarget); setDeleteTarget(null); }}
      />
    </div>
  );
}
