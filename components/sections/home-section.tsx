"use client";

import { useState, useMemo } from "react";
import { useTravel } from "@/context/travel-context";
import type { Activity } from "@/lib/types";
import {
  ChevronLeft, ChevronRight, MapPin, Compass, ExternalLink,
  CalendarDays, Plane, Hotel, ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function pad(n: number) { return n.toString().padStart(2, "0"); }

const STATUS_ORDER: Activity["status"][] = ["pendiente", "reservado", "pagado"];

const STATUS_COLORS: Record<Activity["status"], string> = {
  pendiente: "bg-warning/15 text-warning border border-warning/30",
  reservado: "bg-info/15 text-info border border-info/30",
  pagado: "bg-success/15 text-success border border-success/30",
};

const STATUS_LABELS: Record<Activity["status"], string> = {
  pendiente: "Pendiente",
  reservado: "Reservado",
  pagado: "Pagado",
};

// April 2026 range
const APRIL_START = new Date(2026, 3, 12);
const APRIL_END = new Date(2026, 3, 30);

function clampToApril(d: Date) {
  if (d < APRIL_START) return APRIL_START;
  if (d > APRIL_END) return APRIL_END;
  return d;
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function HomeSection() {
  const { destinations, activities, reservations, updateActivity } = useTravel();

  const today = new Date();
  const initialDate = today.getMonth() === 3 && today.getFullYear() === 2026
    ? today
    : APRIL_START;

  const [currentDate, setCurrentDate] = useState(clampToApril(initialDate));
  const [imgError, setImgError] = useState<Record<string, boolean>>({});

  const dateStr = toDateStr(currentDate);
  const dayActivities = useMemo(
    () => activities.filter((a) => a.date === dateStr).sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99")),
    [activities, dateStr]
  );

  const dayDest = useMemo(
    () => destinations.find((d) => dateStr >= d.startDate && dateStr < d.endDate),
    [destinations, dateStr]
  );

  const dayReservations = useMemo(
    () => reservations.filter((r) => r.date === dateStr),
    [reservations, dateStr]
  );

  // Mini calendar: build week strip for current date's week
  const weekDays = useMemo(() => {
    const d = new Date(currentDate);
    const dayOfWeek = d.getDay();
    const monday = new Date(d);
    monday.setDate(d.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const dd = new Date(monday);
      dd.setDate(monday.getDate() + i);
      days.push(dd);
    }
    return days;
  }, [currentDate]);

  function goToPrev() {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 1);
    if (prev >= APRIL_START) setCurrentDate(prev);
  }

  function goToNext() {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    if (next <= APRIL_END) setCurrentDate(next);
  }

  function cycleStatus(act: Activity) {
    const currentIdx = STATUS_ORDER.indexOf(act.status);
    const nextStatus = STATUS_ORDER[(currentIdx + 1) % STATUS_ORDER.length];
    updateActivity({ ...act, status: nextStatus });
  }

  const dayLabel = currentDate.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Stats
  const totalActivities = activities.length;
  const paidActivities = activities.filter((a) => a.status === "pagado").length;
  const pendingActivities = activities.filter((a) => a.status === "pendiente").length;

  const isToday = toDateStr(today) === dateStr;

  function getDestName(destId: string) {
    return destinations.find((d) => d.id === destId)?.name || "";
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground tracking-tight">
          {isToday ? "Hoy" : dayLabel}
        </h2>
        {isToday && (
          <p className="text-sm text-muted-foreground mt-1 capitalize">{dayLabel}</p>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-primary">{totalActivities}</p>
          <p className="text-xs text-muted-foreground mt-1">Total actividades</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-success">{paidActivities}</p>
          <p className="text-xs text-muted-foreground mt-1">Pagadas</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-warning">{pendingActivities}</p>
          <p className="text-xs text-muted-foreground mt-1">Pendientes</p>
        </div>
      </div>

      {/* Week strip navigation */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <Button variant="ghost" size="icon" onClick={goToPrev} className="text-muted-foreground hover:text-foreground h-8 w-8">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <p className="text-sm font-medium text-card-foreground capitalize">{dayLabel}</p>
          <Button variant="ghost" size="icon" onClick={goToNext} className="text-muted-foreground hover:text-foreground h-8 w-8">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((wd) => {
            const wdStr = toDateStr(wd);
            const isSelected = wdStr === dateStr;
            const isInApril = wd.getMonth() === 3 && wd.getFullYear() === 2026;
            const hasActivities = activities.some((a) => a.date === wdStr);
            const dayNames = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];

            return (
              <button
                key={wdStr}
                onClick={() => isInApril && setCurrentDate(wd)}
                disabled={!isInApril}
                className={`flex flex-col items-center py-2 rounded-lg transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : isInApril
                    ? "text-card-foreground hover:bg-secondary"
                    : "text-muted-foreground/30 cursor-not-allowed"
                }`}
              >
                <span className="text-[10px] font-medium">{dayNames[wd.getDay()]}</span>
                <span className="text-sm font-semibold mt-0.5">{wd.getDate()}</span>
                {hasActivities && !isSelected && (
                  <div className="w-1 h-1 rounded-full bg-primary mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Destination card for the day */}
      {dayDest && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {dayDest.imageUrl && !imgError[dayDest.id] ? (
            <div className="h-32 overflow-hidden relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={dayDest.imageUrl}
                alt={dayDest.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={() => setImgError((prev) => ({ ...prev, [dayDest.id]: true }))}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
              <div className="absolute bottom-3 left-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-background" />
                <h3 className="text-base font-semibold text-background">{dayDest.name}</h3>
              </div>
            </div>
          ) : (
            <div className="p-4 flex items-center gap-3">
              {dayDest.imageUrl ? null : <ImageIcon className="w-5 h-5 text-muted-foreground/40" />}
              <div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <h3 className="text-base font-semibold text-card-foreground">{dayDest.name}</h3>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Llega {new Date(dayDest.startDate + "T12:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short" })} {"\u2022"} Sale {new Date(dayDest.endDate + "T12:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reservations for the day */}
      {dayReservations.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Reservas del dia</h3>
          {dayReservations.map((res) => (
            <div key={res.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
              <div className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 ${res.type === "vuelo" ? "bg-info/10" : "bg-warning/10"}`}>
                {res.type === "vuelo" ? <Plane className="w-4 h-4 text-info" /> : <Hotel className="w-4 h-4 text-warning" />}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold text-card-foreground">
                  {res.type === "vuelo"
                    ? `${res.airline || "Vuelo"} ${res.flightNumber || ""}`
                    : res.hotelName || "Hotel"}
                </h4>
                <p className="text-xs text-muted-foreground">{getDestName(res.destinationId)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Activities for the day with status toggle */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" />
            Actividades del dia
          </h3>
          <span className="text-xs text-muted-foreground">{dayActivities.length} actividad{dayActivities.length !== 1 ? "es" : ""}</span>
        </div>

        {dayActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center bg-card border border-border rounded-xl">
            <Compass className="w-10 h-10 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm">No hay actividades para este dia.</p>
            <p className="text-muted-foreground/60 text-xs mt-1">Agrega actividades desde el Calendario o Actividades</p>
          </div>
        ) : (
          <div className="space-y-3">
            {dayActivities.map((act) => {
              const destName = getDestName(act.destinationId);
              return (
                <div key={act.id} className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-all">
                  <div className="flex items-start gap-3">
                    {act.time && (
                      <div className="text-center shrink-0 w-12">
                        <p className="text-sm font-semibold text-primary">{act.time}</p>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-card-foreground">{act.title}</h4>
                      {destName && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">{destName}</p>
                        </div>
                      )}
                      {act.notes && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{act.notes}</p>}
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          onClick={() => cycleStatus(act)}
                          className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer hover:opacity-80 ${STATUS_COLORS[act.status]}`}
                          title="Click para cambiar estatus"
                        >
                          {STATUS_LABELS[act.status]}
                        </button>
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
