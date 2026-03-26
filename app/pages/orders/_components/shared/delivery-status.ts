import type { Delivery } from "~/types/delivery";

export type DeliveryTimelineState =
  | "complete"
  | "current"
  | "upcoming"
  | "error"
  | "neutral";

export type DeliveryTimelineEntry = {
  key: string;
  title: string;
  description: string;
  date?: string;
  state: DeliveryTimelineState;
};

export const buildDeliveryTimelineEntries = (
  delivery: Delivery,
): DeliveryTimelineEntry[] => {
  if (delivery.status === "failed") {
    return [
      {
        key: "scheduled",
        title: "Delivery scheduled",
        description: "Your order was prepared for fulfillment scheduling.",
        date: delivery.scheduled_at ?? delivery.created_at,
        state: "complete",
      },
      {
        key: "failed",
        title: "Delivery failed",
        description: "The delivery could not be completed successfully.",
        date: delivery.updated_at,
        state: "error",
      },
    ];
  }

  if (delivery.status === "cancelled") {
    return [
      {
        key: "scheduled",
        title: "Delivery scheduled",
        description: "Your order reached the delivery scheduling stage.",
        date: delivery.scheduled_at ?? delivery.created_at,
        state: "complete",
      },
      {
        key: "cancelled",
        title: "Delivery cancelled",
        description: "The delivery was cancelled before completion.",
        date: delivery.updated_at,
        state: "neutral",
      },
    ];
  }

  return [
    {
      key: "scheduled",
      title: "Delivery scheduled",
      description: "Your order has been scheduled for fulfillment.",
      date: delivery.scheduled_at ?? delivery.created_at,
      state:
        delivery.status === "scheduled"
          ? "current"
          : delivery.status === "in_transit" || delivery.status === "delivered"
            ? "complete"
            : "upcoming",
    },
    {
      key: "in_transit",
      title: "In transit",
      description: "Your order is currently moving through delivery.",
      date: delivery.status === "in_transit" ? delivery.updated_at : undefined,
      state:
        delivery.status === "in_transit"
          ? "current"
          : delivery.status === "delivered"
            ? "complete"
            : "upcoming",
    },
    {
      key: "delivered",
      title: "Delivered",
      description: "Your order has been delivered successfully.",
      date: delivery.delivered_at ?? undefined,
      state: delivery.status === "delivered" ? "current" : "upcoming",
    },
  ];
};
