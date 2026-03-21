import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type {
  Category,
  CategoryPagination,
  FetchCategoryParams,
} from "~/types/category";
import type { H3Response } from "~/types/h3Response";
import { downloadText } from "~/utils/documents";
import {
  apiRequest,
  buildErrorResponse,
  buildOkResponse,
  DEFAULT_API_PAGE_LIMIT,
  getTotalPages,
  toErrorMessage,
} from "~/utils/api";

type CategoryMeta = {
  status?: "active" | "inactive" | "archived";
  parent_id?: string | null;
};

export const useCategoryStore = defineStore("categories", () => {
  const error = ref<string | null>(null);
  const category = ref<Category | null>(null);

  const allCategories = ref<Category[]>([]);
  const categories = ref<Category[]>([]);
  const categoryMeta = ref<Record<string, CategoryMeta>>({});

  const query = ref<FetchCategoryParams>({
    q: "",
    page: 1,
  });

  const pagination = ref<CategoryPagination>({
    page: 1,
    limit: DEFAULT_API_PAGE_LIMIT,
    total: 0,
    total_pages: 0,
  });
  const isFetchingCategories = ref(false);
  const isFetchingCategory = ref(false);

  const isMutating = ref(false);
  const isLoading = computed(
    () =>
      isFetchingCategories.value ||
      isFetchingCategory.value ||
      isMutating.value,
  );

  const syncPagination = (total: number, limit: number) => {
    pagination.value = {
      page: query.value.page ?? 1,
      limit,
      total,
      total_pages: getTotalPages(total, limit),
    };
  };

  const setCachedCategory = (value: Category) => {
    const next = allCategories.value.filter((item) => item.id !== value.id);
    allCategories.value = [value, ...next];
  };

  const fetchCategories = async (): Promise<H3Response<Category[]>> => {
    try {
      error.value = null;
      isFetchingCategories.value = true;
      const limit = pagination.value.limit ?? DEFAULT_API_PAGE_LIMIT;
      const response = await apiRequest<Category[]>("/categories", {
        query: {
          q: query.value.q,
          page: query.value.page ?? 1,
          limit,
        },
      });
      const items = response.data ?? [];
      const total = response.total ?? items.length;

      allCategories.value = items;
      categories.value = items;
      syncPagination(total, limit);

      if (category.value?.id) {
        category.value =
          items.find((item) => item.id === category.value?.id) ??
          category.value;
      }

      return buildOkResponse(categories.value, total);
    } catch (err: unknown) {
      error.value = toErrorMessage(err);
      return buildErrorResponse<Category[]>(err);
    } finally {
      isFetchingCategories.value = false;
    }
  };

  const fetchCategoryById = async (
    id: string,
  ): Promise<H3Response<Category | null>> => {
    try {
      error.value = null;
      isFetchingCategory.value = true;
      const cached = allCategories.value.find((item) => item.id === id) ?? null;

      if (cached) {
        category.value = cached;
        return buildOkResponse(category.value, 1);
      }

      const response = await apiRequest<Category | null>(`/categories/${id}`);
      category.value = response.data ?? null;

      if (category.value) {
        setCachedCategory(category.value);
      }

      return buildOkResponse(category.value, category.value ? 1 : 0);
    } catch (err: unknown) {
      error.value = toErrorMessage(err);
      return buildErrorResponse<Category | null>(err);
    } finally {
      isFetchingCategory.value = false;
    }
  };

  const createCategory = async (
    payload: FormData | Omit<Category, "id" | "created_at" | "updated_at">,
  ): Promise<H3Response<Category>> => {
    try {
      error.value = null;
      isMutating.value = true;

      const response = await apiRequest<Category>("/categories", {
        method: "POST",
        body: payload,
      });
      const created = response.data as Category;

      setCachedCategory(created);
      category.value = created;
      await fetchCategories();

      return buildOkResponse(created, 1);
    } catch (err: unknown) {
      error.value = toErrorMessage(err);
      return buildErrorResponse<Category>(err);
    } finally {
      isMutating.value = false;
    }
  };

  const updateCategory = async (
    id: string,
    payload: Partial<Category>,
  ): Promise<H3Response<Category | null>> => {
    try {
      error.value = null;
      isMutating.value = true;

      const response = await apiRequest<Category | null>(`/categories/${id}`, {
        method: "PATCH",
        body: payload,
      });
      const updated = response.data ?? null;

      if (!updated) {
        return buildOkResponse(null, 0);
      }

      setCachedCategory(updated);

      if (category.value?.id === id) {
        category.value = updated;
      }

      await fetchCategories();

      return buildOkResponse(updated, 1);
    } catch (err: unknown) {
      error.value = toErrorMessage(err);
      return buildErrorResponse<Category | null>(err);
    } finally {
      isMutating.value = false;
    }
  };

  const setCategoryStatus = (id: string, status: CategoryMeta["status"]) => {
    categoryMeta.value = {
      ...categoryMeta.value,
      [id]: {
        ...(categoryMeta.value[id] ?? {}),
        status,
      },
    };
  };

  const changeCategoryParent = (id: string, parentId: string | null) => {
    categoryMeta.value = {
      ...categoryMeta.value,
      [id]: {
        ...(categoryMeta.value[id] ?? {}),
        parent_id: parentId,
      },
    };
  };

  const duplicateCategory = async (
    id: string,
  ): Promise<H3Response<Category | null>> => {
    try {
      const current = allCategories.value.find((item) => item.id === id);

      if (!current) {
        return buildOkResponse(null, 0);
      }

      const response = await createCategory({
        name: `${current.name} (Copy)`,
        description: current.description,
        image_url: current.image_url,
        overview: current.overview,
        typical_uses: current.typical_uses,
        buying_considerations: current.buying_considerations,
        featured_specs: current.featured_specs,
      });

      return buildOkResponse(response.data ?? null, response.total ?? 0);
    } catch (err: unknown) {
      error.value = toErrorMessage(err);
      return buildErrorResponse<Category | null>(err);
    }
  };

  const exportCategory = (id: string) => {
    const current =
      allCategories.value.find((item) => item.id === id) ??
      (category.value?.id === id ? category.value : null);
    if (!current) return;
    const payload = JSON.stringify(current, null, 2);
    downloadText(`category-${id}.json`, payload, "application/json");
  };

  const deleteCategory = async (id: string): Promise<H3Response<null>> => {
    try {
      error.value = null;
      isMutating.value = true;

      await apiRequest<null>(`/categories/${id}`, {
        method: "DELETE",
      });

      allCategories.value = allCategories.value.filter(
        (item) => item.id !== id,
      );
      categories.value = categories.value.filter((item) => item.id !== id);

      if (category.value?.id === id) {
        category.value = null;
      }

      await fetchCategories();

      return buildOkResponse(null, 1);
    } catch (err: unknown) {
      error.value = toErrorMessage(err);
      return buildErrorResponse<null>(err);
    } finally {
      isMutating.value = false;
    }
  };

  const setSearch = async (value: string) => {
    query.value.q = value;
    query.value.page = 1;
    return await fetchCategories();
  };

  const setPage = async (page: number) => {
    query.value.page = page;
    return await fetchCategories();
  };

  return {
    category,
    categories,
    categoryMeta,
    query,
    pagination,
    isLoading,
    error,
    fetchCategories,
    fetchCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    setCategoryStatus,
    changeCategoryParent,
    duplicateCategory,
    exportCategory,
    setSearch,
    setPage,
  };
});
