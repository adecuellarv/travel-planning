"use client";

import { useState } from "react";
import { useTravel } from "@/context/travel-context";
import type { Activity } from "@/lib/types";
import {
  Plus, X, Pencil, Trash2, ExternalLink, Filter, Compass, MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

const STATUS_COLORS: Record<Activity["status"], string> = {
  pendiente: "bg-warning/10 text-warning",
  reservado: "bg-info/10 text-info",
  pagado: "bg-success/10 text-success",
};

const STATUS_LABELS: Record<Activity["status"], string> = {
  pendiente: "Pendiente",
  reservado: "Reservado",
  pagado: "Pagado",
};

const EMPTY_FORM = {
  title: "",
  destinationId: "",
  date: "",
  time: "",
  notes: "",
  url: "",
  status: "pendiente" as Activity["status"],
};

export function ActivitiesSection() {
  const { activities, destinations, addActivity, updateActivity, deleteActivity } = useTravel();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filterDest, setFilterDest] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const usedDestIds = Array.from(new Set(activities.map((a) => a.destinationId))).filter(Boolean);
  const filtered = filterDest
    ? activities.filter((a) => a.destinationId === filterDest)
    : activities;

  function getDestName(id: string) {
    return destinations.find((d) => d.id === id)?.name || "Sin destino";
  }

  function openEdit(act: Activity) {
    setForm({
      title: act.title,
      destinationId: act.destinationId,
      date: act.date,
      time: act.time,
      notes: act.notes,
      url: act.url,
      status: act.status,
    });
    setEditingId(act.id);
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title) return;

    if (editingId) {
      updateActivity({ id: editingId, ...form });
    } else {
      addActivity({ id: generateId(), ...form });
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
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Actividades</h2>
          <p className="text-sm text-muted-foreground mt-1">{activities.length} actividad{activities.length !== 1 ? "es" : ""}</p>
        </div>
        <Button onClick={() => { cancelForm(); setShowForm(!showForm); }} className="bg-primary text-primary-foreground hover:bg-primary/90">
          {showForm && !editingId ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showForm && !editingId ? "Cancelar" : "Nueva Actividad"}
        </Button>
      </div>

      {usedDestIds.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <button
            onClick={() => setFilterDest("")}
            className={`text-xs px-3 py-1.5 rounded-full transition-all ${
              !filterDest ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            Todas
          </button>
          {usedDestIds.map((id) => (
            <button
              key={id}
              onClick={() => setFilterDest(id === filterDest ? "" : id)}
              className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                filterDest === id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {getDestName(id)}
            </button>
          ))}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <h3 className="text-sm font-semibold text-card-foreground">
            {editingId ? "Editar Actividad" : "Nueva Actividad"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-card-foreground">Titulo</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ej: Tour Coliseo" className="bg-input border-border text-foreground" required />
            </div>
            <div className="space-y-2">
              <Label className="text-card-foreground">Destino</Label>
              <select
                value={form.destinationId}
                onChange={(e) => setForm({ ...form, destinationId: e.target.value })}
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground"
              >
                <option value="">Sin destino</option>
                {destinations.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-card-foreground">Fecha</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="bg-input border-border text-foreground" />
            </div>
            <div className="space-y-2">
              <Label className="text-card-foreground">Hora</Label>
              <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="bg-input border-border text-foreground" />
            </div>
            <div className="space-y-2">
              <Label className="text-card-foreground">Status</Label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as Activity["status"] })}
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground"
              >
                <option value="pendiente">Pendiente</option>
                <option value="reservado">Reservado</option>
                <option value="pagado">Pagado</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-card-foreground">Notas</Label>
            <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notas opcionales..." className="bg-input border-border text-foreground" />
          </div>
          <div className="space-y-2">
            <Label className="text-card-foreground">URL de Reserva</Label>
            <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." className="bg-input border-border text-foreground" />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1">
              {editingId ? "Guardar Cambios" : "Agregar Actividad"}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={cancelForm} className="border-border text-muted-foreground">
                Cancelar
              </Button>
            )}
          </div>
        </form>
      )}

      {filtered.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Compass className="w-12 h-12 text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground text-sm">
            {filterDest ? `No hay actividades en ${getDestName(filterDest)}` : "No hay actividades aun."}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((act) => (
          <div key={act.id} className="bg-card border border-border rounded-xl p-5 group relative transition-all hover:shadow-md">
            <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
              <button onClick={() => openEdit(act)} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-all" aria-label="Editar">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setDeleteTarget(act.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all" aria-label="Eliminar">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 shrink-0">
                <Compass className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-card-foreground truncate">{act.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {getDestName(act.destinationId)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4 text-xs text-muted-foreground">
              {act.date && <span>{new Date(act.date + "T12:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</span>}
              {act.time && <span>{act.time}</span>}
            </div>

            {act.notes && (
              <p className="text-xs text-muted-foreground/80 mt-2 line-clamp-2">{act.notes}</p>
            )}

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[act.status]}`}>
                {STATUS_LABELS[act.status]}
              </span>
              {act.url && (
                <a
                  href={act.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] text-primary hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-3 h-3" /> Reserva
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Eliminar actividad"
        description="Esta actividad sera eliminada permanentemente."
        onConfirm={() => { if (deleteTarget) deleteActivity(deleteTarget); setDeleteTarget(null); }}
      />
    </div>
  );
}
