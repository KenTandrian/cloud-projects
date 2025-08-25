import type { LucideIcon } from "lucide-react";
import type { Route } from "next";

export type NavItem = {
  title: string;
  url: Route;
  icon: LucideIcon;
  isActive?: boolean;
  items?: NavItem[];
};
