"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { CitizenDashboard } from "@/components/Citizen/CitizenDashboard";
import { NotificationsPanel } from "@/components/NotificationPanel";
import { useSession } from "next-auth/react";

export default function Page() {
  const { data: session } = useSession();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const userId = session?.user?.id; // replace with session later

  const notifications = useQuery(
    api.notifications.getByUser,
    userId ? { userId } : "skip",
  );

  const unreadCount = notifications?.filter((n) => !n.read).length || 0;

  return (
    <>
      <CitizenDashboard
        onNotificationsClick={() => setIsNotificationsOpen(true)}
        unreadCount={unreadCount}
      />

      <NotificationsPanel
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications || []}
      />
    </>
  );
}
