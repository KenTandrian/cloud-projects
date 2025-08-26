"use client";

import { ChevronsUpDown, User2 } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useVisitorIdContext } from "@/components/visitor-id-provider";

const VISITOR_PROFILES = [
  { id: "investor-value-15", label: "Conservative (Value) Investor 1" },
  { id: "investor-value-126", label: "Conservative (Value) Investor 2" },
  { id: "investor-tech-72", label: "Tech Focused Investor 1" },
  { id: "investor-tech-160", label: "Tech Focused Investor 2" },
  { id: "investor-hedger-236", label: "Strategic Hedger 1" },
  { id: "investor-hedger-154", label: "Strategic Hedger 2" },
  { id: "investor-dca-59", label: "Dollar-Cost Averager (ETF) 1" },
  { id: "investor-dca-220", label: "Dollar-Cost Averager (ETF) 2" },
];

export function NavUser() {
  const { visitorId, setVisitorId } = useVisitorIdContext();
  const selectedProfile = VISITOR_PROFILES.find((p) => p.id === visitorId);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg">
                  <User2 className="size-4" />
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {selectedProfile?.label}
                </span>
                <span className="truncate text-xs">{selectedProfile?.id}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              {VISITOR_PROFILES.map((profile) => (
                <DropdownMenuCheckboxItem
                  key={profile.id}
                  checked={visitorId === profile.id}
                  onCheckedChange={() => setVisitorId(profile.id)}
                >
                  {profile.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
