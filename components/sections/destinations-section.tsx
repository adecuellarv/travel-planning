"use client";

import { useState } from "react";
import { useTravel } from "@/context/travel-context";
import type { Destination } from "@/lib/types";
import {
  Plus, X, Pencil, Trash2, MapPin, CalendarDays, ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function daysBetween(start: string, end: string) {
  const s = new Date(start + "T12:00:00");
  const e = new Date(end + "T12:00:00");
  return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDateRange(start: string, end: string) {
  const s = new Date(start + "T12:00:00");
  const e = new Date(end + "T12:00:00");
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  return `Llega ${s.toLocaleDateString("es-ES", opts)} \u2022 Sale ${e.toLocaleDateString("es-ES", opts)}`;
}

const EMPTY_FORM = {
  name: "",
  imageUrl: "",
  startDate: "",
  endDate: "",
};

export function DestinationsSection() {
  const { destinations, addDestination, updateDestination, deleteDestination, activities } = useTravel();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  function openEdit(dest: Destination) {
    setForm({
      name: dest.name,
      imageUrl: dest.imageUrl,
      startDate: dest.startDate,
      endDate: dest.endDate,
    });
    setEditingId(dest.id);
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.startDate || !form.endDate) return;

    if (editingId) {
      updateDestination({ id: editingId, ...form });
    } else {
      addDestination({ id: generateId(), ...form });
    }
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  }

  function cancelForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Destinos</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {destinations.length > 0
              ? `${destinations.length} destino${destinations.length > 1 ? "s" : ""} planificado${destinations.length > 1 ? "s" : ""}`
              : "Agrega los destinos de tu viaje"}
          </p>
        </div>
        <Button
          onClick={() => { cancelForm(); setShowForm(!showForm); }}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {showForm && !editingId ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showForm && !editingId ? "Cancelar" : "Nuevo Destino"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <h3 className="text-sm font-semibold text-card-foreground">
            {editingId ? "Editar Destino" : "Nuevo Destino"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-card-foreground">Nombre del destino</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej: Roma, Paris, Tokyo..."
                className="bg-input border-border text-foreground"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-card-foreground">URL de imagen (opcional)</Label>
              <Input
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="bg-input border-border text-foreground"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-card-foreground">Llegada</Label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="bg-input border-border text-foreground"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-card-foreground">Salida</Label>
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="bg-input border-border text-foreground"
                required
              />
            </div>
          </div>

          {form.imageUrl && (
            <div className="rounded-lg overflow-hidden border border-border h-32">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.imageUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1">
              {editingId ? "Guardar Cambios" : "Agregar Destino"}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={cancelForm} className="border-border text-muted-foreground">
                Cancelar
              </Button>
            )}
          </div>
        </form>
      )}

      {destinations.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <MapPin className="w-12 h-12 text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground text-sm">No hay destinos aun.</p>
          <p className="text-muted-foreground/60 text-xs mt-1">{"Haz clic en \"Nuevo Destino\" para empezar"}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {destinations.map((dest) => {
          const numDays = daysBetween(dest.startDate, dest.endDate);
          const destActivities = activities.filter((a) => a.destinationId === dest.id);
          return (
            <div
              key={dest.id}
              className="bg-card border border-border rounded-xl overflow-hidden group relative hover:shadow-md transition-all duration-200"
            >
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-10">
                <button
                  onClick={() => openEdit(dest)}
                  className="p-1.5 rounded-md bg-card/80 backdrop-blur-sm hover:bg-card text-muted-foreground hover:text-foreground transition-all"
                  aria-label="Editar destino"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteTarget(dest.id)}
                  className="p-1.5 rounded-md bg-card/80 backdrop-blur-sm hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                  aria-label="Eliminar destino"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {dest.imageUrl ? (
                <div className="h-36 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={dest.imageUrl}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent) {
                        parent.classList.add("flex", "items-center", "justify-center", "bg-muted");
                        const icon = document.createElement("div");
                        icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground/40"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`;
                        parent.appendChild(icon);
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="h-36 flex items-center justify-center bg-muted">
                  <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
                </div>
              )}

              <div className="p-4">
                <h3 className="text-base font-semibold text-card-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  {dest.name}
                </h3>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>{formatDateRange(dest.startDate, dest.endDate)}</span>
                  <span className="text-primary font-medium">({numDays} noche{numDays !== 1 ? "s" : ""})</span>
                </div>
                {destActivities.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {destActivities.slice(0, 3).map((a) => (
                      <span key={a.id} className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                        {a.title}
                      </span>
                    ))}
                    {destActivities.length > 3 && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                        +{destActivities.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Eliminar destino"
        description="Este destino sera eliminado permanentemente. Las actividades asociadas no seran eliminadas."
        onConfirm={() => { if (deleteTarget) deleteDestination(deleteTarget); setDeleteTarget(null); }}
      />
    </div>
  );
}
