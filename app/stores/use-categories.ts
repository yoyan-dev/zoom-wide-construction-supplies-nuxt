import { defineStore } from "pinia";
import { ref } from "vue";
import type {
  Category,
  CategoryPagination,
  FetchCategoryParams,
} from "~/types/category";
import type { H3Response } from "~/types/h3Response";
import { categories as seedCategories } from "~/seeds/categories";
import { downloadText } from "~/utils/documents";

type CategoryMeta = {
  status?: "active" | "inactive" | "archived";
  parent_id?: string | null;
};

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
  message: err instanceof Error ? err.message : "Unknown error",
});

export const useCategoryStore = defineStore("categories", () => {
  const error = ref<Error | null>(null);
  const category = ref<Category | null>(null);
  const isLoading = ref(false);

  const allCategories = ref<Category[]>([...seedCategories]);
  const categories = ref<Category[]>([]);
  const categoryMeta = ref<Record<string, CategoryMeta>>({});

  const query = ref<FetchCategoryParams>({
    q: "",
    page: 1,
  });

  const pagination = ref<CategoryPagination>({
    page: 1,
    limit: seedCategories.length,
    total: 0,
    total_pages: 0,
  });

  const fetchCategories = async (): Promise<H3Response<Category[]>> => {
    try {
      isLoading.value = true;

      let filtered = [...allCategories.value];

      const term = query.value.q?.trim().toLowerCase();
      if (term) {
        filtered = filtered.filter((c) =>
          [c.id, c.name, c.description ?? "", c.image_url ?? ""]
            .join(" ")
            .toLowerCase()
            .includes(term),
        );
      }

      const start = (query.value.page! - 1) * pagination.value.limit!;
      const end = start + pagination.value.limit!;

      pagination.value.total = filtered.length;
      pagination.value.total_pages = Math.ceil(
        filtered.length / pagination.value.limit!,
      );
      pagination.value.page = query.value.page;

      categories.value = filtered.slice(start, end);
      return buildOkResponse(categories.value, pagination.value.total);
    } catch (err: any) {
      error.value = err;
      return buildErrorResponse<Category[]>(err);
    } finally {
      isLoading.value = false;
    }
  };

  const fetchCategoryById = async (
    id: string,
  ): Promise<H3Response<Category | null>> => {
    try {
      const found = allCategories.value.find((c) => c.id === id);

      if (!found) {
        category.value = null;
        return buildOkResponse(null, 0);
      }

      category.value = found;
      return buildOkResponse(category.value, 1);
    } catch (err: any) {
      error.value = err;
      return buildErrorResponse<Category | null>(err);
    }
  };

  const createCategory = async (
    payload: Omit<Category, "id" | "created_at" | "updated_at">,
  ): Promise<H3Response<Category>> => {
    try {
      isLoading.value = true;
      const now = new Date().toISOString();
      const created: Category = {
        ...payload,
        id: `cat-${Date.now()}`,
        created_at: now,
        updated_at: now,
      };

      allCategories.value = [created, ...allCategories.value];
      await fetchCategories();

      return buildOkResponse(created, 1);
    } catch (err: any) {
      error.value = err;
      return buildErrorResponse<Category>(err);
    } finally {
      isLoading.value = false;
    }
  };

  const updateCategory = async (
    id: string,
    payload: Partial<Category>,
  ): Promise<H3Response<Category | null>> => {
    try {
      isLoading.value = true;
      const index = allCategories.value.findIndex((c) => c.id === id);

      if (index === -1) {
        return buildOkResponse(null, 0);
      }

      const updated: Category = {
        ...allCategories.value[index],
        ...payload,
        id,
        updated_at: new Date().toISOString(),
      };

      allCategories.value.splice(index, 1, updated);

      if (category.value?.id === id) {
        category.value = updated;
      }

      await fetchCategories();

      return buildOkResponse(updated, 1);
    } catch (err: any) {
      error.value = err;
      return buildErrorResponse<Category | null>(err);
    } finally {
      isLoading.value = false;
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
      isLoading.value = true;
      const current = allCategories.value.find((item) => item.id === id);
      if (!current) return buildOkResponse(null, 0);

      const now = new Date().toISOString();
      const duplicated: Category = {
        ...current,
        id: `cat-${Date.now()}`,
        name: `${current.name} (Copy)`,
        created_at: now,
        updated_at: now,
      };

      allCategories.value = [duplicated, ...allCategories.value];
      await fetchCategories();

      return buildOkResponse(duplicated, 1);
    } catch (err: any) {
      error.value = err;
      return buildErrorResponse<Category | null>(err);
    } finally {
      isLoading.value = false;
    }
  };

  const exportCategory = (id: string) => {
    const current = allCategories.value.find((item) => item.id === id);
    if (!current) return;
    const payload = JSON.stringify(current, null, 2);
    downloadText(`category-${id}.json`, payload, "application/json");
  };

  const deleteCategory = async (id: string): Promise<H3Response<null>> => {
    try {
      isLoading.value = true;
      allCategories.value = allCategories.value.filter((c) => c.id !== id);

      if (category.value?.id === id) {
        category.value = null;
      }

      await fetchCategories();

      return buildOkResponse(null, 1);
    } catch (err: any) {
      error.value = err;
      return buildErrorResponse<null>(err);
    } finally {
      isLoading.value = false;
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
