import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type { Product } from "~/types/product";

export type BuyerCartItem = {
  product_id: string;
  name: string;
  price: number;
  unit: string;
  image_url: string | null;
  quantity: number;
};

export const useCartStore = defineStore("cart", () => {
  const items = ref<BuyerCartItem[]>([]);

  const itemCount = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0),
  );

  const subtotal = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0),
  );

  const addToCart = (product: Product, quantity = 1) => {
    const productId = product.id ?? "";
    if (!productId || quantity <= 0) return;

    const index = items.value.findIndex((item) => item.product_id === productId);
    if (index === -1) {
      items.value = [
        {
          product_id: productId,
          name: product.name ?? "Product",
          price: product.price ?? 0,
          unit: product.unit ?? "unit",
          image_url: product.image_url ?? null,
          quantity,
        },
        ...items.value,
      ];
      return;
    }

    const current = items.value[index];
    const next = [...items.value];
    next[index] = {
      ...current,
      quantity: current.quantity + quantity,
    };
    items.value = next;
  };

  const removeFromCart = (productId: string) => {
    items.value = items.value.filter((item) => item.product_id !== productId);
  };

  const setQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const index = items.value.findIndex((item) => item.product_id === productId);
    if (index === -1) return;

    const current = items.value[index];
    const next = [...items.value];
    next[index] = {
      ...current,
      quantity,
    };
    items.value = next;
  };

  const clearCart = () => {
    items.value = [];
  };

  return {
    items,
    itemCount,
    subtotal,
    addToCart,
    removeFromCart,
    setQuantity,
    clearCart,
  };
});
