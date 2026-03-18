import type { User } from "~/types/user";
import { daysAgo } from "./utils";

export const warehouseUsers: User[] = [
  {
    id: "usr-wh-001",
    email: "avery.gomez@zoomwide.com",
    full_name: "Avery Gomez",
    role: "warehouse_manager",
    phone: "+1-555-0201",
    is_active: true,
    created_at: daysAgo(180),
    updated_at: daysAgo(2),
  },
  {
    id: "usr-wh-002",
    email: "jordan.lee@zoomwide.com",
    full_name: "Jordan Lee",
    role: "staff",
    phone: "+1-555-0209",
    is_active: true,
    created_at: daysAgo(140),
    updated_at: daysAgo(5),
  },
  {
    id: "usr-wh-003",
    email: "morgan.chen@zoomwide.com",
    full_name: "Morgan Chen",
    role: "staff",
    phone: "+1-555-0216",
    is_active: false,
    created_at: daysAgo(220),
    updated_at: daysAgo(18),
  },
  {
    id: "usr-wh-004",
    email: "riley.patel@zoomwide.com",
    full_name: "Riley Patel",
    role: "warehouse_manager",
    phone: "+1-555-0227",
    is_active: true,
    created_at: daysAgo(90),
    updated_at: daysAgo(1),
  },
  {
    id: "usr-wh-005",
    email: "sasha.ortiz@zoomwide.com",
    full_name: "Sasha Ortiz",
    role: "staff",
    phone: "+1-555-0233",
    is_active: true,
    created_at: daysAgo(60),
    updated_at: daysAgo(4),
  },
];

export const warehouseUserAssignments: Record<string, string[]> = {
  "usr-wh-001": ["Central Warehouse", "North Distribution"],
  "usr-wh-002": ["Central Warehouse"],
  "usr-wh-003": ["South Yard"],
  "usr-wh-004": ["East Storage"],
  "usr-wh-005": ["Central Warehouse", "East Storage"],
};
