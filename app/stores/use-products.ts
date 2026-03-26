import { ref } from "vue";
import { defineStore } from "pinia";
import type { PaginationMeta } from "~/types/pagination";
import type { StoreResponse } from "~/types/store-response";
import type { FetchProductParams, Product } from "~/types/product";
import { apiRequest, apiRequestRaw } from "~/utils/api";

export const useProductStore = defineStore("products", () => {
  const products = ref<Product[]>([]);
  const product = ref<Product | null>(null);
  const totalProducts = ref(0);
  const isLoading = ref(false);

  const query = ref<FetchProductParams>({
    q: "",
    page: 1,
  });

  const pagination = ref<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  async function fetchProducts(params?: FetchProductParams) {
    isLoading.value = true;

    try {
      if (params) {
        query.value = {
          ...query.value,
          ...params,
        };
      }

      const result = await apiRequest<Product[]>("/products", {
        query: query.value,
      });

      products.value = result.data || [];
      totalProducts.value = result.total || result.meta?.total || 0;

      pagination.value = {
        page: result.meta?.page || 1,
        limit: result.meta?.limit || 10,
        total: result.meta?.total || result.total || 0,
        totalPages: result.meta?.totalPages || 0,
      };

      return {
        status: "success",
        message: result.message || "Products fetched successfully",
        statusMessage: result.statusMessage,
      } as StoreResponse;
    } catch (error) {
      console.error("Error fetching products:", error);
      return {
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to fetch products",
        statusMessage: "internal server error",
      } as StoreResponse;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchProductById(id: string) {
    isLoading.value = true;

    try {
      const result = await apiRequest<Product>(`/products/${id}`);

      product.value = result.data;

      return {
        status: "success",
        message: result.message || "Product fetched successfully",
        statusMessage: result.statusMessage,
      } as StoreResponse;
    } catch (error) {
      console.error("Error fetching product:", error);
      product.value = null;

      return {
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to fetch product",
        statusMessage: "internal server error",
      } as StoreResponse;
    } finally {
      isLoading.value = false;
    }
  }

  async function addProduct(
    payload: FormData,
  ): Promise<StoreResponse<Product>> {
    isLoading.value = true;

    try {
      const result = await apiRequest<Product>("/products", {
        method: "POST",
        body: payload,
      });

      await fetchProducts();
      console.log("Product created successfully");
      return {
        status: "success",
        message: result.message || "Product created successfully",
        statusMessage: result.statusMessage || "created",
        data: result.data || null,
      };
    } catch (error) {
      console.error("Error adding product:", error);
      return {
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to add product",
        statusMessage: "internal server error",
        data: null,
      };
    } finally {
      isLoading.value = false;
    }
  }

  async function updateProduct(
    id: string,
    payload: FormData,
  ): Promise<StoreResponse<Product>> {
    isLoading.value = true;

    try {
      const result = await apiRequest<Product>(`/products/${id}`, {
        method: "PATCH",
        body: payload,
      });

      product.value = result.data || null;
      await fetchProducts();

      return {
        status: "success",
        message: result.message || "Product updated successfully",
        statusMessage: result.statusMessage || "accepted",
        data: result.data || null,
      };
    } catch (error) {
      console.error("Error updating product:", error);
      return {
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to update product",
        statusMessage: "internal server error",
        data: null,
      };
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteProduct(id: string): Promise<StoreResponse> {
    isLoading.value = true;

    try {
      const { data: result, ok } = await apiRequestRaw<null>(`/products/${id}`, {
        method: "DELETE",
      });

      if (!ok || (result && result.status === "error")) {
        throw new Error(result?.message || "Failed to delete product");
      }

      products.value = products.value.filter((item) => item.id !== id);
      totalProducts.value = Math.max(0, totalProducts.value - 1);

      return {
        status: "success",
        message: result?.message || "Product deleted successfully",
        statusMessage: result?.statusMessage || "no content",
      };
    } catch (error) {
      console.error("Error deleting product:", error);
      return {
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to delete product",
        statusMessage: "internal server error",
      };
    } finally {
      isLoading.value = false;
    }
  }

  return {
    products,
    product,
    totalProducts,
    isLoading,
    query,
    pagination,
    fetchProducts,
    fetchProductById,
    addProduct,
    updateProduct,
    deleteProduct,
  };
});
