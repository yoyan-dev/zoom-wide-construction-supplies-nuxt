<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { WarehouseStatus } from "~/types/warehouse";

definePageMeta({
  layout: "admin",
});

const route = useRoute();
const router = useRouter();
const warehouseId = computed(() => String(route.params.id));

const warehouseStore = useWarehouseStore();
const { notifyResponse } = useAdminResponseToast();

await warehouseStore.fetchWarehouseById(warehouseId.value);

const { warehouse } = storeToRefs(warehouseStore);

const form = reactive({
  name: "",
  address: "",
  capacity: 0,
  status: "active" as WarehouseStatus,
});

watch(
  () => warehouse.value,
  (value) => {
    form.name = value?.name ?? "";
    form.address = value?.address ?? "";
    form.capacity = value?.capacity ?? 0;
    form.status = value?.status ?? "active";
  },
  { immediate: true },
);

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Archived", value: "archived" },
];

const handleSave = async () => {
  if (!warehouse.value?.id) return;
  const response = await warehouseStore.updateWarehouse(warehouse.value.id, {
    name: form.name.trim(),
    address: form.address.trim(),
    capacity: form.capacity,
    status: form.status,
  });

  if (
    !notifyResponse(response, {
      successTitle: "Warehouse updated",
      successDescription: `Saved changes to ${form.name.trim()}.`,
      errorTitle: "Warehouse not updated",
    })
  ) {
    return;
  }

  router.push("/admin/warehouse");
};
</script>

<template>
  <div class="min-h-screen">
    <div class="space-y-6">
      <section class="bg-white p-2">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Warehouse Management
            </p>
            <h1 class="mt-2 text-2xl font-semibold">Edit Warehouse</h1>
            <p class="mt-2 text-sm text-slate-600">
              Update warehouse location details and capacity.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <UButton color="neutral" variant="outline" to="/admin/warehouse">
              Back to Warehouses
            </UButton>
          </div>
        </div>
      </section>

      <UCard v-if="warehouse">
        <div class="grid gap-6 md:grid-cols-2">
          <UFormField label="Warehouse name">
            <UInput class="w-full" v-model="form.name" />
          </UFormField>
          <UFormField label="Address / Location">
            <UInput class="w-full" v-model="form.address" />
          </UFormField>
          <UFormField label="Capacity">
            <UInput class="w-full" v-model.number="form.capacity" type="number" />
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
        </div>

        <div class="mt-6 flex justify-end gap-2">
          <UButton color="neutral" variant="ghost" to="/admin/warehouse">
            Cancel
          </UButton>
          <UButton color="primary" @click="handleSave">Save Changes</UButton>
        </div>
      </UCard>

      <UCard v-else>
        <p class="text-sm text-slate-600">
          Warehouse not found. Check the URL or return to the warehouses list.
        </p>
      </UCard>
    </div>
  </div>
</template>
