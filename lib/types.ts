export interface Destination {
  id: string;
  name: string;
  imageUrl: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

export interface ChecklistItem {
  id: string;
  category: string;
  text: string;
  completed: boolean;
}

export interface Activity {
  id: string;
  title: string;
  destinationId: string;
  date: string;
  time: string;
  notes: string;
  url: string;
  status: "pendiente" | "reservado" | "pagado";
}

export interface Reservation {
  id: string;
  type: "vuelo" | "hotel";
  date: string;
  destinationId: string;
  bookingCode: string;
  notes: string;
  airline?: string;
  flightNumber?: string;
  departureTime?: string;
  arrivalTime?: string;
  hotelName?: string;
  address?: string;
  checkIn?: string;
  checkOut?: string;
}

export type TabType = "home" | "checklist" | "calendar" | "destinations" | "activities" | "reservations";
