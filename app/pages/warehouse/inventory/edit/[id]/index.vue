<script setup lang="ts">
import { storeToRefs } from "pinia";
import {
  defaultAssignedWarehouses,
  getWarehouseForId,
  warehouseOptions,
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

const currentWarehouse = computed(() =>
  productId.value
    ? inventoryMeta.value[productId.value]?.warehouse ??
      getWarehouseForId(productId.value)
    : "",
);

const hasAccess = computed(() =>
  assignedWarehouses.includes(currentWarehouse.value),
);

const form = reactive({
  stock_quantity: 0,
  minimum_stock_quantity: 0,
  status: "available" as "available" | "unavailable" | "archived",
  warehouse: "",
  is_active: true,
});

watch(
  () => product.value,
  (value) => {
    form.stock_quantity = value?.stock_quantity ?? 0;
    form.minimum_stock_quantity = value?.minimum_stock_quantity ?? 0;
    form.warehouse = currentWarehouse.value;
    form.is_active = value?.is_active ?? true;

    const metaStatus = inventoryMeta.value[productId.value]?.status;
    const archived = productMeta.value[productId.value]?.archived;
    if (archived || metaStatus === "archived") {
      form.status = "archived";
    } else if (metaStatus === "unavailable" || value?.is_active === false) {
      form.status = "unavailable";
    } else {
      form.status = "available";
    }
  },
  { immediate: true },
);

const statusOptions = [
  { label: "Available", value: "available" },
  { label: "Unavailable", value: "unavailable" },
  { label: "Archived", value: "archived" },
];

const handleSave = async () => {
  if (!product.value?.id || !hasAccess.value) return;

  await productStore.updateProduct(product.value.id, {
    stock_quantity: form.stock_quantity,
    minimum_stock_quantity: form.minimum_stock_quantity,
    is_active: form.is_active,
  });

  inventoryStore.updateInventoryWarehouse(product.value.id, form.warehouse);
  inventoryStore.setInventoryStatus(product.value.id, form.status);
  productStore.setProductArchived(product.value.id, form.status === "archived");

  router.push("/warehouse/inventory");
};
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
              Inventory Record
            </p>
            <h1 class="mt-2 text-2xl font-semibold">Edit Inventory Record</h1>
            <p class="mt-2 text-sm text-slate-600">
              Update stock counts, alerts, and warehouse assignment.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <UButton color="neutral" variant="outline" to="/warehouse/inventory">
              Back to Inventory
            </UButton>
          </div>
        </div>
      </section>

      <UCard v-if="!hasAccess">
        <p class="text-sm text-slate-600">
          This inventory item is assigned to {{ currentWarehouse }}. You can only
          edit items for {{ assignedWarehouses.join(", ") }}.
        </p>
      </UCard>

      <UCard v-else-if="product">
        <div class="grid gap-6 md:grid-cols-2">
          <UFormField label="Stock quantity">
            <UInput
              class="w-full"
              v-model.number="form.stock_quantity"
              type="number"
            />
          </UFormField>
          <UFormField label="Minimum stock">
            <UInput
              class="w-full"
              v-model.number="form.minimum_stock_quantity"
              type="number"
            />
          </UFormField>
          <UFormField label="Warehouse">
            <USelect
              class="w-full"
              v-model="form.warehouse"
              :items="warehouseOptions"
            />
          </UFormField>
          <UFormField label="Status">
            <USelect
              class="w-full"
              valueKey="value"
              labelKey="label"
              v-model="form.status"
              :items="statusOptions"
            />
          </UFormField>
          <UFormField label="Active in catalog">
            <USelect
              class="w-full"
              v-model="form.is_active"
              valueKey="value"
              labelKey="label"
              :items="[
                { label: 'Active', value: true },
                { label: 'Inactive', value: false },
              ]"
            />
          </UFormField>
        </div>

        <div class="mt-6 flex justify-end gap-2">
          <UButton color="neutral" variant="ghost" to="/warehouse/inventory">
            Cancel
          </UButton>
          <UButton color="primary" @click="handleSave">Save Changes</UButton>
        </div>
      </UCard>

      <UCard v-else>
        <p class="text-sm text-slate-600">
          Inventory record not found. Check the URL or return to the inventory list.
        </p>
      </UCard>
    </div>
  </div>
</template>
