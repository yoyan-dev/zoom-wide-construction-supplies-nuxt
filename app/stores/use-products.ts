import { defineStore } from "pinia";
import type {
  Product,
  FetchProductParams,
  ProductPaginaton,
} from "~/types/product";
import type { H3Response } from "~/types/h3Response";
import { ref } from "vue";

import { products as seedProducts } from "~/seeds/products";
import { categories } from "~/seeds/categories";
import { suppliers } from "~/seeds/suppliers";

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

export const useProductStore = defineStore("products", () => {
  const error = ref<Error | null>(null);
  const product = ref<Product | null>(null);
  const isLoading = ref(false);

  const allProducts = ref<Product[]>([...seedProducts]);
  const products = ref<Product[]>([]);

  const query = ref<FetchProductParams>({
    q: "",
    category_id: "",
    supplier_id: "",
    page: 1,
  });

  const pagination = ref<ProductPaginaton>({
    page: 1,
    limit: seedProducts.length,
    total: 0,
    total_pages: 0,
  });

  const attachRelations = (items: Product[]): Product[] => {
    return items.map((p) => ({
      ...p,
      category: categories.find((c) => c.id === p.category_id),
      supplier: suppliers.find((s) => s.id === p.supplier_id) || undefined,
    }));
  };

  const fetchProducts = async (): Promise<H3Response<Product[]>> => {
    try {
      isLoading.value = true;

      let filtered = [...allProducts.value];

      // search
      const term = query.value.q?.trim().toLowerCase();
      if (term) {
        filtered = filtered.filter((p) => {
          const supplierName = p.supplier_id
            ? suppliers.find((s) => s.id === p.supplier_id)?.name ?? ""
            : "";
          return [p.name ?? "", p.sku ?? "", supplierName]
            .join(" ")
            .toLowerCase()
            .includes(term);
        });
      }

      // category filter
      if (query.value.category_id) {
        filtered = filtered.filter(
          (p) => p.category_id === query.value.category_id,
        );
      }

      // supplier filter
      if (query.value.supplier_id) {
        filtered = filtered.filter(
          (p) => p.supplier_id === query.value.supplier_id,
        );
      }

      // pagination
      const start = (query.value.page! - 1) * pagination.value.limit!;
      const end = start + pagination.value.limit!;

      pagination.value.total = filtered.length;
      pagination.value.total_pages = Math.ceil(
        filtered.length / pagination.value.limit!,
      );
      pagination.value.page = query.value.page;

      const paginated = filtered.slice(start, end);

      products.value = attachRelations(paginated);
      return buildOkResponse(products.value, pagination.value.total);
    } catch (err: any) {
      error.value = err;
      return buildErrorResponse<Product[]>(err);
    } finally {
      isLoading.value = false;
    }
  };

  const fetchProductById = async (
    id: string,
  ): Promise<H3Response<Product | null>> => {
    try {
      const found = allProducts.value.find((p) => p.id === id);

      if (!found) {
        product.value = null;
        return buildOkResponse(null, 0);
      }

      product.value = {
        ...found,
        category: categories.find((c) => c.id === found.category_id),
        supplier: suppliers.find((s) => s.id === found.supplier_id),
      };

      return buildOkResponse(product.value, 1);
    } catch (err: any) {
      error.value = err;
      return buildErrorResponse<Product | null>(err);
    }
  };

  const createProduct = async (
    payload: Omit<Product, "id" | "created_at" | "updated_at">,
  ): Promise<H3Response<Product>> => {
    try {
      isLoading.value = true;
      const now = new Date().toISOString();
      const created: Product = {
        ...payload,
        id: `prod-${Date.now()}`,
        created_at: now,
        updated_at: now,
      };

      allProducts.value = [created, ...allProducts.value];
      await fetchProducts();

      return buildOkResponse(created, 1);
    } catch (err: any) {
      error.value = err;
      return buildErrorResponse<Product>(err);
    } finally {
      isLoading.value = false;
    }
  };

  const updateProduct = async (
    id: string,
    payload: Partial<Product>,
  ): Promise<H3Response<Product | null>> => {
    try {
      isLoading.value = true;
      const index = allProducts.value.findIndex((p) => p.id === id);

      if (index === -1) {
        return buildOkResponse(null, 0);
      }

      const updated: Product = {
        ...allProducts.value[index],
        ...payload,
        id,
        updated_at: new Date().toISOString(),
      };

      allProducts.value.splice(index, 1, updated);

      if (product.value?.id === id) {
        product.value = updated;
      }

      await fetchProducts();

      return buildOkResponse(updated, 1);
    } catch (err: any) {
      error.value = err;
      return buildErrorResponse<Product | null>(err);
    } finally {
      isLoading.value = false;
    }
  };

  const deleteProduct = async (id: string): Promise<H3Response<null>> => {
    try {
      isLoading.value = true;
      allProducts.value = allProducts.value.filter((p) => p.id !== id);

      if (product.value?.id === id) {
        product.value = null;
      }

      await fetchProducts();

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
    await fetchProducts();
  };

  const setFilter = async (filters: Partial<FetchProductParams>) => {
    query.value = {
      ...query.value,
      ...filters,
      page: 1,
    };

    await fetchProducts();
  };

  const setPage = async (page: number) => {
    query.value.page = page;
    await fetchProducts();
  };

  return {
    product,
    products,
    query,
    pagination,
    isLoading,
    error,
    fetchProducts,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    setSearch,
    setFilter,
    setPage,
  };
});
