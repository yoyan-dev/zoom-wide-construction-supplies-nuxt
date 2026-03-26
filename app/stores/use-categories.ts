import { ref } from "vue";
import { defineStore } from "pinia";
import type { FetchCategoryParams, Category } from "~/types/category";
import type { PaginationMeta } from "~/types/pagination";
import type { StoreResponse } from "~/types/store-response";
import { apiRequest, apiRequestRaw } from "~/utils/api";

export const useCategoryStore = defineStore("categories", () => {
  const categories = ref<Category[]>([]);
  const category = ref<Category | null>(null);
  const totalCategories = ref(0);
  const isLoading = ref(false);

  const query = ref<FetchCategoryParams>({
    q: "",
    page: 1,
  });

  const pagination = ref<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  async function fetchCategories(params?: FetchCategoryParams) {
    isLoading.value = true;

    try {
      if (params) {
        query.value = {
          ...query.value,
          ...params,
        };
      }

      const result = await apiRequest<Category[]>("/categories", {
        query: query.value,
      });

      categories.value = result.data || [];
      totalCategories.value = result.total || result.meta?.total || 0;

      pagination.value = {
        page: result.meta?.page || 1,
        limit: result.meta?.limit || 10,
        total: result.meta?.total || result.total || 0,
        totalPages: result.meta?.totalPages || 0,
      };

      return {
        status: "success",
        message: result.message || "Categories fetched successfully",
        statusMessage: result.statusMessage,
      } as StoreResponse;
    } catch (error) {
      console.error("Error fetching categories:", error);
      return {
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to fetch categories",
        statusMessage: "internal server error",
      } as StoreResponse;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchCategoryById(id: string) {
    isLoading.value = true;

    try {
      const result = await apiRequest<Category>(`/categories/${id}`);

      category.value = result.data;

      return {
        status: "success",
        message: result.message || "Category fetched successfully",
        statusMessage: result.statusMessage,
      } as StoreResponse;
    } catch (error) {
      console.error("Error fetching category:", error);
      category.value = null;

      return {
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to fetch category",
        statusMessage: "internal server error",
      } as StoreResponse;
    } finally {
      isLoading.value = false;
    }
  }

  async function addCategory(payload: FormData): Promise<StoreResponse> {
    isLoading.value = true;

    try {
      const result = await apiRequest<Category>("/categories", {
        method: "POST",
        body: payload,
      });

      await fetchCategories();

      return {
        status: "success",
        message: result.message || "Category created successfully",
        statusMessage: result.statusMessage || "created",
      };
    } catch (error) {
      console.error("Error adding category:", error);
      return {
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to add category",
        statusMessage: "internal server error",
      };
    } finally {
      isLoading.value = false;
    }
  }

  async function updateCategory(
    id: string,
    payload: Partial<Omit<Category, "id" | "created_at" | "updated_at">>,
  ): Promise<StoreResponse> {
    isLoading.value = true;

    try {
      const result = await apiRequest<Category>(`/categories/${id}`, {
        method: "PATCH",
        body: payload,
      });

      category.value = result.data || category.value;
      await fetchCategories();

      return {
        status: "success",
        message: result.message || "Category updated successfully",
        statusMessage: result.statusMessage || "accepted",
      };
    } catch (error) {
      console.error("Error updating category:", error);
      return {
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to update category",
        statusMessage: "internal server error",
      };
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteCategory(id: string): Promise<StoreResponse> {
    isLoading.value = true;

    try {
      const { data: result, ok } = await apiRequestRaw<null>(
        `/categories/${id}`,
        {
          method: "DELETE",
        },
      );

      if (!ok || (result && result.status === "error")) {
        throw new Error(result?.message || "Failed to delete category");
      }

      categories.value = categories.value.filter((item) => item.id !== id);
      totalCategories.value = Math.max(0, totalCategories.value - 1);

      return {
        status: "success",
        message: result?.message || "Category deleted successfully",
        statusMessage: result?.statusMessage || "no content",
      };
    } catch (error) {
      console.error("Error deleting category:", error);
      return {
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to delete category",
        statusMessage: "internal server error",
      };
    } finally {
      isLoading.value = false;
    }
  }

  return {
    categories,
    category,
    totalCategories,
    isLoading,
    query,
    pagination,
    fetchCategories,
    fetchCategoryById,
    addCategory,
    updateCategory,
    deleteCategory,
  };
});
