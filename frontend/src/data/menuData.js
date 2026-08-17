import {
  LayoutDashboard,
  ClipboardList,
  Users,
  ShieldCheck,
  Settings,
} from "lucide-react";

export const roles = [
  { id: "admin", label: "Admin" },
  { id: "manager", label: "Manager" },
  { id: "staff", label: "Staff" },
];

export const fullMenuTree = [
  {
    id: "1",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "manager", "staff"],
    children: [],
  },
  {
    id: "2",
    label: "Menu Items",
    icon: ClipboardList,
    roles: ["admin", "manager", "staff"],
    children: [
      {
        id: "2a",
        label: "All Items",
        roles: ["admin", "manager", "staff"],
        children: [],
      },
      {
        id: "2b",
        label: "Categories",
        roles: ["admin", "manager"],
        children: [],
      },
    ],
  },
  {
    id: "3",
    label: "Consumers",
    icon: Users,
    roles: ["admin", "manager"],
    children: [],
  },
  {
    id: "4",
    label: "Access Control",
    icon: ShieldCheck,
    roles: ["admin"],
    children: [
      {
        id: "4a",
        label: "Roles",
        roles: ["admin"],
        children: [],
      },
      {
        id: "4b",
        label: "Menu Assignment",
        roles: ["admin"],
        children: [],
      },
    ],
  },
  {
    id: "5",
    label: "Settings",
    icon: Settings,
    roles: ["admin"],
    children: [],
  },
];

export function filterTreeForRole(nodes, roleId) {
  return nodes
    .filter((n) => n.roles.includes(roleId))
    .map((n) => ({
      ...n,
      children: filterTreeForRole(n.children || [], roleId),
    }));
}