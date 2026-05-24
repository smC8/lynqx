import type { WorkspaceId } from "./types";

export interface WorkspaceDef {
  id: WorkspaceId;
  label: string;
  sub: string;
  icon: string;
  color: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  badge?: string;
}

export interface NavSection {
  section: string;
  items: NavItem[];
}

export const WORKSPACES: WorkspaceDef[] = [
  { id: "exec", label: "Indus Treasury",   sub: "Corporate · Executive",    icon: "Building", color: "#9FE870" },
  { id: "bank", label: "HDFC · Lynqx Hub", sub: "Bank · Customer console",  icon: "Bank",     color: "#C0C8FF" },
  { id: "dev",  label: "Lattice Pay",       sub: "Developer · Sandbox",      icon: "Code",     color: "#D0D0F8" },
];

export const NAV_BY_WORKSPACE: Record<WorkspaceId, NavSection[]> = {
  exec: [
    {
      section: "Operate",
      items: [
        { id: "overview",     label: "Overview",      icon: "Home" },
        { id: "copilot",      label: "Copilot",       icon: "Wand", badge: "AI" },
        { id: "accounts",     label: "Accounts",      icon: "Wallet" },
        { id: "transactions", label: "Transactions",  icon: "Activity" },
        { id: "statements",   label: "Statements",    icon: "Doc" },
        { id: "accountlink",  label: "Link account",  icon: "Link" },
        { id: "bankops",      label: "Operations",    icon: "Plug" },
      ],
    },
    {
      section: "Develop",
      items: [{ id: "devconsole", label: "Developer", icon: "Code" }],
    },
    {
      section: "Configure",
      items: [
        { id: "marketplace", label: "Marketplace", icon: "Grid" },
        { id: "team",        label: "Team",        icon: "Users" },
        { id: "settings",    label: "Settings",    icon: "Settings" },
      ],
    },
  ],
  bank: [
    {
      section: "Operate",
      items: [
        { id: "overview", label: "Overview",   icon: "Home" },
        { id: "copilot",  label: "Copilot",    icon: "Wand", badge: "AI" },
        { id: "bankops",  label: "Operations", icon: "Activity" },
      ],
    },
    {
      section: "Configure",
      items: [
        { id: "marketplace", label: "Marketplace", icon: "Grid" },
        { id: "team",        label: "Team",        icon: "Users" },
        { id: "settings",    label: "Settings",    icon: "Settings" },
      ],
    },
  ],
  dev: [
    {
      section: "Develop",
      items: [
        { id: "overview",   label: "Overview",  icon: "Home" },
        { id: "copilot",    label: "Copilot",   icon: "Wand", badge: "AI" },
        { id: "devconsole", label: "Developer", icon: "Code" },
      ],
    },
    {
      section: "Configure",
      items: [
        { id: "marketplace", label: "Marketplace",     icon: "Grid" },
        { id: "accountlink", label: "Account linking", icon: "Link" },
        { id: "settings",    label: "Settings",        icon: "Settings" },
      ],
    },
  ],
};
