import { computed, ref, watch } from "vue";
import { defineStore } from "pinia";
import type { CartLineItem } from "~/types/cart";
import type { Product } from "~/types/product";

const STORAGE_KEY = "zoom-shop-cart";

const normalizeQuantity = (value: number) => Math.max(0, Math.floor(value));

const normalizeLineItem = (value: unknown): CartLineItem | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const item = value as Partial<CartLineItem>;

  if (
    typeof item.product_id !== "string" ||
    typeof item.name !== "string" ||
    typeof item.unit !== "string" ||
    typeof item.price !== "number" ||
    !Number.isFinite(item.price) ||
    typeof item.quantity !== "number"
  ) {
    return null;
  }

  const quantity = normalizeQuantity(item.quantity);

  if (!quantity) {
    return null;
  }

  return {
    product_id: item.product_id,
    sku: typeof item.sku === "string" ? item.sku : null,
    category_id: typeof item.category_id === "string" ? item.category_id : null,
    name: item.name,
    image_url: typeof item.image_url === "string" ? item.image_url : null,
    unit: item.unit,
    price: item.price,
    quantity,
  };
};

const readStoredItems = (): CartLineItem[] => {
  if (!import.meta.client) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => normalizeLineItem(item))
      .filter((item): item is CartLineItem => Boolean(item));
  } catch (error) {
    console.error("Error reading cart from storage:", error);
    return [];
  }
};

export const useCartStore = defineStore("cart", () => {
  const items = ref<CartLineItem[]>(readStoredItems());
  const hasItems = computed(() => items.value.length > 0);

  const distinctItemCount = computed(() => items.value.length);

  const itemCount = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0),
  );

  const subtotal = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0),
  );

  const getItem = (productId: string) =>
    items.value.find((item) => item.product_id === productId) ?? null;

  const getItemQuantity = (productId: string) =>
    getItem(productId)?.quantity ?? 0;

  const getLineSubtotal = (productId: string) => {
    const item = getItem(productId);

    return item ? item.price * item.quantity : 0;
  };

  const addToCart = (product: Product, quantity = 1) => {
    const normalizedQuantity = normalizeQuantity(quantity);

    if (
      !product.id ||
      !normalizedQuantity ||
      product.is_active === false ||
      (product.stock_quantity ?? 1) <= 0
    ) {
      return;
    }

    const existing = getItem(product.id);

    if (existing) {
      existing.sku = product.sku ?? null;
      existing.category_id = product.category_id ?? null;
      existing.name = product.name ?? existing.name;
      existing.image_url = product.image_url ?? null;
      existing.unit = product.unit ?? existing.unit;
      existing.price = product.price ?? existing.price;
      existing.quantity += normalizedQuantity;
      return;
    }

    items.value.push({
      product_id: product.id,
      sku: product.sku ?? null,
      category_id: product.category_id ?? null,
      name: product.name ?? "Unnamed product",
      image_url: product.image_url ?? null,
      unit: product.unit ?? "unit",
      price: product.price ?? 0,
      quantity: normalizedQuantity,
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const normalizedQuantity = normalizeQuantity(quantity);

    if (!normalizedQuantity) {
      removeFromCart(productId);
      return;
    }

    const item = getItem(productId);

    if (!item) {
      return;
    }

    item.quantity = normalizedQuantity;
  };

  const increaseQuantity = (productId: string, amount = 1) => {
    const item = getItem(productId);

    if (!item) {
      return;
    }

    updateQuantity(productId, item.quantity + normalizeQuantity(amount));
  };

  const decreaseQuantity = (productId: string, amount = 1) => {
    const item = getItem(productId);

    if (!item) {
      return;
    }

    updateQuantity(productId, item.quantity - normalizeQuantity(amount));
  };

  const removeFromCart = (productId: string) => {
    items.value = items.value.filter((item) => item.product_id !== productId);
  };

  const clearCart = () => {
    items.value = [];
  };

  if (import.meta.client) {
    watch(
      items,
      (value) => {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      },
      { deep: true },
    );
  }

  return {
    items,
    hasItems,
    distinctItemCount,
    itemCount,
    subtotal,
    getItem,
    getItemQuantity,
    getLineSubtotal,
    addToCart,
    updateQuantity,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  };
});
