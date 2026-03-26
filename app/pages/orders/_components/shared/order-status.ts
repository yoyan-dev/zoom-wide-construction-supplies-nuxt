import type { Order } from "~/types/order";

export type OrderTimelineState =
  | "complete"
  | "current"
  | "upcoming"
  | "error"
  | "neutral";

export type OrderTimelineEntry = {
  key: string;
  title: string;
  description: string;
  date?: string;
  state: OrderTimelineState;
};

export const buildOrderTimelineEntries = (order: Order): OrderTimelineEntry[] => {
  const submittedEntry: OrderTimelineEntry = {
    key: "submitted",
    title: "Order submitted",
    description: "Your order request was received and is waiting for review.",
    date: order.created_at,
    state: order.status === "pending" ? "current" : "complete",
  };

  if (order.status === "rejected") {
    return [
      submittedEntry,
      {
        key: "rejected",
        title: "Order rejected",
        description:
          order.rejection_reason ||
          "The order could not be approved with the current review outcome.",
        date: order.updated_at,
        state: "error",
      },
    ];
  }

  if (order.status === "cancelled") {
    return [
      submittedEntry,
      {
        key: "cancelled",
        title: "Order cancelled",
        description: "The order was cancelled before it reached completion.",
        date: order.updated_at,
        state: "neutral",
      },
    ];
  }

  const approvedEntry: OrderTimelineEntry = {
    key: "approved",
    title: "Order approved",
    description: "The order passed review and is ready for the next operational step.",
    date:
      order.status === "approved" || order.status === "completed"
        ? order.updated_at
        : undefined,
    state:
      order.status === "approved"
        ? "current"
        : order.status === "completed"
          ? "complete"
          : "upcoming",
  };

  const completedEntry: OrderTimelineEntry = {
    key: "completed",
    title: "Order completed",
    description: "The order reached its final completed status.",
    date: order.status === "completed" ? order.updated_at : undefined,
    state: order.status === "completed" ? "current" : "upcoming",
  };

  return [submittedEntry, approvedEntry, completedEntry];
};
