export type AdminActionColor =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "error"
  | "neutral";

export type AdminActionItem = {
  label: string;
  icon: string;
  color?: AdminActionColor;
  to?: string;
  onClick?: () => boolean | void | Promise<boolean | void>;
};

export type AdminActionSection = {
  label: string;
  actions: AdminActionItem[];
};
