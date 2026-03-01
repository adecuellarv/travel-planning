"use client";

import { useState } from "react";
import { TravelProvider } from "@/context/travel-context";
import { SidebarNav, BottomNav } from "@/components/layout/sidebar-nav";
import { HomeSection } from "@/components/sections/home-section";
import { ChecklistSection } from "@/components/sections/checklist-section";
import { CalendarSection } from "@/components/sections/calendar-section";
import { ActivitiesSection } from "@/components/sections/activities-section";
import { ReservationsSection } from "@/components/sections/reservations-section";
import { DestinationsSection } from "@/components/sections/destinations-section";
import type { TabType } from "@/lib/types";

function ActiveSection({ tab }: { tab: TabType }) {
  switch (tab) {
    case "home":
      return <HomeSection />;
    case "destinations":
      return <DestinationsSection />;
    case "checklist":
      return <ChecklistSection />;
    case "calendar":
      return <CalendarSection />;
    case "activities":
      return <ActivitiesSection />;
    case "reservations":
      return <ReservationsSection />;
  }
}

export default function Page() {
  const [activeTab, setActiveTab] = useState<TabType>("home");

  return (
    <TravelProvider>
      <div className="flex min-h-screen bg-background">
        <SidebarNav activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 min-h-screen pb-20 md:pb-0">
          <div className="max-w-4xl mx-auto px-4 py-6 md:px-8 md:py-8">
            <ActiveSection tab={activeTab} />
          </div>
        </main>
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </TravelProvider>
  );
}
