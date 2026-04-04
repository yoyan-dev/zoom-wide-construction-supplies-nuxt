<script setup lang="ts">
import type { OrderItem } from "~/types/order";
import type { Product } from "~/types/product";
import { apiRequest, toErrorMessage } from "~/utils/api";
import { formatCurrency } from "~/utils/format";

type OrderProductsModalPayload = {
  orderId: string;
  eyebrow?: string;
  title?: string;
  description?: string;
};

const props = defineProps<{
  payload: OrderProductsModalPayload | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();

const orderStore = useOrderStore();

const items = ref<OrderItem[]>([]);
const productsById = ref<Record<string, Product>>({});
const isLoading = ref(false);
const loadError = ref<string | null>(null);

const totalUnits = computed(() =>
  items.value.reduce((sum, item) => sum + item.quantity, 0),
);

const itemsTotal = computed(() =>
  items.value.reduce((sum, item) => sum + item.line_total, 0),
);

const getProductLabel = (item: OrderItem) =>
  productsById.value[item.product_id]?.name ?? "Product details unavailable";

const getProductMeta = (item: OrderItem) => {
  const product = productsById.value[item.product_id];
  const details = [product?.sku, product?.unit].filter(Boolean);
  return details.length ? details.join(" | ") : "Product reference unavailable";
};

const loadProducts = async (productIds: string[]) => {
  const uniqueIds = Array.from(new Set(productIds.filter(Boolean)));

  if (!uniqueIds.length) {
    productsById.value = {};
    return;
  }

  const responses = await Promise.allSettled(
    uniqueIds.map(async (id) => {
      const result = await apiRequest<Product>(`/products/${id}`);
      return [id, result.data] as const;
    }),
  );

  productsById.value = responses.reduce<Record<string, Product>>((map, result) => {
    if (result.status === "fulfilled" && result.value[1]) {
      map[result.value[0]] = result.value[1];
    }

    return map;
  }, {});
};

const loadModal = async () => {
  if (!props.payload?.orderId) {
    items.value = [];
    productsById.value = {};
    loadError.value = null;
    return;
  }

  isLoading.value = true;
  loadError.value = null;

  const response = await orderStore.fetchOrderById(props.payload.orderId);

  if (response.status === "error") {
    items.value = [];
    productsById.value = {};
    loadError.value =
      response.message || "The linked products could not be loaded right now.";
    isLoading.value = false;
    return;
  }

  items.value = orderStore.orderItems.filter(
    (item) => item.order_id === props.payload?.orderId,
  );

  try {
    await loadProducts(items.value.map((item) => item.product_id));
  } catch (error) {
    loadError.value =
      toErrorMessage(error) || "Some product details could not be loaded.";
  } finally {
    isLoading.value = false;
  }
};

watch(
  () => props.payload?.orderId,
  async () => {
    await loadModal();
  },
  { immediate: true },
);
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }">
    <template #header>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          {{ props.payload?.eyebrow ?? "Order Products" }}
        </p>
        <h3 class="mt-2 text-lg font-semibold">
          {{ props.payload?.title ?? "Linked products" }}
        </h3>
        <p class="mt-1 text-sm text-slate-600">
          {{
            props.payload?.description ??
            "Review the products, quantities, and line totals linked to this order."
          }}
        </p>
      </div>
    </template>

    <template #body>
      <div class="space-y-4">
        <div v-if="isLoading" class="space-y-3">
          <USkeleton class="h-16 w-full rounded-xl" />
          <USkeleton class="h-20 w-full rounded-xl" />
          <USkeleton class="h-20 w-full rounded-xl" />
        </div>

        <template v-else>
          <UAlert
            v-if="loadError"
            color="error"
            variant="subtle"
            title="Products unavailable"
            :description="loadError"
          />

          <div class="grid gap-3 sm:grid-cols-3">
            <UCard>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Product lines
              </p>
              <p class="mt-2 text-2xl font-semibold text-slate-900">
                {{ items.length }}
              </p>
            </UCard>

            <UCard>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Total units
              </p>
              <p class="mt-2 text-2xl font-semibold text-slate-900">
                {{ totalUnits }}
              </p>
            </UCard>

            <UCard>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Items total
              </p>
              <p class="mt-2 text-2xl font-semibold text-slate-900">
                {{ formatCurrency(itemsTotal) }}
              </p>
            </UCard>
          </div>

          <div v-if="items.length" class="space-y-3">
            <div
              v-for="item in items"
              :key="item.id"
              class="flex items-start justify-between gap-4 rounded-2xl border border-slate-200/70 p-4"
            >
              <div class="min-w-0">
                <p class="font-medium text-slate-900">
                  {{ getProductLabel(item) }}
                </p>
                <p class="mt-1 text-sm text-slate-600">
                  {{ getProductMeta(item) }}
                </p>
                <p class="mt-2 text-xs text-slate-500">
                  {{ item.quantity }} x {{ formatCurrency(item.unit_price) }}
                </p>
              </div>

              <p class="whitespace-nowrap font-semibold text-slate-900">
                {{ formatCurrency(item.line_total) }}
              </p>
            </div>
          </div>

          <div
            v-else-if="!loadError"
            class="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-8"
          >
            <p class="text-sm font-medium text-slate-900">
              No products available
            </p>
            <p class="mt-2 text-sm text-slate-600">
              This order does not currently include any linked product lines.
            </p>
          </div>
        </template>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full justify-end">
        <UButton color="neutral" variant="ghost" @click="emit('close', false)">
          Close
        </UButton>
      </div>
    </template>
  </UModal>
</template>
