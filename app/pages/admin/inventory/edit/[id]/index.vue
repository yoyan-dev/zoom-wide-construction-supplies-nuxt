<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { InventoryLog, InventoryMovementType } from "~/types/inventory";
import { useModal } from "~/composables/admin/useModal";
import ActionConfirmModal from "../../../_components/modals/ActionConfirmModal.vue";

definePageMeta({
  layout: "admin",
});

const route = useRoute();
const router = useRouter();
const logId = computed(() => String(route.params.id));

const inventoryStore = useInventoryStore();
const { openModal } = useModal();

await inventoryStore.fetchInventoryLogById(logId.value);

const { log } = storeToRefs(inventoryStore);

const movementOptions: Array<{ label: string; value: InventoryMovementType }> = [
  { label: "Inbound", value: "in" },
  { label: "Outbound", value: "out" },
  { label: "Adjustment", value: "adjustment" },
];

const draft = reactive({
  movement_type: "adjustment" as InventoryMovementType,
  quantity_change: 0,
  reference_type: "",
  reference_id: "",
  note: "",
  created_by: "",
});

watch(
  () => log.value,
  (value) => {
    draft.movement_type = value?.movement_type ?? "adjustment";
    draft.quantity_change = value?.quantity_change ?? 0;
    draft.reference_type = value?.reference_type ?? "";
    draft.reference_id = value?.reference_id ?? "";
    draft.note = value?.note ?? "";
    draft.created_by = value?.created_by ?? "";
  },
  { immediate: true },
);

const normalize = (value: string) => (value.trim().length ? value.trim() : null);

const handleSave = async () => {
  if (!log.value?.id) return;
  await inventoryStore.updateInventoryLog(log.value.id, {
    movement_type: draft.movement_type,
    quantity_change: draft.quantity_change,
    reference_type: normalize(draft.reference_type),
    reference_id: normalize(draft.reference_id),
    note: normalize(draft.note),
    created_by: normalize(draft.created_by),
  } as Partial<InventoryLog>);
  router.push("/admin/inventory");
};

const handleDelete = () => {
  if (!log.value?.id) return;
  openModal(ActionConfirmModal, {
    title: "Delete inventory record",
    description: `Delete ${log.value.id}? This cannot be undone.`,
    confirmLabel: "Delete",
    confirmColor: "error",
    onConfirm: async () => {
      await inventoryStore.deleteInventoryLog(log.value!.id);
      router.push("/admin/inventory");
    },
  });
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
              Inventory Ledger
            </p>
            <h1 class="mt-2 text-2xl font-semibold">Edit Inventory Record</h1>
            <p class="mt-2 text-sm text-slate-600">
              Update movement details, references, and notes.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <UButton color="neutral" variant="outline" to="/admin/inventory">
              Back to Inventory
            </UButton>
            <UButton color="error" variant="outline" @click="handleDelete">
              Delete Record
            </UButton>
          </div>
        </div>
      </section>

      <UCard v-if="log">
        <div class="grid gap-6 md:grid-cols-2">
          <UFormField label="Movement type">
            <USelect
              class="w-full"
              valueKey="value"
              labelKey="label"
              v-model="draft.movement_type"
              :items="movementOptions"
            />
          </UFormField>
          <UFormField label="Quantity change">
            <UInput
              class="w-full"
              v-model.number="draft.quantity_change"
              type="number"
            />
          </UFormField>
          <UFormField label="Reference type">
            <UInput class="w-full" v-model="draft.reference_type" />
          </UFormField>
          <UFormField label="Reference ID">
            <UInput class="w-full" v-model="draft.reference_id" />
          </UFormField>
          <UFormField label="Created by">
            <UInput class="w-full" v-model="draft.created_by" />
          </UFormField>
        </div>
        <div class="mt-6">
          <UFormField label="Note">
            <UTextarea class="w-full" v-model="draft.note" />
          </UFormField>
        </div>

        <div class="mt-6 flex justify-end gap-2">
          <UButton color="neutral" variant="ghost" to="/admin/inventory">
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
