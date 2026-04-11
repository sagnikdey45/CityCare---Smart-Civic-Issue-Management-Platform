import { PlusCircle, Bell, User, Search, TrendingUp, Grid } from "lucide-react";

export const TUTORIAL_STEPS = [
  {
    target: "report-issue",
    title: "Report an Issue",
    description: "Notice a civic issue? Click here to quickly fill out a report with location, category, and photo evidence.",
    icon: PlusCircle,
    placement: "bottom"
  },
  {
    target: "notifications",
    title: "Stay Notified",
    description: "Check here for real-time updates on your reported issues, such as status changes or official comments.",
    icon: Bell,
    placement: "bottom"
  },
  {
    target: "profile",
    title: "Manage Profile",
    description: "Access your account settings, preferences, or sign out of your session securely here.",
    icon: User,
    placement: "bottom-left"
  },
  {
    target: "stats-cards",
    title: "Platform Overview",
    description: "Track high-level metrics of your issues logged, pending reviews, and resolved conditions at a glance.",
    icon: TrendingUp,
    placement: "bottom"
  },
  {
    target: "search-filters",
    title: "Quick Search & Filters",
    description: "Use these powerful tools to quickly sift through your dashboard by ticket ID, resolution status, or specific category.",
    icon: Search,
    placement: "bottom"
  },
  {
    target: "view-toggle",
    title: "Layout Flexibility",
    description: "Switch seamlessly between a highly detailed Grid layout and a condensed List view depending on your preference.",
    icon: Grid,
    placement: "left"
  }
];
