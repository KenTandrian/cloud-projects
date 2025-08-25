import type { NavItem } from "@/types/nav";
import { Home, LayoutDashboard } from "lucide-react";

export const NAV_DATA: NavItem[] = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
];
