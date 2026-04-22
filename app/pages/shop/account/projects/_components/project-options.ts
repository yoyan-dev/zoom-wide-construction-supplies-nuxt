import type { Project, ProjectStatus } from "~/types/project";

export const PROJECT_STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
  { label: "On hold", value: "on_hold" },
  { label: "Cancelled", value: "cancelled" },
] as const;

export const getProjectStatusLabel = (status?: ProjectStatus | null) => {
  switch (status) {
    case "completed":
      return "Completed";
    case "on_hold":
      return "On hold";
    case "cancelled":
      return "Cancelled";
    default:
      return "Active";
  }
};

export const getProjectStatusColor = (status?: ProjectStatus | null) => {
  switch (status) {
    case "completed":
      return "success";
    case "on_hold":
      return "warning";
    case "cancelled":
      return "error";
    default:
      return "primary";
  }
};

export const getProjectProgress = (project?: Pick<Project, "progress"> | null) => {
  const value = Number(project?.progress ?? 0);

  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
};
