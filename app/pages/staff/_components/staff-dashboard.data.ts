import type { StaffQuickActionTemplate } from "./staff-dashboard.types";

export const staffQuickActionTemplates: StaffQuickActionTemplate[] = [
  {
    id: "view-orders",
    label: "View Orders",
    description: "Open the order queue to review, confirm, and hand off active requests.",
    icon: "i-lucide-shopping-cart",
    tone: "warning",
    to: "/staff/orders",
  },
  {
    id: "check-products",
    label: "Check Products",
    description: "Review stock-sensitive materials and coordinate with the products team.",
    icon: "i-lucide-package",
    tone: "primary",
    to: "/staff/products",
  },
  {
    id: "check-customers",
    label: "Check Customers",
    description: "Respond to quotation requests, follow-ups, and stock-related concerns.",
    icon: "i-lucide-users",
    tone: "info",
    to: "/staff/customers",
  },
  {
    id: "monitor-deliveries",
    label: "Monitor Deliveries",
    description: "Track dispatch updates, route delays, and driver coordination.",
    icon: "i-lucide-truck",
    tone: "success",
    to: "/staff/deliveries",
  },
  {
    id: "view-reports",
    label: "View Reports",
    description: "Check daily operational visibility for processing, stock pressure, and dispatch.",
    icon: "i-lucide-chart-column",
    tone: "neutral",
    to: "/staff/reports",
  },
  {
    id: "open-pending-tasks",
    label: "Open Pending Tasks",
    description: "Jump to the operational checklist and clear the next follow-up items.",
    icon: "i-lucide-list-todo",
    tone: "error",
    to: "/staff#pending-tasks",
  },
];
