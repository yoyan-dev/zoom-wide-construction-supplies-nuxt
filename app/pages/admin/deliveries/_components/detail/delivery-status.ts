import type { Delivery } from "~/types/delivery";

export type DeliveryTimelineState =
  | "complete"
  | "current"
  | "upcoming"
  | "error"
  | "neutral";

export type DeliveryTimelineEntry = {
  key: string;
  label: string;
  description: string;
  state: DeliveryTimelineState;
};

export const buildDeliveryTimelineEntries = (
  delivery: Delivery,
): DeliveryTimelineEntry[] => {
  switch (delivery.status) {
    case "delivered":
      return [
        {
          key: "scheduled",
          label: "Scheduled",
          description: "Delivery has been scheduled for fulfillment.",
          state: "complete",
        },
        {
          key: "in_transit",
          label: "In Transit",
          description: "Delivery has moved into fulfillment transit.",
          state: "complete",
        },
        {
          key: "delivered",
          label: "Delivered",
          description: "Delivery was completed successfully.",
          state: "current",
        },
      ];
    case "in_transit":
      return [
        {
          key: "scheduled",
          label: "Scheduled",
          description: "Delivery has been scheduled for fulfillment.",
          state: "complete",
        },
        {
          key: "in_transit",
          label: "In Transit",
          description: "Delivery is currently moving toward completion.",
          state: "current",
        },
        {
          key: "delivered",
          label: "Delivered",
          description: "Delivery will be marked complete once fulfilled.",
          state: "upcoming",
        },
      ];
    case "failed":
      return [
        {
          key: "scheduled",
          label: "Scheduled",
          description: "Delivery was prepared for fulfillment.",
          state: "complete",
        },
        {
          key: "failed",
          label: "Failed",
          description: "Delivery could not be completed successfully.",
          state: "error",
        },
      ];
    case "cancelled":
      return [
        {
          key: "scheduled",
          label: "Scheduled",
          description: "Delivery was prepared before it was cancelled.",
          state: "complete",
        },
        {
          key: "cancelled",
          label: "Cancelled",
          description: "Delivery was cancelled before completion.",
          state: "neutral",
        },
      ];
    default:
      return [
        {
          key: "scheduled",
          label: "Scheduled",
          description: "Delivery has been created and scheduled.",
          state: "current",
        },
        {
          key: "in_transit",
          label: "In Transit",
          description: "Delivery will move into transit once fulfillment starts.",
          state: "upcoming",
        },
        {
          key: "delivered",
          label: "Delivered",
          description: "Delivery will be marked complete when received.",
          state: "upcoming",
        },
      ];
  }
};
