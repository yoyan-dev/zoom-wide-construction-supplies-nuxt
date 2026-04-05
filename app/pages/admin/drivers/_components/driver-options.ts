import type { Driver } from "~/types/driver";

export const DRIVER_STATUS_OPTIONS = [
  { label: "All statuses", value: "all" },
  { label: "Active only", value: "active" },
  { label: "Inactive only", value: "inactive" },
];

export const isDriverActive = (driver: Pick<Driver, "is_active">) =>
  driver.is_active !== false;

export const getDriverStatusLabel = (isActive?: boolean | null) =>
  isActive === false ? "Inactive" : "Active";

export const getDriverStatusColor = (isActive?: boolean | null) =>
  isActive === false ? "warning" : "success";

export const isMatchingDriverStatusFilter = (
  driver: Pick<Driver, "is_active">,
  filter: string,
) => {
  if (filter === "active") {
    return isDriverActive(driver);
  }

  if (filter === "inactive") {
    return !isDriverActive(driver);
  }

  return true;
};
