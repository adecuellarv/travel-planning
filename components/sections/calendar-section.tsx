"use client";

import { useState, useMemo } from "react";
import { useTravel } from "@/context/travel-context";
import type { Activity } from "@/lib/types";
import {
  MapPin, Compass, Plus, X, Pencil, Trash2, ExternalLink, ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

const DAYS_OF_WEEK = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function pad(n: number) { return n.toString().padStart(2, "0"); }

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

// April 2026
const YEAR = 2026;
const MONTH = 3; // 0-indexed (April)

export function CalendarSection() {
  const { destinations, activities, addActivity, updateActivity, deleteActivity } = useTravel();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const EMPTY_FORM = {
    title: "",
    destinationId: "",
    time: "",
    notes: "",
    url: "",
    status: "pendiente" as Activity["status"],
  };

  const [form, setForm] = useState(EMPTY_FORM);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(YEAR, MONTH, 1);
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;

    const daysInMonth = new Date(YEAR, MONTH + 1, 0).getDate();
    const cells: (number | null)[] = [];

    for (let i = 0; i < startDay; i++) cells.push(null);
    for (let i = 1; i <= daysInMonth; i++) cells.push(i);
    while (cells.length % 7 !== 0) cells.push(null);

    return cells;
  }, []);

  // Map which dates fall under a destination
  const destDatesMap = useMemo(() => {
    const map: Record<string, { destName: string; destId: string; color: string }> = {};
    const colors = [
      "bg-primary/15 text-primary",
      "bg-success/15 text-success",
      "bg-warning/15 text-warning",
      "bg-info/15 text-info",
    ];
    destinations.forEach((d, idx) => {
      const start = new Date(d.startDate + "T12:00:00");
      const end = new Date(d.endDate + "T12:00:00");
      const cur = new Date(start);
      while (cur < end) {
        const key = `${cur.getFullYear()}-${pad(cur.getMonth() + 1)}-${pad(cur.getDate())}`;
        map[key] = { destName: d.name, destId: d.id, color: colors[idx % colors.length] };
        cur.setDate(cur.getDate() + 1);
      }
    });
    return map;
  }, [destinations]);

  function getDateStr(day: number) {
    return `${YEAR}-${pad(MONTH + 1)}-${pad(day)}`;
  }

  const selectedActivities = selectedDate
    ? activities.filter((a) => a.date === selectedDate)
    : [];

  const selectedDestInfo = selectedDate ? destDatesMap[selectedDate] : null;

  function openEditActivity(act: Activity) {
    setForm({
      title: act.title,
      destinationId: act.destinationId,
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
    if (!form.title || !selectedDate) return;

    const destId = form.destinationId || (selectedDestInfo?.destId ?? "");

    if (editingId) {
      updateActivity({ id: editingId, ...form, destinationId: destId, date: selectedDate });
    } else {
      addActivity({ id: generateId(), ...form, destinationId: destId, date: selectedDate });
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

  // Day detail panel
  if (selectedDate) {
    const dayNum = parseInt(selectedDate.split("-")[2]);
    const dayLabel = new Date(selectedDate + "T12:00:00").toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <button
          onClick={() => { setSelectedDate(null); cancelForm(); }}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Volver al calendario
        </button>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-3xl font-bold text-primary">{dayNum}</p>
              <p className="text-sm text-muted-foreground mt-1 capitalize">{dayLabel}</p>
              {selectedDestInfo && (
                <div className="flex items-center gap-1.5 mt-2">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span className="text-sm font-medium text-card-foreground">{selectedDestInfo.destName}</span>
                </div>
              )}
            </div>
            <Button
              onClick={() => { cancelForm(); setShowForm(!showForm); }}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              size="sm"
            >
              {showForm && !editingId ? <X className="w-4 h-4 mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
              {showForm && !editingId ? "Cancelar" : "Actividad"}
            </Button>
          </div>
        </div>

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
                  value={form.destinationId || selectedDestInfo?.destId || ""}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                {editingId ? "Guardar" : "Agregar"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={cancelForm} className="border-border text-muted-foreground">
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        )}

        {selectedActivities.length === 0 && !showForm && (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-card border border-border rounded-xl">
            <Compass className="w-10 h-10 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm">No hay actividades para este dia.</p>
            <p className="text-muted-foreground/60 text-xs mt-1">{"Haz clic en \"+ Actividad\" para agregar"}</p>
          </div>
        )}

        <div className="space-y-3">
          {selectedActivities
            .sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99"))
            .map((act) => (
            <div key={act.id} className="bg-card border border-border rounded-xl p-4 group relative hover:shadow-md transition-all">
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => openEditActivity(act)} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-all" aria-label="Editar">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setDeleteTarget(act.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all" aria-label="Eliminar">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-start gap-3">
                {act.time && (
                  <div className="text-center shrink-0 w-12">
                    <p className="text-sm font-semibold text-primary">{act.time}</p>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-semibold text-card-foreground">{act.title}</h4>
                  {act.notes && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{act.notes}</p>}
                  <div className="flex items-center gap-3 mt-3">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[act.status]}`}>
                      {STATUS_LABELS[act.status]}
                    </span>
                    {act.url && (
                      <a
                        href={act.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[11px] text-primary hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" /> Ver reserva
                      </a>
                    )}
                  </div>
                </div>
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

  // Calendar grid view
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground tracking-tight">Calendario</h2>
        <p className="text-sm text-muted-foreground mt-1">Abril 2026 - Tu viaje dia a dia</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-lg font-semibold text-card-foreground text-center mb-6">
          Abril 2026
        </h3>

        <div className="grid grid-cols-7 gap-1">
          {DAYS_OF_WEEK.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">
              {d}
            </div>
          ))}

          {calendarDays.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="aspect-square" />;
            }

            const dateStr = getDateStr(day);
            const destInfo = destDatesMap[dateStr];
            const dayActivities = activities.filter((a) => a.date === dateStr);
            const today = new Date();
            const isToday =
              day === today.getDate() &&
              MONTH === today.getMonth() &&
              YEAR === today.getFullYear();

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-all relative group/cell ${
                  destInfo
                    ? `${destInfo.color} hover:ring-2 hover:ring-primary/30`
                    : isToday
                    ? "bg-secondary text-foreground ring-2 ring-primary/30"
                    : "text-card-foreground hover:bg-secondary/50"
                }`}
              >
                <span className={`font-medium ${isToday && !destInfo ? "text-primary" : ""}`}>{day}</span>
                {dayActivities.length > 0 && (
                  <div className="absolute bottom-1 flex gap-0.5">
                    {dayActivities.slice(0, 3).map((_, i) => (
                      <div key={i} className="w-1 h-1 rounded-full bg-primary" />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      {destinations.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs font-medium text-muted-foreground mb-3">Destinos en Abril</p>
          <div className="flex flex-wrap gap-3">
            {destinations.map((d) => {
              const start = new Date(d.startDate + "T12:00:00");
              const end = new Date(d.endDate + "T12:00:00");
              const inApril = (start.getMonth() <= MONTH && end.getMonth() >= MONTH && start.getFullYear() <= YEAR && end.getFullYear() >= YEAR);
              if (!inApril) return null;
              return (
                <div key={d.id} className="flex items-center gap-2 text-xs text-card-foreground">
                  <MapPin className="w-3 h-3 text-primary" />
                  <span className="font-medium">{d.name}</span>
                  <span className="text-muted-foreground">
                    (Llega {new Date(d.startDate + "T12:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short" })} {"\u2022"} Sale {new Date(d.endDate + "T12:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short" })})
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
