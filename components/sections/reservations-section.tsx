"use client";

import { useState } from "react";
import { useTravel } from "@/context/travel-context";
import type { Reservation } from "@/lib/types";
import {
  Plus, X, Pencil, Trash2, Plane, Hotel, MapPin, Clock,
  Hash, ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

const EMPTY_FORM: Omit<Reservation, "id"> = {
  type: "vuelo",
  date: "",
  destinationId: "",
  bookingCode: "",
  notes: "",
  airline: "",
  flightNumber: "",
  departureTime: "",
  arrivalTime: "",
  hotelName: "",
  address: "",
  checkIn: "",
  checkOut: "",
};

export function ReservationsSection() {
  const { reservations, addReservation, updateReservation, deleteReservation, destinations } = useTravel();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const flights = reservations.filter((r) => r.type === "vuelo");
  const hotels = reservations.filter((r) => r.type === "hotel");

  function getDestName(destId: string) {
    return destinations.find((d) => d.id === destId)?.name || "Sin destino";
  }

  function openEdit(res: Reservation) {
    const { id, ...rest } = res;
    void id;
    setForm(rest);
    setEditingId(res.id);
    setShowForm(true);
    setSelectedRes(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.destinationId) return;
    if (editingId) {
      updateReservation({ id: editingId, ...form });
    } else {
      addReservation({ id: generateId(), ...form });
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

  if (selectedRes) {
    return (
      <>
        <ReservationDetail
          res={selectedRes}
          destName={getDestName(selectedRes.destinationId)}
          onBack={() => setSelectedRes(null)}
          onEdit={() => openEdit(selectedRes)}
          onDelete={() => setDeleteTarget(selectedRes.id)}
        />
        <ConfirmDialog
          open={!!deleteTarget}
          onOpenChange={() => setDeleteTarget(null)}
          title="Eliminar reserva"
          description="Esta reserva sera eliminada permanentemente."
          onConfirm={() => {
            if (deleteTarget) {
              deleteReservation(deleteTarget);
              if (selectedRes?.id === deleteTarget) setSelectedRes(null);
            }
            setDeleteTarget(null);
          }}
        />
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Reservas</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {flights.length} vuelo{flights.length !== 1 ? "s" : ""}, {hotels.length} hotel{hotels.length !== 1 ? "es" : ""}
          </p>
        </div>
        <Button onClick={() => { cancelForm(); setShowForm(!showForm); }} className="bg-primary text-primary-foreground hover:bg-primary/90">
          {showForm && !editingId ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showForm && !editingId ? "Cancelar" : "Nueva Reserva"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <h3 className="text-sm font-semibold text-card-foreground">
            {editingId ? "Editar Reserva" : "Nueva Reserva"}
          </h3>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setForm({ ...form, type: "vuelo" })}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                form.type === "vuelo"
                  ? "bg-info/10 text-info border border-info/30"
                  : "bg-secondary text-secondary-foreground border border-border"
              }`}
            >
              <Plane className="w-4 h-4" /> Vuelo
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, type: "hotel" })}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                form.type === "hotel"
                  ? "bg-warning/10 text-warning border border-warning/30"
                  : "bg-secondary text-secondary-foreground border border-border"
              }`}
            >
              <Hotel className="w-4 h-4" /> Hotel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-card-foreground">Destino</Label>
              {destinations.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">Agrega un destino primero desde la seccion Destinos.</p>
              ) : (
                <select
                  value={form.destinationId}
                  onChange={(e) => setForm({ ...form, destinationId: e.target.value })}
                  className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground"
                  required
                >
                  <option value="">Seleccionar destino</option>
                  {destinations.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-card-foreground">Fecha</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="bg-input border-border text-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-card-foreground">Codigo de Reserva</Label>
            <Input value={form.bookingCode} onChange={(e) => setForm({ ...form, bookingCode: e.target.value })} placeholder="ABC123" className="bg-input border-border text-foreground" />
          </div>

          {form.type === "vuelo" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-card-foreground">Aerolinea</Label>
                <Input value={form.airline} onChange={(e) => setForm({ ...form, airline: e.target.value })} placeholder="Ej: Iberia" className="bg-input border-border text-foreground" />
              </div>
              <div className="space-y-2">
                <Label className="text-card-foreground">Numero de Vuelo</Label>
                <Input value={form.flightNumber} onChange={(e) => setForm({ ...form, flightNumber: e.target.value })} placeholder="IB3456" className="bg-input border-border text-foreground" />
              </div>
              <div className="space-y-2">
                <Label className="text-card-foreground">Hora Salida</Label>
                <Input type="time" value={form.departureTime} onChange={(e) => setForm({ ...form, departureTime: e.target.value })} className="bg-input border-border text-foreground" />
              </div>
              <div className="space-y-2">
                <Label className="text-card-foreground">Hora Llegada</Label>
                <Input type="time" value={form.arrivalTime} onChange={(e) => setForm({ ...form, arrivalTime: e.target.value })} className="bg-input border-border text-foreground" />
              </div>
            </div>
          )}

          {form.type === "hotel" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-card-foreground">Nombre del Hotel</Label>
                <Input value={form.hotelName} onChange={(e) => setForm({ ...form, hotelName: e.target.value })} placeholder="Ej: Hotel Palazzo" className="bg-input border-border text-foreground" />
              </div>
              <div className="space-y-2">
                <Label className="text-card-foreground">Direccion</Label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Via Roma 123" className="bg-input border-border text-foreground" />
              </div>
              <div className="space-y-2">
                <Label className="text-card-foreground">Check-in</Label>
                <Input type="date" value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} className="bg-input border-border text-foreground" />
              </div>
              <div className="space-y-2">
                <Label className="text-card-foreground">Check-out</Label>
                <Input type="date" value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} className="bg-input border-border text-foreground" />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-card-foreground">Notas</Label>
            <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notas opcionales..." className="bg-input border-border text-foreground" />
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1">
              {editingId ? "Guardar Cambios" : "Agregar Reserva"}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={cancelForm} className="border-border text-muted-foreground">
                Cancelar
              </Button>
            )}
          </div>
        </form>
      )}

      {reservations.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Plane className="w-12 h-12 text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground text-sm">No hay reservas aun.</p>
        </div>
      )}

      {flights.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Plane className="w-4 h-4 text-info" /> Vuelos
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {flights.map((res) => (
              <ReservationCard key={res.id} res={res} destName={getDestName(res.destinationId)} onClick={() => setSelectedRes(res)} onEdit={() => openEdit(res)} onDelete={() => setDeleteTarget(res.id)} />
            ))}
          </div>
        </div>
      )}

      {hotels.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Hotel className="w-4 h-4 text-warning" /> Hoteles
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {hotels.map((res) => (
              <ReservationCard key={res.id} res={res} destName={getDestName(res.destinationId)} onClick={() => setSelectedRes(res)} onEdit={() => openEdit(res)} onDelete={() => setDeleteTarget(res.id)} />
            ))}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Eliminar reserva"
        description="Esta reserva sera eliminada permanentemente."
        onConfirm={() => {
          if (deleteTarget) {
            deleteReservation(deleteTarget);
            if (selectedRes?.id === deleteTarget) setSelectedRes(null);
          }
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}

function ReservationCard({ res, destName, onClick, onEdit, onDelete }: {
  res: Reservation;
  destName: string;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isFlight = res.type === "vuelo";
  return (
    <button
      onClick={onClick}
      className="bg-card border border-border rounded-xl p-5 text-left hover:border-primary/30 transition-all group relative w-full"
    >
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
        <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-all" aria-label="Editar">
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all" aria-label="Eliminar">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-start gap-3">
        <div className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 ${isFlight ? "bg-info/10" : "bg-warning/10"}`}>
          {isFlight ? <Plane className="w-4 h-4 text-info" /> : <Hotel className="w-4 h-4 text-warning" />}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-card-foreground truncate">
            {isFlight
              ? `${res.airline || "Vuelo"} ${res.flightNumber || ""}`
              : res.hotelName || "Hotel"
            }
          </h3>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">{destName}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
        {res.date && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(res.date + "T12:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
          </span>
        )}
        {isFlight && res.departureTime && (
          <span>{res.departureTime} - {res.arrivalTime}</span>
        )}
        {!isFlight && res.checkIn && res.checkOut && (
          <span>
            {new Date(res.checkIn + "T12:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short" })} -
            {" "}{new Date(res.checkOut + "T12:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
          </span>
        )}
        {res.bookingCode && (
          <span className="flex items-center gap-1 ml-auto">
            <Hash className="w-3 h-3" /> {res.bookingCode}
          </span>
        )}
      </div>
    </button>
  );
}

function ReservationDetail({ res, destName, onBack, onEdit, onDelete }: {
  res: Reservation;
  destName: string;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isFlight = res.type === "vuelo";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="w-4 h-4" /> Volver a reservas
      </button>

      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`flex items-center justify-center w-11 h-11 rounded-lg ${isFlight ? "bg-info/10" : "bg-warning/10"}`}>
              {isFlight ? <Plane className="w-5 h-5 text-info" /> : <Hotel className="w-5 h-5 text-warning" />}
            </div>
            <div>
              <span className={`text-xs font-medium ${isFlight ? "text-info" : "text-warning"}`}>
                {isFlight ? "Vuelo" : "Hotel"}
              </span>
              <h2 className="text-xl font-bold text-card-foreground">
                {isFlight ? `${res.airline || ""} ${res.flightNumber || ""}`.trim() || "Vuelo" : res.hotelName || "Hotel"}
              </h2>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onEdit} className="border-border text-muted-foreground hover:text-foreground">
              <Pencil className="w-3.5 h-3.5 mr-1.5" /> Editar
            </Button>
            <Button variant="outline" size="sm" onClick={onDelete} className="border-border text-muted-foreground hover:text-destructive hover:border-destructive">
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
          <DetailField label="Destino" value={destName} />
          <DetailField label="Fecha" value={res.date ? new Date(res.date + "T12:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }) : "-"} />
          <DetailField label="Codigo" value={res.bookingCode || "-"} />

          {isFlight && (
            <>
              <DetailField label="Aerolinea" value={res.airline || "-"} />
              <DetailField label="Hora Salida" value={res.departureTime || "-"} />
              <DetailField label="Hora Llegada" value={res.arrivalTime || "-"} />
            </>
          )}

          {!isFlight && (
            <>
              <DetailField label="Direccion" value={res.address || "-"} />
              <DetailField label="Check-in" value={res.checkIn ? new Date(res.checkIn + "T12:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "long" }) : "-"} />
              <DetailField label="Check-out" value={res.checkOut ? new Date(res.checkOut + "T12:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "long" }) : "-"} />
            </>
          )}
        </div>

        {res.notes && (
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground mb-1">Notas</p>
            <p className="text-sm text-card-foreground leading-relaxed">{res.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm font-medium text-card-foreground">{value}</p>
    </div>
  );
}
