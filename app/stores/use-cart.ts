import { computed, ref, watch } from "vue";
import { defineStore } from "pinia";
import type { CartLineItem } from "~/types/cart";
import type { Order } from "~/types/order";
import type { Product } from "~/types/product";
import type { StoreResponse } from "~/types/store-response";
import { apiRequest, apiRequestRaw, toErrorMessage } from "~/utils/api";

const STORAGE_KEY = "zoom-shop-cart";

type StoredCartMode = "guest" | "server";

type StoredCartState = {
  mode: StoredCartMode;
  customerId: string | null;
  items: CartLineItem[];
};

const normalizeQuantity = (value: number) => Math.max(0, Math.floor(value));

const getDefaultStoredState = (): StoredCartState => ({
  mode: "guest",
  customerId: null,
  items: [],
});

const normalizeLineItem = (value: unknown): CartLineItem | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const item = value as Partial<CartLineItem> & {
    product?: Partial<Product>;
    unit_price?: number;
  };
  const product =
    item.product && typeof item.product === "object" ? item.product : null;
  const productId = item.product_id ?? product?.id;
  const name = item.name ?? product?.name;
  const unit = item.unit ?? product?.unit;
  const price = item.price ?? item.unit_price ?? product?.price;
  const quantity = normalizeQuantity(item.quantity ?? 0);

  if (
    typeof productId !== "string" ||
    typeof name !== "string" ||
    typeof unit !== "string" ||
    typeof price !== "number" ||
    !Number.isFinite(price) ||
    !quantity
  ) {
    return null;
  }

  return {
    id: typeof item.id === "string" ? item.id : null,
    cart_id: typeof item.cart_id === "string" ? item.cart_id : null,
    product_id: productId,
    sku:
      typeof item.sku === "string"
        ? item.sku
        : typeof product?.sku === "string"
          ? product.sku
          : null,
    category_id:
      typeof item.category_id === "string"
        ? item.category_id
        : typeof product?.category_id === "string"
          ? product.category_id
          : null,
    name,
    image_url:
      typeof item.image_url === "string"
        ? item.image_url
        : typeof product?.image_url === "string"
          ? product.image_url
          : null,
    unit,
    price,
    quantity,
  };
};

const readStoredState = (): StoredCartState => {
  if (!import.meta.client) {
    return getDefaultStoredState();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return getDefaultStoredState();
    }

    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      return {
        mode: "guest",
        customerId: null,
        items: parsed
          .map((item) => normalizeLineItem(item))
          .filter((item): item is CartLineItem => Boolean(item)),
      };
    }

    if (!parsed || typeof parsed !== "object") {
      return getDefaultStoredState();
    }

    const candidate = parsed as Partial<StoredCartState>;

    return {
      mode: candidate.mode === "server" ? "server" : "guest",
      customerId:
        typeof candidate.customerId === "string" ? candidate.customerId : null,
      items: Array.isArray(candidate.items)
        ? candidate.items
            .map((item) => normalizeLineItem(item))
            .filter((item): item is CartLineItem => Boolean(item))
        : [],
    };
  } catch (error) {
    console.error("Error reading cart from storage:", error);
    return getDefaultStoredState();
  }
};

const resolveCartItemsSource = (value: unknown): unknown[] => {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  const candidate = value as Record<string, unknown>;

  for (const collection of [
    candidate.items,
    candidate.cart_items,
    candidate.line_items,
    candidate.entries,
  ]) {
    if (Array.isArray(collection)) {
      return collection;
    }
  }

  return [];
};

