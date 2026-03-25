const currencyFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const longDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export const formatCurrency = (value: number) => currencyFormatter.format(value);

export const formatNumber = (value: number) => numberFormatter.format(value);

export const formatShortDate = (value: string) =>
  shortDateFormatter.format(new Date(value));

export const formatShortDateOrFallback = (
  value?: string | null,
  fallback = "—",
) => (value ? formatShortDate(value) : fallback);

export const formatLongDate = (value: string) =>
  longDateFormatter.format(new Date(value));
