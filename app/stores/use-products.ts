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
import { downloadText, printText } from "~/utils/documents";

type ProductMeta = {
  archived?: boolean;
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

export const useProductStore = defineStore("products", () => {
  const error = ref<Error | null>(null);
  const product = ref<Product | null>(null);
  const isLoading = ref(false);

  const allProducts = ref<Product[]>([...seedProducts]);
  const products = ref<Product[]>([]);
  const productMeta = ref<Record<string, ProductMeta>>({});

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

  const adjustProductStock = async (
    id: string,
    delta: number,
  ): Promise<H3Response<Product | null>> => {
    const current = allProducts.value.find((item) => item.id === id);
    if (!current) return buildOkResponse(null, 0);
    const nextQuantity = Math.max((current.stock_quantity ?? 0) + delta, 0);
    return await updateProduct(id, { stock_quantity: nextQuantity });
  };

  const setProductArchived = (id: string, archived: boolean) => {
    productMeta.value = {
      ...productMeta.value,
      [id]: {
        ...(productMeta.value[id] ?? {}),
        archived,
      },
    };
  };

  const duplicateProduct = async (
    id: string,
  ): Promise<H3Response<Product | null>> => {
    try {
      isLoading.value = true;
      const current = allProducts.value.find((item) => item.id === id);
      if (!current) return buildOkResponse(null, 0);

      const now = new Date().toISOString();
      const duplicated: Product = {
        ...current,
        id: `prod-${Date.now()}`,
        name: `${current.name ?? "Product"} (Copy)`,
        created_at: now,
        updated_at: now,
      };

      allProducts.value = [duplicated, ...allProducts.value];
      await fetchProducts();

      return buildOkResponse(duplicated, 1);
    } catch (err: any) {
      error.value = err;
      return buildErrorResponse<Product | null>(err);
    } finally {
      isLoading.value = false;
    }
  };

  const exportProduct = (id: string) => {
    const current = allProducts.value.find((item) => item.id === id);
    if (!current) return;
    const payload = JSON.stringify(current, null, 2);
    downloadText(`product-${id}.json`, payload, "application/json");
  };

  const printProductSheet = (id: string) => {
    const current = allProducts.value.find((item) => item.id === id);
    if (!current) return;
    const content = [
      `Product ${current.id}`,
      `Name: ${current.name ?? ""}`,
      `SKU: ${current.sku ?? ""}`,
      `Price: ${current.price ?? 0}`,
      `Stock: ${current.stock_quantity ?? 0}`,
      `Minimum stock: ${current.minimum_stock_quantity ?? 0}`,
      `Status: ${current.is_active ? "Active" : "Inactive"}`,
    ].join("\n");
    printText(`Product ${id} sheet`, content);
  };

  const downloadProductSheet = (id: string) => {
    const current = allProducts.value.find((item) => item.id === id);
    if (!current) return;
    const content = [
      `Product ${current.id}`,
      `Name: ${current.name ?? ""}`,
      `SKU: ${current.sku ?? ""}`,
      `Price: ${current.price ?? 0}`,
      `Stock: ${current.stock_quantity ?? 0}`,
      `Minimum stock: ${current.minimum_stock_quantity ?? 0}`,
      `Status: ${current.is_active ? "Active" : "Inactive"}`,
    ].join("\n");
    downloadText(`product-${id}.txt`, content, "text/plain");
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
    productMeta,
    query,
    pagination,
    isLoading,
    error,
    fetchProducts,
    fetchProductById,
    createProduct,
    updateProduct,
    adjustProductStock,
    deleteProduct,
    setProductArchived,
    duplicateProduct,
    exportProduct,
    printProductSheet,
    downloadProductSheet,
    setSearch,
    setFilter,
    setPage,
  };
});
