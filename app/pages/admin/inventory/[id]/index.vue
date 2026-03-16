<script setup lang="ts">
import { storeToRefs } from "pinia";
import { formatLongDate } from "~/utils/format";

definePageMeta({
  layout: "admin",
});

const route = useRoute();
const router = useRouter();
const logId = computed(() => String(route.params.id));

const inventoryStore = useInventoryStore();
const productStore = useProductStore();

await Promise.all([
  inventoryStore.fetchInventoryLogById(logId.value),
  productStore.fetchProducts(),
]);

const { log, inventoryMeta } = storeToRefs(inventoryStore);
const { products } = storeToRefs(productStore);

const product = computed(() =>
  products.value.find((item) => item.id === log.value?.product_id),
);
const meta = computed(() => inventoryMeta.value[logId.value] ?? {});

const goBack = () => router.push("/admin/inventory");
const editLog = () => router.push(`/admin/inventory/edit/${logId.value}`);
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
              Inventory Ledger
            </p>
            <h1 class="mt-2 text-2xl font-semibold">
              Inventory Record {{ log?.id ?? "Not found" }}
            </h1>
            <p class="mt-2 text-sm text-slate-600">
              Review stock movement details and location metadata.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <UButton color="neutral" variant="outline" @click="goBack">
              Back to Inventory
            </UButton>
            <UButton color="primary" @click="editLog">
              Edit Record
            </UButton>
          </div>
        </div>
      </section>

      <div v-if="log">
        <UCard>
          <div class="grid gap-4 md:grid-cols-3">
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Movement
              </p>
              <p class="mt-2 text-lg font-semibold text-slate-800">
                {{ log.movement_type }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Quantity
              </p>
              <p class="mt-2 text-lg font-semibold text-slate-800">
                {{ log.quantity_change }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Status
              </p>
              <p class="mt-2 text-lg font-semibold text-slate-800">
                {{ meta.status ?? "available" }}
              </p>
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Product
              </p>
              <p class="mt-2 text-sm text-slate-600">
                {{ product?.name ?? log.product_id }}
              </p>
              <p class="text-xs text-slate-500">
                SKU {{ product?.sku ?? "N/A" }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Reference
              </p>
              <p class="mt-2 text-sm text-slate-600">
                {{ log.reference_type ?? "manual" }}
              </p>
              <p class="text-xs text-slate-500">
                {{ log.reference_id ?? "No reference" }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Location
              </p>
              <p class="mt-2 text-sm text-slate-600">
                {{ meta.location ?? "Not assigned" }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Warehouse
              </p>
              <p class="mt-2 text-sm text-slate-600">
                {{ meta.warehouse ?? "Not assigned" }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Created at
              </p>
              <p class="mt-2 text-sm text-slate-600">
                {{ formatLongDate(log.created_at) }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Note
              </p>
              <p class="mt-2 text-sm text-slate-600">
                {{ log.note ?? "No note" }}
              </p>
            </div>
          </div>
        </UCard>
      </div>

      <UCard v-else>
        <p class="text-sm text-slate-600">
          Inventory record not found. Check the URL or return to the inventory list.
        </p>
      </UCard>
    </div>
  </div>
</template>
