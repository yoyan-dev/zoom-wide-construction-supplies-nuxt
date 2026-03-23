export type StaffTone =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "error"
  | "neutral";

export type StaffStat = {
  id: string;
  label: string;
  value: string;
  description: string;
  change: string;
  icon: string;
  tone: StaffTone;
};

export type StaffQuickAction = {
  id: string;
  label: string;
  description: string;
  count: string;
  icon: string;
  tone: StaffTone;
  to: string;
};

export type StaffQuickActionTemplate = Omit<StaffQuickAction, "count">;

export type StaffOrder = {
  id: string;
  customer: string;
  project: string;
  items: string;
  total: number;
  status: string;
  statusTone: StaffTone;
  deliveryWindow: string;
  assignee: string;
};

export type StaffTask = {
  id: string;
  title: string;
  detail: string;
  due: string;
  owner: string;
  priority: string;
  priorityTone: StaffTone;
  to: string;
};

export type StaffStockAlert = {
  id: string;
  name: string;
  sku: string;
  remaining: string;
  location: string;
  level: string;
  levelTone: StaffTone;
  restockNote: string;
};

export type StaffDeliverySummary = {
  id: string;
  label: string;
  value: string;
  tone: StaffTone;
  icon: string;
};

export type StaffDelivery = {
  id: string;
  orderId: string;
  destination: string;
  driver: string;
  status: string;
  statusTone: StaffTone;
  eta: string;
  loadSummary: string;
};

export type StaffCustomerConcern = {
  id: string;
  customer: string;
  topic: string;
  channel: string;
  waitTime: string;
  priority: string;
  priorityTone: StaffTone;
  requestedAction: string;
  to: string;
};

export type StaffActivity = {
  id: string;
  title: string;
  detail: string;
  time: string;
  icon: string;
  tone: StaffTone;
};
