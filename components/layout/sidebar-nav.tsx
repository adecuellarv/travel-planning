"use client";

import { Home, CheckSquare, Calendar, Compass, Plane, MapPin } from "lucide-react";
import type { TabType } from "@/lib/types";
import { cn } from "@/lib/utils";

const NAV_ITEMS: { id: TabType; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "destinations", label: "Destinos", icon: MapPin },
  { id: "calendar", label: "Calendario", icon: Calendar },
  { id: "activities", label: "Actividades", icon: Compass },
  { id: "reservations", label: "Reservas", icon: Plane },
  { id: "checklist", label: "Checklist", icon: CheckSquare },
];

interface SidebarNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function SidebarNav({ activeTab, onTabChange }: SidebarNavProps) {
  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen bg-sidebar border-r border-sidebar-border">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary">
          <Plane className="w-5 h-5 text-primary-foreground" />
        </div>
        <h1 className="text-lg font-semibold text-sidebar-foreground tracking-tight">
          Travel Juuls & Ade
        </h1>
      </div>
      <nav className="flex flex-col gap-1 px-3 flex-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-primary"
                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <Icon className="w-[18px] h-[18px]" />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="px-6 py-4 border-t border-sidebar-border">
        <p className="text-xs text-muted-foreground">
          Datos guardados localmente
        </p>
      </div>
    </aside>
  );
}

export function BottomNav({ activeTab, onTabChange }: SidebarNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-sidebar border-t border-sidebar-border px-1 py-2 safe-bottom">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all duration-200 min-w-0",
              isActive
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[9px] font-medium truncate">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
