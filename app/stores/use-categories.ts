import { ref } from "vue";
import { defineStore } from "pinia";
import type { FetchCategoryParams, Category } from "~/types/category";
import type { H3Response } from "~/types/h3Response";
import type { PaginationMeta } from "~/types/pagination";
import type { StoreResponse } from "~/types/store-response";

const BASE_URL = import.meta.env.VITE_API_URL;

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

  function buildQueryString(params?: FetchCategoryParams) {
    const searchParams = new URLSearchParams();

    if (!params) return searchParams.toString();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });

    return searchParams.toString();
  }

  async function fetchCategories(params?: FetchCategoryParams) {
    isLoading.value = true;

    try {
      if (params) {
        query.value = {
          ...query.value,
          ...params,
        };
      }

      const queryString = buildQueryString(query.value);
      const response = await fetch(`${BASE_URL}/categories?${queryString}`);
      const result: H3Response<Category[]> = await response.json();

      if (!response.ok || result.status === "error") {
        throw new Error(result.message || "Failed to fetch categories");
      }

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
      const response = await fetch(`${BASE_URL}/categories/${id}`);
      const result: H3Response<Category> = await response.json();

      if (!response.ok || result.status === "error") {
        throw new Error(result.message || "Failed to fetch category");
      }

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
      const response = await fetch(`${BASE_URL}/categories`, {
        method: "POST",
        body: payload,
      });

      const result: H3Response<Category> = await response.json();

      if (!response.ok || result.status === "error") {
        throw new Error(result.message || "Failed to add category");
      }

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
    payload: Category,
  ): Promise<StoreResponse> {
    isLoading.value = true;

    try {
      const response = await fetch(`${BASE_URL}/categories/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result: H3Response<Category> = await response.json();

      if (!response.ok || result.status === "error") {
        throw new Error(result.message || "Failed to update category");
      }

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
      const response = await fetch(`${BASE_URL}/categories/${id}`, {
        method: "DELETE",
      });

      let result: H3Response<null> | null = null;

      if (response.status !== 204) {
        result = await response.json();
      }

      if (!response.ok || (result && result.status === "error")) {
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
