import type { NavItem } from "@/types/nav";
import { LayoutDashboard, Search } from "lucide-react";

export const NAV_DATA: NavItem[] = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Search",
    url: "/search",
    icon: Search,
  },
];