export const useCartStore = defineStore("cart", () => {
  const storedState = readStoredState();
  const authStore = useAuthStore();
  const items = ref<CartLineItem[]>(storedState.items);
  const isLoading = ref(false);
  const isSyncing = ref(false);
  const isCheckingOut = ref(false);

  const customerId = computed(() => authStore.customer?.id ?? null);
  const hasItems = computed(() => items.value.length > 0);
  const distinctItemCount = computed(() => items.value.length);
  const itemCount = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0),
  );
  const subtotal = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0),
  );

  const persistState = (
    mode: StoredCartMode,
    nextCustomerId: string | null,
    nextItems: CartLineItem[],
  ) => {
    if (!import.meta.client) {
      return;
    }

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        mode,
        customerId: nextCustomerId,
        items: nextItems,
      } satisfies StoredCartState),
    );
  };

  const setGuestItems = (nextItems: CartLineItem[]) => {
    items.value = nextItems;
    persistState("guest", null, nextItems);
  };

  const setServerItems = (nextItems: CartLineItem[], nextCustomerId: string) => {
    items.value = nextItems;
    persistState("server", nextCustomerId, nextItems);
  };

  const setCurrentItems = (nextItems: CartLineItem[]) => {
    if (customerId.value) {
      setServerItems(nextItems, customerId.value);
      return;
    }

    setGuestItems(nextItems);
  };

  const getItem = (productId: string) =>
    items.value.find((item) => item.product_id === productId) ?? null;

  const getItemQuantity = (productId: string) =>
    getItem(productId)?.quantity ?? 0;

  const getLineSubtotal = (productId: string) => {
    const item = getItem(productId);

    return item ? item.price * item.quantity : 0;
  };

  const buildLineItemFromProduct = (
    product: Product,
    quantity: number,
    existing?: CartLineItem | null,
  ): CartLineItem | null => {
    if (!product.id) {
      return null;
    }

    const normalizedQuantity = normalizeQuantity(quantity);

    if (!normalizedQuantity) {
      return null;
    }

    return {
      id: existing?.id ?? null,
      cart_id: existing?.cart_id ?? null,
      product_id: product.id,
      sku: product.sku ?? existing?.sku ?? null,
      category_id: product.category_id ?? existing?.category_id ?? null,
      name: product.name ?? existing?.name ?? "Unnamed product",
      image_url: product.image_url ?? existing?.image_url ?? null,
      unit: product.unit ?? existing?.unit ?? "unit",
      price: product.price ?? existing?.price ?? 0,
      quantity: normalizedQuantity,
    };
  };

  const replaceItem = (nextItem: CartLineItem) => {
    const existingIndex = items.value.findIndex(
      (item) => item.product_id === nextItem.product_id,
    );

    if (existingIndex === -1) {
      return [...items.value, nextItem];
    }

    return items.value.map((item) =>
      item.product_id === nextItem.product_id ? nextItem : item,
    );
  };

  const parseServerItems = (value: unknown) =>
    resolveCartItemsSource(value)
      .map((item) => normalizeLineItem(item))
      .filter((item): item is CartLineItem => Boolean(item));

  const fetchCart = async (
    nextCustomerId = customerId.value,
  ): Promise<StoreResponse<CartLineItem[]>> => {
    if (!nextCustomerId) {
      return {
        status: "success",
        message: "Guest cart active",
        statusMessage: "ok",
        data: items.value,
      };
    }

    isLoading.value = true;

    try {
      const { data, ok, status } = await apiRequestRaw<unknown>("/cart", {
        query: {
          customer_id: nextCustomerId,
        },
      });

      if (!ok) {
        if (status === 404) {
          setServerItems([], nextCustomerId);
          return {
            status: "success",
            message: "Cart is empty",
            statusMessage: "ok",
            data: [],
          };
        }

        throw new Error(data?.message || "Failed to fetch cart");
      }

      const nextItems = parseServerItems(data?.data);
      setServerItems(nextItems, nextCustomerId);

      return {
        status: "success",
        message: data?.message || "Cart fetched successfully",
        statusMessage: data?.statusMessage || "ok",
        data: nextItems,
      };
    } catch (error) {
      return {
        status: "error",
        message: toErrorMessage(error) || "Failed to fetch cart",
        statusMessage: "internal server error",
        data: null,
      };
    } finally {
      isLoading.value = false;
    }
  };

  const syncGuestCartToServer = async (
    nextCustomerId: string,
    guestItems: CartLineItem[],
  ) => {
    if (!guestItems.length) {
      return;
    }

    isSyncing.value = true;

    try {
      for (const item of guestItems) {
        await apiRequest("/cart/items", {
          method: "POST",
          body: {
            customer_id: nextCustomerId,
            product_id: item.product_id,
            quantity: item.quantity,
          },
        });
      }
    } catch (error) {
      console.error("Error syncing guest cart:", error);
    } finally {
      isSyncing.value = false;
    }
  };

  const addToCart = async (product: Product, quantity = 1) => {
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
    const nextItem = buildLineItemFromProduct(
      product,
      (existing?.quantity ?? 0) + normalizedQuantity,
      existing,
    );

    if (!nextItem) {
      return;
    }

    setCurrentItems(replaceItem(nextItem));

    if (!customerId.value) {
      return;
    }

    isSyncing.value = true;

    try {
      await apiRequest("/cart/items", {
        method: "POST",
        body: {
          customer_id: customerId.value,
          product_id: product.id,
          quantity: normalizedQuantity,
        },
      });

      await fetchCart(customerId.value);
    } catch (error) {
      console.error("Error adding item to cart:", error);
      await fetchCart(customerId.value);
    } finally {
      isSyncing.value = false;
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    const normalizedQuantity = normalizeQuantity(quantity);
    const item = getItem(productId);

    if (!normalizedQuantity) {
      await removeFromCart(productId);
      return;
    }

    if (!item) {
      return;
    }

    setCurrentItems(
      items.value.map((entry) =>
        entry.product_id === productId
          ? {
              ...entry,
              quantity: normalizedQuantity,
            }
          : entry,
      ),
    );

    if (!customerId.value) {
      return;
    }

    isSyncing.value = true;

    try {
      if (item.id) {
        const { data, ok } = await apiRequestRaw<null>(`/cart/items/${item.id}`, {
          method: "DELETE",
          query: {
            customer_id: customerId.value,
          },
        });

        if (!ok || (data && data.status === "error")) {
          throw new Error(data?.message || "Failed to update cart item");
        }
      }

      await apiRequest("/cart/items", {
        method: "POST",
        body: {
          customer_id: customerId.value,
          product_id: productId,
          quantity: normalizedQuantity,
        },
      });

      await fetchCart(customerId.value);
    } catch (error) {
      console.error("Error updating cart item quantity:", error);
      await fetchCart(customerId.value);
    } finally {
      isSyncing.value = false;
    }
  };

  const increaseQuantity = async (productId: string, amount = 1) => {
    const item = getItem(productId);

    if (!item) {
      return;
    }

    await updateQuantity(productId, item.quantity + normalizeQuantity(amount));
  };

  const decreaseQuantity = async (productId: string, amount = 1) => {
    const item = getItem(productId);

    if (!item) {
      return;
    }

    await updateQuantity(productId, item.quantity - normalizeQuantity(amount));
  };

  const removeFromCart = async (productId: string) => {
    const item = getItem(productId);
    setCurrentItems(items.value.filter((entry) => entry.product_id !== productId));

    if (!customerId.value || !item?.id) {
      return;
    }

    isSyncing.value = true;

    try {
      const { data, ok } = await apiRequestRaw<null>(`/cart/items/${item.id}`, {
        method: "DELETE",
        query: {
          customer_id: customerId.value,
        },
      });

      if (!ok || (data && data.status === "error")) {
        throw new Error(data?.message || "Failed to remove cart item");
      }

      await fetchCart(customerId.value);
    } catch (error) {
      console.error("Error removing cart item:", error);
      await fetchCart(customerId.value);
    } finally {
      isSyncing.value = false;
    }
  };

  const clearCart = async (): Promise<StoreResponse> => {
    setCurrentItems([]);

    if (!customerId.value) {
      return {
        status: "success",
        message: "Cart cleared successfully",
        statusMessage: "ok",
      };
    }

    isSyncing.value = true;

    try {
      const { data, ok } = await apiRequestRaw<null>("/cart", {
        method: "DELETE",
        query: {
          customer_id: customerId.value,
        },
      });

      if (!ok || (data && data.status === "error")) {
        throw new Error(data?.message || "Failed to clear cart");
      }

      setServerItems([], customerId.value);

      return {
        status: "success",
        message: data?.message || "Cart cleared successfully",
        statusMessage: data?.statusMessage || "no content",
      };
    } catch (error) {
      await fetchCart(customerId.value);
      return {
        status: "error",
        message: toErrorMessage(error) || "Failed to clear cart",
        statusMessage: "internal server error",
      };
    } finally {
      isSyncing.value = false;
    }
  };

  const checkoutCart = async (
    notes?: string | null,
  ): Promise<StoreResponse<Order>> => {
    if (!customerId.value) {
      return {
        status: "error",
        message: "Sign in to continue checkout",
        statusMessage: "unauthorized",
        data: null,
      };
    }

    isCheckingOut.value = true;

    try {
      const result = await apiRequest<Order>("/cart/checkout", {
        method: "POST",
        body: {
          customer_id: customerId.value,
          notes: notes?.trim() ? notes.trim() : undefined,
        },
      });

      setServerItems([], customerId.value);

      return {
        status: "success",
        message: result.message || "Checkout completed successfully",
        statusMessage: result.statusMessage || "created",
        data: result.data || null,
      };
    } catch (error) {
      return {
        status: "error",
        message: toErrorMessage(error) || "Failed to checkout cart",
        statusMessage: "internal server error",
        data: null,
      };
    } finally {
      isCheckingOut.value = false;
    }
  };

  if (import.meta.client) {
    watch(
      customerId,
      async (nextCustomerId, previousCustomerId) => {
        if (!nextCustomerId) {
          if (previousCustomerId) {
            setGuestItems([]);
          }
          return;
        }

        const latestStoredState = readStoredState();

        if (
          latestStoredState.mode === "guest" &&
          latestStoredState.items.length
        ) {
          await syncGuestCartToServer(nextCustomerId, latestStoredState.items);
        }

        await fetchCart(nextCustomerId);
      },
      { immediate: true },
    );
  }

  return {
    items,
    isLoading,
    isSyncing,
    isCheckingOut,
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
    fetchCart,
    checkoutCart,
  };
});
