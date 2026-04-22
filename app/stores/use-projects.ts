import { ref } from "vue";
import { defineStore } from "pinia";
import type { PaginationMeta } from "~/types/pagination";
import type {
  CreateProjectItemPayload,
  CreateProjectPayload,
  FetchProjectParams,
  Project,
  ProjectItem,
  UpdateProjectItemPayload,
  UpdateProjectPayload,
} from "~/types/project";
import type { Order } from "~/types/order";
import type { StoreResponse } from "~/types/store-response";
import { apiRequest, apiRequestRaw, toErrorMessage } from "~/utils/api";

export const useProjectStore = defineStore("projects", () => {
  const projects = ref<Project[]>([]);
  const project = ref<Project | null>(null);
  const projectItems = ref<ProjectItem[]>([]);
  const totalProjects = ref(0);
  const isLoading = ref(false);

  const query = ref<FetchProjectParams>({
    page: 1,
    limit: 10,
  });

  const pagination = ref<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const syncProjectRecord = (nextProject: Project) => {
    project.value = nextProject;
    projects.value = projects.value.map((entry) =>
      entry.id === nextProject.id ? nextProject : entry,
    );
  };

  async function fetchProjects(params?: FetchProjectParams) {
    isLoading.value = true;

    try {
      if (params) {
        query.value = {
          ...query.value,
          ...params,
        };
      }

      const result = await apiRequest<Project[]>("/projects", {
        query: query.value,
      });

      projects.value = result.data || [];
      totalProjects.value =
        result.total || result.meta?.total || result.data?.length || 0;

      pagination.value = {
        page: result.meta?.page || 1,
        limit: result.meta?.limit || query.value.limit || 10,
        total: result.meta?.total || result.total || result.data?.length || 0,
        totalPages: result.meta?.totalPages || 0,
      };

      return {
        status: "success",
        message: result.message || "Projects fetched successfully",
        statusMessage: result.statusMessage,
      } as StoreResponse;
    } catch (error) {
      return {
        status: "error",
        message: toErrorMessage(error) || "Failed to fetch projects",
        statusMessage: "internal server error",
      } as StoreResponse;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchProjectById(id: string) {
    isLoading.value = true;

    try {
      const result = await apiRequest<Project>(`/projects/${id}`);
      project.value = result.data;

      return {
        status: "success",
        message: result.message || "Project fetched successfully",
        statusMessage: result.statusMessage,
      } as StoreResponse;
    } catch (error) {
      project.value = null;

      return {
        status: "error",
        message: toErrorMessage(error) || "Failed to fetch project",
        statusMessage: "internal server error",
      } as StoreResponse;
    } finally {
      isLoading.value = false;
    }
  }

  async function createProject(
    payload: CreateProjectPayload,
  ): Promise<StoreResponse<Project>> {
    isLoading.value = true;

    try {
      const result = await apiRequest<Project>("/projects", {
        method: "POST",
        body: payload,
      });

      if (result.data) {
        projects.value = [
          result.data,
          ...projects.value.filter((entry) => entry.id !== result.data?.id),
        ];
        totalProjects.value += 1;
      }

      return {
        status: "success",
        message: result.message || "Project created successfully",
        statusMessage: result.statusMessage || "created",
        data: result.data || null,
      };
    } catch (error) {
      return {
        status: "error",
        message: toErrorMessage(error) || "Failed to create project",
        statusMessage: "internal server error",
        data: null,
      };
    } finally {
      isLoading.value = false;
    }
  }

  async function updateProject(
    id: string,
    payload: UpdateProjectPayload,
  ): Promise<StoreResponse<Project>> {
    isLoading.value = true;

    try {
      const result = await apiRequest<Project>(`/projects/${id}`, {
        method: "PATCH",
        body: payload,
      });

      if (result.data) {
        syncProjectRecord(result.data);
      }

      return {
        status: "success",
        message: result.message || "Project updated successfully",
        statusMessage: result.statusMessage || "accepted",
        data: result.data || null,
      };
    } catch (error) {
      return {
        status: "error",
        message: toErrorMessage(error) || "Failed to update project",
        statusMessage: "internal server error",
        data: null,
      };
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteProject(id: string): Promise<StoreResponse> {
    isLoading.value = true;

    try {
      const { data: result, ok } = await apiRequestRaw<null>(`/projects/${id}`, {
        method: "DELETE",
      });

      if (!ok || (result && result.status === "error")) {
        throw new Error(result?.message || "Failed to delete project");
      }

      projects.value = projects.value.filter((entry) => entry.id !== id);
      totalProjects.value = Math.max(0, totalProjects.value - 1);

      if (project.value?.id === id) {
        project.value = null;
      }

      return {
        status: "success",
        message: result?.message || "Project deleted successfully",
        statusMessage: result?.statusMessage || "no content",
      };
    } catch (error) {
      return {
        status: "error",
        message: toErrorMessage(error) || "Failed to delete project",
        statusMessage: "internal server error",
      };
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchProjectItems(projectId: string) {
    isLoading.value = true;

    try {
      const result = await apiRequest<ProjectItem[]>(`/projects/${projectId}/items`);
      projectItems.value = result.data || [];

      return {
        status: "success",
        message: result.message || "Project items fetched successfully",
        statusMessage: result.statusMessage,
      } as StoreResponse;
    } catch (error) {
      projectItems.value = [];

      return {
        status: "error",
        message: toErrorMessage(error) || "Failed to fetch project items",
        statusMessage: "internal server error",
      } as StoreResponse;
    } finally {
      isLoading.value = false;
    }
  }

  async function addProjectItem(
    projectId: string,
    payload: CreateProjectItemPayload,
  ): Promise<StoreResponse<ProjectItem>> {
    isLoading.value = true;

    try {
      const result = await apiRequest<ProjectItem>(`/projects/${projectId}/items`, {
        method: "POST",
        body: payload,
      });

      if (result.data) {
        projectItems.value = [
          result.data,
          ...projectItems.value.filter((entry) => entry.id !== result.data?.id),
        ];
      }

      return {
        status: "success",
        message: result.message || "Project item created successfully",
        statusMessage: result.statusMessage || "created",
        data: result.data || null,
      };
    } catch (error) {
      return {
        status: "error",
        message: toErrorMessage(error) || "Failed to add project item",
        statusMessage: "internal server error",
        data: null,
      };
    } finally {
      isLoading.value = false;
    }
  }

  async function updateProjectItem(
    projectId: string,
    itemId: string,
    payload: UpdateProjectItemPayload,
  ): Promise<StoreResponse<ProjectItem>> {
    isLoading.value = true;

    try {
      const result = await apiRequest<ProjectItem>(
        `/projects/${projectId}/items/${itemId}`,
        {
          method: "PATCH",
          body: payload,
        },
      );

      if (result.data) {
        projectItems.value = projectItems.value.map((entry) =>
          entry.id === result.data?.id ? result.data : entry,
        );
      }

      return {
        status: "success",
        message: result.message || "Project item updated successfully",
        statusMessage: result.statusMessage || "accepted",
        data: result.data || null,
      };
    } catch (error) {
      return {
        status: "error",
        message: toErrorMessage(error) || "Failed to update project item",
        statusMessage: "internal server error",
        data: null,
      };
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteProjectItem(
    projectId: string,
    itemId: string,
  ): Promise<StoreResponse> {
    isLoading.value = true;

    try {
      const { data: result, ok } = await apiRequestRaw<null>(
        `/projects/${projectId}/items/${itemId}`,
        {
          method: "DELETE",
        },
      );

      if (!ok || (result && result.status === "error")) {
        throw new Error(result?.message || "Failed to delete project item");
      }

      projectItems.value = projectItems.value.filter((entry) => entry.id !== itemId);

      return {
        status: "success",
        message: result?.message || "Project item deleted successfully",
        statusMessage: result?.statusMessage || "no content",
      };
    } catch (error) {
      return {
        status: "error",
        message: toErrorMessage(error) || "Failed to delete project item",
        statusMessage: "internal server error",
      };
    } finally {
      isLoading.value = false;
    }
  }

  async function checkoutProject(projectId: string): Promise<StoreResponse<Order>> {
    isLoading.value = true;

    try {
      const result = await apiRequest<Order>(`/projects/${projectId}/checkout`, {
        method: "POST",
      });

      return {
        status: "success",
        message: result.message || "Project checkout completed successfully",
        statusMessage: result.statusMessage || "created",
        data: result.data || null,
      };
    } catch (error) {
      return {
        status: "error",
        message: toErrorMessage(error) || "Failed to checkout project",
        statusMessage: "internal server error",
        data: null,
      };
    } finally {
      isLoading.value = false;
    }
  }

  return {
    projects,
    project,
    projectItems,
    totalProjects,
    isLoading,
    query,
    pagination,
    fetchProjects,
    fetchProjectById,
    createProject,
    updateProject,
    deleteProject,
    fetchProjectItems,
    addProjectItem,
    updateProjectItem,
    deleteProjectItem,
    checkoutProject,
  };
});
