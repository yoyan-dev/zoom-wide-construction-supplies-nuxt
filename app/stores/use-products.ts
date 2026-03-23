import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type {
  FetchProductParams,
  Product,
  ProductPaginaton,
} from "~/types/product";
import type { H3Response } from "~/types/h3Response";
import { downloadText, printText } from "~/utils/documents";
import {
  apiRequest,
  buildErrorResponse,
  buildOkResponse,
  DEFAULT_API_PAGE_LIMIT,
  getTotalPages,
  toErrorMessage,
} from "~/utils/api";

type ProductMeta = {
  archived?: boolean;
};

export const useProductStore = defineStore("products", () => {
  const error = ref<string | null>(null);
  const product = ref<Product | null>(null);

  const allProducts = ref<Product[]>([]);
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
    limit: DEFAULT_API_PAGE_LIMIT,
    total: 0,
    total_pages: 0,
  });
  const isFetchingProducts = ref(false);
  const isFetchingProduct = ref(false);

  const isMutating = ref(false);
  const isLoading = computed(
    () => isFetchingProducts.value || isFetchingProduct.value || isMutating.value,
  );

  const syncPagination = (total: number, limit: number) => {
    pagination.value = {
      page: query.value.page ?? 1,
      limit,
      total,
      total_pages: getTotalPages(total, limit),
    };
  };

  const setCachedProduct = (value: Product) => {
    if (!value.id) return;
    const next = allProducts.value.filter((item) => item.id !== value.id);
    allProducts.value = [value, ...next];
  };

  const findProductById = (id: string) =>
    allProducts.value.find((item) => item.id === id) ??
    products.value.find((item) => item.id === id) ??
    (product.value?.id === id ? product.value : null);

  const toProductPayload = (payload: Partial<Product>) => ({
    category_id: payload.category_id,
    supplier_id: payload.supplier_id,
    warehouse_id: payload.warehouse_id,
    sku: payload.sku,
    name: payload.name,
    description: payload.description,
    image_url: payload.image_url,
    unit: payload.unit,
    price: payload.price,
    stock_quantity: payload.stock_quantity,
    minimum_stock_quantity: payload.minimum_stock_quantity,
    handbook: payload.handbook,
    is_active: payload.is_active,
  });

  const fetchProducts = async (): Promise<H3Response<Product[]>> => {
    try {
      error.value = null;
      isFetchingProducts.value = true;
      const limit = pagination.value.limit ?? DEFAULT_API_PAGE_LIMIT;
      const response = await apiRequest<Product[]>("/products", {
        query: {
          q: query.value.q,
          category_id: query.value.category_id,
          supplier_id: query.value.supplier_id,
          page: query.value.page ?? 1,
          limit,
        },
      });
      const items = response.data ?? [];
      const total = response.total ?? items.length;

      allProducts.value = items;
      products.value = items;
      syncPagination(total, limit);

      if (product.value?.id) {
        product.value =
          items.find((item) => item.id === product.value?.id) ?? product.value;
      }

      return buildOkResponse(products.value, total);
    } catch (err: unknown) {
      error.value = toErrorMessage(err);
      return buildErrorResponse<Product[]>(err);
    } finally {
      isFetchingProducts.value = false;
    }
  };

  const fetchProductById = async (
    id: string,
  ): Promise<H3Response<Product | null>> => {
    try {
      error.value = null;
      isFetchingProduct.value = true;
      const cached = findProductById(id);

      if (cached) {
        product.value = cached;
        return buildOkResponse(product.value, 1);
      }

      const response = await apiRequest<Product | null>(`/products/${id}`);
      product.value = response.data ?? null;

      if (product.value) {
        setCachedProduct(product.value);
      }

      return buildOkResponse(product.value, product.value ? 1 : 0);
    } catch (err: unknown) {
      error.value = toErrorMessage(err);
      return buildErrorResponse<Product | null>(err);
    } finally {
      isFetchingProduct.value = false;
    }
  };

  const createProduct = async (
    payload: Omit<Product, "id" | "created_at" | "updated_at">,
  ): Promise<H3Response<Product>> => {
    try {
      error.value = null;
      isMutating.value = true;

      const response = await apiRequest<Product>("/products", {
        method: "POST",
        body: toProductPayload(payload),
      });
      const created = response.data as Product;

      setCachedProduct(created);
      product.value = created;
      await fetchProducts();

      return buildOkResponse(created, 1);
    } catch (err: unknown) {
      error.value = toErrorMessage(err);
      return buildErrorResponse<Product>(err);
    } finally {
      isMutating.value = false;
    }
  };

  const updateProduct = async (
    id: string,
    payload: Partial<Product>,
  ): Promise<H3Response<Product | null>> => {
    try {
      error.value = null;
      isMutating.value = true;

      const response = await apiRequest<Product | null>(`/products/${id}`, {
        method: "PATCH",
        body: toProductPayload(payload),
      });
      const updated = response.data ?? null;

      if (!updated) {
        return buildOkResponse(null, 0);
      }

      setCachedProduct(updated);

      if (product.value?.id === id) {
        product.value = updated;
      }

      await fetchProducts();

      return buildOkResponse(updated, 1);
    } catch (err: unknown) {
      error.value = toErrorMessage(err);
      return buildErrorResponse<Product | null>(err);
    } finally {
      isMutating.value = false;
    }
  };

  const adjustProductStock = async (
    id: string,
    delta: number,
  ): Promise<H3Response<Product | null>> => {
    const current = findProductById(id) ?? (await fetchProductById(id)).data ?? null;

    if (!current) {
      return buildOkResponse(null, 0);
    }

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
      const current = findProductById(id);

      if (!current) {
        return buildOkResponse(null, 0);
      }

      const response = await createProduct({
        category_id: current.category_id,
        supplier_id: current.supplier_id,
        warehouse_id: current.warehouse_id,
        sku: current.sku ? `${current.sku}-COPY` : undefined,
        name: `${current.name ?? "Product"} (Copy)`,
        description: current.description,
        image_url: current.image_url,
        unit: current.unit,
        price: current.price,
        stock_quantity: current.stock_quantity,
        minimum_stock_quantity: current.minimum_stock_quantity,
        category: undefined,
        supplier: undefined,
        warehouse: undefined,
        handbook: current.handbook,
        is_active: current.is_active,
      });

      return buildOkResponse(response.data ?? null, response.total ?? 0);
    } catch (err: unknown) {
      error.value = toErrorMessage(err);
      return buildErrorResponse<Product | null>(err);
    }
  };

  const exportProduct = (id: string) => {
    const current = findProductById(id);
    if (!current) return;
    const payload = JSON.stringify(current, null, 2);
    downloadText(`product-${id}.json`, payload, "application/json");
  };

  const printProductSheet = (id: string) => {
    const current = findProductById(id);
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
    const current = findProductById(id);
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
      error.value = null;
      isMutating.value = true;

      await apiRequest<null>(`/products/${id}`, {
        method: "DELETE",
      });

      allProducts.value = allProducts.value.filter((item) => item.id !== id);
      products.value = products.value.filter((item) => item.id !== id);

      if (product.value?.id === id) {
        product.value = null;
      }

      await fetchProducts();

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
    return await fetchProducts();
  };

  const setFilter = async (filters: Partial<FetchProductParams>) => {
    query.value = {
      ...query.value,
      ...filters,
      page: 1,
    };

    return await fetchProducts();
  };

  const setPage = async (page: number) => {
    query.value.page = page;
    return await fetchProducts();
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
