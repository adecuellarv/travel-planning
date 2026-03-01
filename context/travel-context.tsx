"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { saveToLS, getFromLS } from "@/lib/storage";
import type { Destination, ChecklistItem, Activity, Reservation } from "@/lib/types";

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: "1", category: "Documentos", text: "Pasaporte vigente", completed: false },
  { id: "2", category: "Documentos", text: "Visa / permisos", completed: false },
  { id: "3", category: "Documentos", text: "Seguro de viaje", completed: false },
  { id: "4", category: "Reservas", text: "Vuelos confirmados", completed: false },
  { id: "5", category: "Reservas", text: "Hoteles confirmados", completed: false },
  { id: "6", category: "Medicina", text: "Medicinas personales", completed: false },
  { id: "7", category: "Medicina", text: "Botiquin basico", completed: false },
  { id: "8", category: "Ropa", text: "Ropa para el clima", completed: false },
  { id: "9", category: "Ropa", text: "Zapatos comodos", completed: false },
  { id: "10", category: "Moneda", text: "Cambio de divisa", completed: false },
  { id: "11", category: "Plan celular", text: "SIM internacional / roaming", completed: false },
  { id: "12", category: "Otros", text: "Cargadores y adaptadores", completed: false },
];

interface TravelContextType {
  destinations: Destination[];
  addDestination: (d: Destination) => void;
  updateDestination: (d: Destination) => void;
  deleteDestination: (id: string) => void;
  checklist: ChecklistItem[];
  toggleChecklistItem: (id: string) => void;
  addChecklistItem: (item: ChecklistItem) => void;
  deleteChecklistItem: (id: string) => void;
  activities: Activity[];
  addActivity: (act: Activity) => void;
  updateActivity: (act: Activity) => void;
  deleteActivity: (id: string) => void;
  reservations: Reservation[];
  addReservation: (res: Reservation) => void;
  updateReservation: (res: Reservation) => void;
  deleteReservation: (id: string) => void;
  getDestinationForDate: (date: string) => Destination | undefined;
  getActivitiesForDate: (date: string) => Activity[];
}

const TravelContext = createContext<TravelContextType | null>(null);

export function TravelProvider({ children }: { children: ReactNode }) {
  const [destinations, setDestinationsState] = useState<Destination[]>([]);
  const [checklist, setChecklistState] = useState<ChecklistItem[]>([]);
  const [activities, setActivitiesState] = useState<Activity[]>([]);
  const [reservations, setReservationsState] = useState<Reservation[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setDestinationsState(getFromLS<Destination[]>("travel_destinations", []));
    setChecklistState(getFromLS<ChecklistItem[]>("travel_checklist", DEFAULT_CHECKLIST));
    setActivitiesState(getFromLS<Activity[]>("travel_activities", []));
    setReservationsState(getFromLS<Reservation[]>("travel_reservations", []));
    setLoaded(true);
  }, []);

  // Destinations
  const addDestination = useCallback((d: Destination) => {
    setDestinationsState((prev) => {
      const next = [...prev, d].sort((a, b) => a.startDate.localeCompare(b.startDate));
      saveToLS("travel_destinations", next);
      return next;
    });
  }, []);

  const updateDestination = useCallback((d: Destination) => {
    setDestinationsState((prev) => {
      const next = prev.map((x) => (x.id === d.id ? d : x));
      saveToLS("travel_destinations", next);
      return next;
    });
  }, []);

  const deleteDestination = useCallback((id: string) => {
    setDestinationsState((prev) => {
      const next = prev.filter((x) => x.id !== id);
      saveToLS("travel_destinations", next);
      return next;
    });
  }, []);

  // Checklist
  const toggleChecklistItem = useCallback((id: string) => {
    setChecklistState((prev) => {
      const next = prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      );
      saveToLS("travel_checklist", next);
      return next;
    });
  }, []);

  const addChecklistItem = useCallback((item: ChecklistItem) => {
    setChecklistState((prev) => {
      const next = [...prev, item];
      saveToLS("travel_checklist", next);
      return next;
    });
  }, []);

  const deleteChecklistItem = useCallback((id: string) => {
    setChecklistState((prev) => {
      const next = prev.filter((i) => i.id !== id);
      saveToLS("travel_checklist", next);
      return next;
    });
  }, []);

  // Activities
  const addActivity = useCallback((act: Activity) => {
    setActivitiesState((prev) => {
      const next = [...prev, act];
      saveToLS("travel_activities", next);
      return next;
    });
  }, []);

  const updateActivity = useCallback((act: Activity) => {
    setActivitiesState((prev) => {
      const next = prev.map((a) => (a.id === act.id ? act : a));
      saveToLS("travel_activities", next);
      return next;
    });
  }, []);

  const deleteActivity = useCallback((id: string) => {
    setActivitiesState((prev) => {
      const next = prev.filter((a) => a.id !== id);
      saveToLS("travel_activities", next);
      return next;
    });
  }, []);

  // Reservations
  const addReservation = useCallback((res: Reservation) => {
    setReservationsState((prev) => {
      const next = [...prev, res];
      saveToLS("travel_reservations", next);
      return next;
    });
  }, []);

  const updateReservation = useCallback((res: Reservation) => {
    setReservationsState((prev) => {
      const next = prev.map((r) => (r.id === res.id ? res : r));
      saveToLS("travel_reservations", next);
      return next;
    });
  }, []);

  const deleteReservation = useCallback((id: string) => {
    setReservationsState((prev) => {
      const next = prev.filter((r) => r.id !== id);
      saveToLS("travel_reservations", next);
      return next;
    });
  }, []);

  // Helpers
  const getDestinationForDate = useCallback((date: string) => {
    return destinations.find((d) => date >= d.startDate && date < d.endDate);
  }, [destinations]);

  const getActivitiesForDate = useCallback((date: string) => {
    return activities.filter((a) => a.date === date);
  }, [activities]);

  if (!loaded) return null;

  return (
    <TravelContext.Provider
      value={{
        destinations, addDestination, updateDestination, deleteDestination,
        checklist, toggleChecklistItem, addChecklistItem, deleteChecklistItem,
        activities, addActivity, updateActivity, deleteActivity,
        reservations, addReservation, updateReservation, deleteReservation,
        getDestinationForDate, getActivitiesForDate,
      }}
    >
      {children}
    </TravelContext.Provider>
  );
}

export function useTravel() {
  const ctx = useContext(TravelContext);
  if (!ctx) throw new Error("useTravel must be used within TravelProvider");
  return ctx;
}
