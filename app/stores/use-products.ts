import { defineStore } from "pinia";
import type { Product } from "~/types/product";
import { ref } from "vue";
import { useFetch } from "@vueuse/core";

export const useProductStore = defineStore("products", () => {
  const error = ref<Error | null>(null);
  const products = ref<Product[]>([]);

  const {
    data,
    error: fetchError,
    isFetching,
    execute,
  } = useFetch<Product[]>("/api/products", {
    immediate: false,
  })
    .get()
    .json();

  const fetchProducts = async () => {
    error.value = null;

    await execute();

    if (fetchError.value) {
      error.value =
        fetchError.value instanceof Error
          ? fetchError.value
          : new Error("Failed to fetch products");
      products.value = [];
      return;
    }

    products.value = Array.isArray(data.value) ? data.value : [];
    console.log(data.value);
  };

  return {
    products,
    isLoading: isFetching,
    error,
    fetchProducts,
  };
});
