import { defineStore } from "pinia";
import { ref } from "vue";
import type {
  Category,
  CategoryPagination,
  FetchCategoryParams,
} from "~/types/category";
import type { H3Response } from "~/types/h3Response";
import { categories as seedCategories } from "~/seeds/categories";

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

      if (query.value.q) {
        filtered = filtered.filter((c) =>
          c.name?.toLowerCase().includes(query.value.q!.toLowerCase()),
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
    query,
    pagination,
    isLoading,
    error,
    fetchCategories,
    fetchCategoryById,
    setSearch,
    setPage,
  };
});
