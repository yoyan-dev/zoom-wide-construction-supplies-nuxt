<script setup lang="ts">
import { storeToRefs } from "pinia";
import { formatLongDate } from "~/utils/format";
import {
  defaultAssignedWarehouses,
  getWarehouseForId,
} from "~/utils/warehouse";

definePageMeta({
  layout: "warehouse",
});

const route = useRoute();
const router = useRouter();
const productId = computed(() => String(route.params.id));

const inventoryStore = useInventoryStore();
const productStore = useProductStore();

await productStore.fetchProductById(productId.value);

const { product, productMeta } = storeToRefs(productStore);
const { inventoryMeta } = storeToRefs(inventoryStore);

const assignedWarehouses = defaultAssignedWarehouses;

const warehouse = computed(() =>
  productId.value
    ? inventoryMeta.value[productId.value]?.warehouse ??
      getWarehouseForId(productId.value)
    : "",
);

const status = computed(() => {
  const metaStatus = inventoryMeta.value[productId.value]?.status;
  const archived = productMeta.value[productId.value]?.archived;
  if (archived || metaStatus === "archived") return "archived";
  if (metaStatus === "unavailable" || product.value?.is_active === false)
    return "unavailable";
  return "available";
});

const hasAccess = computed(() =>
  assignedWarehouses.includes(warehouse.value),
);

const goBack = () => router.push("/warehouse/inventory");
const editItem = () =>
  router.push(`/warehouse/inventory/edit/${productId.value}`);
</script>

<template>
  <div class="min-h-screen">
    <div class="space-y-6">
      <section class="bg-white p-2">
        <div
          class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Inventory Details
            </p>
            <h1 class="mt-2 text-2xl font-semibold">
              {{ product?.name ?? "Inventory Item" }}
            </h1>
            <p class="mt-2 text-sm text-slate-600">
              Review stock status and warehouse assignment.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <UButton color="neutral" variant="outline" @click="goBack">
              Back to Inventory
            </UButton>
            <UButton color="primary" :disabled="!hasAccess" @click="editItem">
              Edit Record
            </UButton>
          </div>
        </div>
      </section>

      <UCard v-if="!hasAccess">
        <p class="text-sm text-slate-600">
          This inventory item is assigned to {{ warehouse }}. You can only view
          items for {{ assignedWarehouses.join(", ") }}.
        </p>
      </UCard>

      <div v-else-if="product">
        <UCard>
          <div class="grid gap-4 md:grid-cols-3">
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Stock
              </p>
              <p class="mt-2 text-lg font-semibold text-slate-800">
                {{ product.stock_quantity ?? 0 }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Minimum Stock
              </p>
              <p class="mt-2 text-lg font-semibold text-slate-800">
                {{ product.minimum_stock_quantity ?? 0 }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Status
              </p>
              <p class="mt-2 text-lg font-semibold text-slate-800">
                {{ status }}
              </p>
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                SKU
              </p>
              <p class="mt-2 text-sm text-slate-600">
                {{ product.sku ?? "N/A" }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Warehouse
              </p>
              <p class="mt-2 text-sm text-slate-600">
                {{ warehouse }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Created at
              </p>
              <p class="mt-2 text-sm text-slate-600">
                {{ product.created_at ? formatLongDate(product.created_at) : "" }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Updated at
              </p>
              <p class="mt-2 text-sm text-slate-600">
                {{ product.updated_at ? formatLongDate(product.updated_at) : "" }}
              </p>
            </div>
          </div>
        </UCard>

        <UCard>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Description
          </p>
          <p class="mt-2 text-sm text-slate-600">
            {{ product.description ?? "No description available." }}
          </p>
        </UCard>
      </div>

      <UCard v-else>
        <p class="text-sm text-slate-600">
          Inventory item not found. Check the URL or return to the inventory list.
        </p>
      </UCard>
    </div>
  </div>
</template>
