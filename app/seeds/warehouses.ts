import type { Warehouse } from "~/types/warehouse";
import { daysAgo } from "./utils";

export const warehouses: Warehouse[] = [
  {
    id: "wh-central",
    name: "Central Warehouse",
    address: "1200 Industrial Ave, Metro City",
    manager_id: "usr-wh-001",
    capacity: 12000,
    status: "active",
    created_at: daysAgo(420),
    updated_at: daysAgo(2),
  },
  {
    id: "wh-north",
    name: "North Distribution",
    address: "845 Harbor Rd, North District",
    manager_id: "usr-wh-004",
    capacity: 8600,
    status: "active",
    created_at: daysAgo(380),
    updated_at: daysAgo(5),
  },
  {
    id: "wh-south",
    name: "South Yard",
    address: "52 Foundry St, Southside",
    manager_id: null,
    capacity: 6400,
    status: "inactive",
    created_at: daysAgo(260),
    updated_at: daysAgo(18),
  },
  {
    id: "wh-east",
    name: "East Storage",
    address: "3100 Lakeside Dr, East End",
    manager_id: "usr-wh-005",
    capacity: 4800,
    status: "active",
    created_at: daysAgo(190),
    updated_at: daysAgo(7),
  },
];
