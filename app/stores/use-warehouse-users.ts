import { defineStore } from "pinia";
import { ref } from "vue";
import type { User } from "~/types/user";
import type { H3Response } from "~/types/h3Response";
import { warehouseUsers, warehouseUserAssignments } from "~/seeds/warehouse-users";
import { toErrorMessage } from "~/utils/api";

const buildOkResponse = <T>(data: T, total?: number): H3Response<T> => ({
  status: "ok",
  statusCode: 200,
  statusMessage: "ok",
  data,
  total,
});

const buildErrorResponse = <T>(err: unknown): H3Response<T> => ({
  status: "error",
  statusCode: 500,
  statusMessage: "internal server error",
  message: toErrorMessage(err),
});

export const useWarehouseUsersStore = defineStore("warehouseUsers", () => {
  const error = ref<string | null>(null);
  const isLoading = ref(false);

  const allUsers = ref<User[]>([...warehouseUsers]);
  const users = ref<User[]>([]);
  const assignments = ref<Record<string, string[]>>({
    ...warehouseUserAssignments,
  });

  const query = ref({ q: "" });

  const fetchUsers = async (): Promise<H3Response<User[]>> => {
    try {
      isLoading.value = true;
      let filtered = [...allUsers.value];

      if (query.value.q) {
        const term = query.value.q.toLowerCase();
        filtered = filtered.filter((user) => {
          return [user.full_name, user.email, user.role]
            .join(" ")
            .toLowerCase()
            .includes(term);
        });
      }

      users.value = filtered;
      return buildOkResponse(users.value, users.value.length);
    } catch (err: any) {
      error.value = toErrorMessage(err);
      return buildErrorResponse<User[]>(err);
    } finally {
      isLoading.value = false;
    }
  };

  const setSearch = async (value: string) => {
    query.value.q = value;
    return await fetchUsers();
  };

  const updateUser = async (id: string, payload: Partial<User>) => {
    const next = allUsers.value.map((user) =>
      user.id === id ? { ...user, ...payload } : user,
    );
    allUsers.value = next;
    await fetchUsers();
  };

  const updateAssignments = (id: string, warehouses: string[]) => {
    assignments.value = {
      ...assignments.value,
      [id]: warehouses,
    };
  };

  const deleteUser = async (id: string) => {
    allUsers.value = allUsers.value.filter((user) => user.id !== id);
    const next = { ...assignments.value };
    delete next[id];
    assignments.value = next;
    await fetchUsers();
  };

  return {
    users,
    assignments,
    query,
    isLoading,
    error,
    fetchUsers,
    setSearch,
    updateUser,
    updateAssignments,
    deleteUser,
  };
});
