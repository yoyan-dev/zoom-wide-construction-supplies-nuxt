import type { DeliveryStatus } from "~/types/delivery";

export type DeliveryBadgeColor =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "error"
  | "neutral";

export const getDeliveryStatusBadge = (
  status?: DeliveryStatus | null,
): { color: DeliveryBadgeColor; label: string } => {
  switch (status) {
    case "delivered":
      return { color: "success", label: "Delivered" };
    case "in_transit":
      return { color: "info", label: "In Transit" };
    case "failed":
      return { color: "error", label: "Failed" };
    case "cancelled":
      return { color: "neutral", label: "Cancelled" };
    case "scheduled":
      return { color: "warning", label: "Scheduled" };
    default:
      return { color: "neutral", label: "Not Scheduled" };
  }
};
