import { ref } from "vue";
import { defineStore } from "pinia";
import type {
  CreateUserPayload,
  FetchUserParams,
  UpdateUserPayload,
  User,
} from "~/types/user";
import type { PaginationMeta } from "~/types/pagination";
import type { StoreResponse } from "~/types/store-response";
import { apiRequest, apiRequestRaw } from "~/utils/api";

export const useUserStore = defineStore("users", () => {
  const users = ref<User[]>([]);
  const user = ref<User | null>(null);
  const totalUsers = ref(0);
  const isLoading = ref(false);

  const query = ref<FetchUserParams>({
    q: "",
    page: 1,
    limit: 10,
  });

  const pagination = ref<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const syncUserRecord = (nextUser: User) => {
    user.value = nextUser;
    users.value = users.value.map((entry) =>
      entry.id === nextUser.id ? nextUser : entry,
    );
  };

  async function fetchUsers(params?: FetchUserParams) {
    isLoading.value = true;

    try {
      if (params) {
        query.value = {
          ...query.value,
          ...params,
        };
      }

      const result = await apiRequest<User[]>("/users", {
        query: query.value,
      });

      users.value = result.data || [];
      totalUsers.value = result.total || result.meta?.total || 0;

      pagination.value = {
        page: result.meta?.page || 1,
        limit: result.meta?.limit || query.value.limit || 10,
        total: result.meta?.total || result.total || 0,
        totalPages: result.meta?.totalPages || 0,
      };

      return {
        status: "success",
        message: result.message || "Users fetched successfully",
        statusMessage: result.statusMessage,
      } as StoreResponse;
    } catch (error) {
      console.error("Error fetching users:", error);
      return {
        status: "error",
        message: error instanceof Error ? error.message : "Failed to fetch users",
        statusMessage: "internal server error",
      } as StoreResponse;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchUserById(id: string) {
    isLoading.value = true;

    try {
      const result = await apiRequest<User>(`/users/${id}`);

      user.value = result.data;

      return {
        status: "success",
        message: result.message || "User fetched successfully",
        statusMessage: result.statusMessage,
      } as StoreResponse;
    } catch (error) {
      console.error("Error fetching user:", error);
      user.value = null;

      return {
        status: "error",
        message: error instanceof Error ? error.message : "Failed to fetch user",
        statusMessage: "internal server error",
      } as StoreResponse;
    } finally {
      isLoading.value = false;
    }
  }

  async function addUser(payload: CreateUserPayload): Promise<StoreResponse<User>> {
    isLoading.value = true;

    try {
      const result = await apiRequest<User>("/users", {
        method: "POST",
        body: payload,
      });

      if (result.data) {
        users.value = [result.data, ...users.value.filter((entry) => entry.id !== result.data?.id)];
        totalUsers.value += 1;
      }

      return {
        status: "success",
        message: result.message || "User created successfully",
        statusMessage: result.statusMessage || "created",
        data: result.data || null,
      };
    } catch (error) {
      console.error("Error adding user:", error);
      return {
        status: "error",
        message: error instanceof Error ? error.message : "Failed to add user",
        statusMessage: "internal server error",
        data: null,
      };
    } finally {
      isLoading.value = false;
    }
  }

  async function updateUser(
    id: string,
    payload: UpdateUserPayload,
  ): Promise<StoreResponse<User>> {
    isLoading.value = true;

    try {
      const result = await apiRequest<User>(`/users/${id}`, {
        method: "PATCH",
        body: payload,
      });

      if (result.data) {
        syncUserRecord(result.data);
      }

      return {
        status: "success",
        message: result.message || "User updated successfully",
        statusMessage: result.statusMessage || "accepted",
        data: result.data || null,
      };
    } catch (error) {
      console.error("Error updating user:", error);
      return {
        status: "error",
        message: error instanceof Error ? error.message : "Failed to update user",
        statusMessage: "internal server error",
        data: null,
      };
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteUser(id: string): Promise<StoreResponse> {
    isLoading.value = true;

    try {
      const { data: result, ok } = await apiRequestRaw<null>(`/users/${id}`, {
        method: "DELETE",
      });

      if (!ok || (result && result.status === "error")) {
        throw new Error(result?.message || "Failed to delete user");
      }

      users.value = users.value.filter((entry) => entry.id !== id);
      totalUsers.value = Math.max(0, totalUsers.value - 1);

      if (user.value?.id === id) {
        user.value = null;
      }

      return {
        status: "success",
        message: result?.message || "User deleted successfully",
        statusMessage: result?.statusMessage || "no content",
      };
    } catch (error) {
      console.error("Error deleting user:", error);
      return {
        status: "error",
        message: error instanceof Error ? error.message : "Failed to delete user",
        statusMessage: "internal server error",
      };
    } finally {
      isLoading.value = false;
    }
  }

  return {
    users,
    user,
    totalUsers,
    isLoading,
    query,
    pagination,
    fetchUsers,
    fetchUserById,
    addUser,
    updateUser,
    deleteUser,
  };
});
