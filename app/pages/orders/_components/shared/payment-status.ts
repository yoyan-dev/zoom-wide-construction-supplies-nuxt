import type { Payment, PaymentStatus } from "~/types/payment";

export type PaymentBadgeColor =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "error"
  | "neutral";

export type PaymentTimelineState =
  | "complete"
  | "current"
  | "upcoming"
  | "error"
  | "neutral";

export type PaymentTimelineEntry = {
  key: string;
  title: string;
  description: string;
  date?: string;
  state: PaymentTimelineState;
};

export const getPaymentStatusBadge = (
  status?: PaymentStatus | null,
): { color: PaymentBadgeColor; label: string } => {
  switch (status) {
    case "paid":
      return { color: "success", label: "Paid" };
    case "failed":
      return { color: "error", label: "Failed" };
    case "refunded":
      return { color: "neutral", label: "Refunded" };
    case "pending":
      return { color: "warning", label: "Pending" };
    default:
      return { color: "neutral", label: "Not Recorded" };
  }
};

export const getPaymentStatusDescription = (
  status?: PaymentStatus | null,
): string => {
  switch (status) {
    case "paid":
      return "This payment has been confirmed and recorded as paid.";
    case "failed":
      return "This payment did not complete successfully and may need follow-up.";
    case "refunded":
      return "This payment was previously recorded and has since been refunded.";
    case "pending":
      return "This payment is recorded but still awaiting confirmation or completion.";
    default:
      return "No payment record is available for this order yet.";
  }
};

export const buildPaymentTimelineEntries = (
  payment: Payment,
): PaymentTimelineEntry[] => {
  const recordedEntry: PaymentTimelineEntry = {
    key: "recorded",
    title: "Payment recorded",
    description: "A payment entry was created for this order.",
    date: payment.created_at,
    state: payment.status === "pending" ? "current" : "complete",
  };

  if (payment.status === "failed") {
    return [
      recordedEntry,
      {
        key: "failed",
        title: "Payment failed",
        description: "The payment could not be completed successfully.",
        date: payment.updated_at,
        state: "error",
      },
    ];
  }

  if (payment.status === "refunded") {
    return [
      recordedEntry,
      {
        key: "paid",
        title: "Payment completed",
        description: "The payment was successfully completed before the refund.",
        date: payment.paid_at ?? payment.updated_at,
        state: "complete",
      },
      {
        key: "refunded",
        title: "Payment refunded",
        description: "The payment has been marked as refunded.",
        date: payment.updated_at,
        state: "neutral",
      },
    ];
  }

  return [
    recordedEntry,
    {
      key: "paid",
      title: "Payment completed",
      description: "The payment has been successfully completed.",
      date: payment.status === "paid" ? (payment.paid_at ?? payment.updated_at) : undefined,
      state: payment.status === "paid" ? "current" : "upcoming",
    },
  ];
};
