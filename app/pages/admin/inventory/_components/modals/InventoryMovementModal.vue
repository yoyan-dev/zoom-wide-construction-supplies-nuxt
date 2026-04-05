<script setup lang="ts">
import type {
  CreateInventoryMovementPayload,
  InventoryMovementType,
} from "~/types/inventory";
import type { Product } from "~/types/product";
import { useAdminResponseToast } from "~/composables/admin/useAdminResponseToast";

type InventoryMovementModalPayload = {
  product?: Product | null;
  products?: Product[];
};

const props = defineProps<{
  payload: InventoryMovementModalPayload | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();

const inventoryStore = useInventoryStore();
const { notifyResponse } = useAdminResponseToast();
const isSaving = ref(false);

const draft = reactive({
  product_id: "",
  movement_type: "adjustment" as InventoryMovementType,
  quantity_change: 0,
  note: "",
});

watch(
  () => props.payload,
  (value) => {
    draft.product_id = value?.product?.id ?? "";
    draft.movement_type = "adjustment";
    draft.quantity_change = 0;
    draft.note = "";
  },
  { immediate: true },
);

const availableProducts = computed(() =>
  props.payload?.product
    ? [props.payload.product]
    : (props.payload?.products ?? []),
);

const productOptions = computed(() =>
  availableProducts.value
    .filter((product): product is Product & { id: string } =>
      Boolean(product?.id),
    )
    .map((product) => ({
      label: `${product.name ?? "Unnamed product"}${product.sku ? ` - ${product.sku}` : ""}`,
      value: product.id,
    })),
);

const movementTypeOptions = [
  { label: "Stock In", value: "in" },
  { label: "Stock Out", value: "out" },
  { label: "Adjustment", value: "adjustment" },
];

const isProductLocked = computed(() => Boolean(props.payload?.product?.id));
const isSubmitDisabled = computed(
  () => !draft.product_id.trim() || !draft.quantity_change,
);

const handleSave = async () => {
  if (isSubmitDisabled.value) {
    return;
  }

  isSaving.value = true;
  const response = await inventoryStore.createInventoryMovement({
    product_id: draft.product_id.trim(),
    movement_type: draft.movement_type,
    quantity_change: draft.quantity_change,
    note: draft.note.trim() || null,
  } satisfies CreateInventoryMovementPayload);
  isSaving.value = false;

  const productLabel =
    availableProducts.value.find((product) => product.id === draft.product_id)
      ?.name ?? "the selected product";

  if (
    !notifyResponse(response, {
      successTitle: "Inventory movement saved",
      successDescription: `Recorded a stock update for ${productLabel}.`,
      errorTitle: "Inventory movement not saved",
    })
  ) {
    return;
  }

  emit("close", false);
};
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }">
    <template #header>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Inventory Action
        </p>
        <h3 class="mt-2 text-lg font-semibold">Record stock movement</h3>
      </div>
    </template>
    <template #body>
      <div class="space-y-4">
        <UFormField label="Product">
          <USelect
            class="w-full"
            v-model="draft.product_id"
            :items="productOptions"
            placeholder="Select product"
            :disabled="isProductLocked"
          />
        </UFormField>

        <div class="grid gap-4 md:grid-cols-2">
          <UFormField label="Movement type">
            <USelect
              class="w-full"
              v-model="draft.movement_type"
              :items="movementTypeOptions"
              placeholder="Select movement type"
            />
          </UFormField>

          <UFormField label="Quantity change">
            <UInputNumber
              v-model="draft.quantity_change"
              class="w-full"
              :step="1"
              placeholder="Enter quantity change"
            />
          </UFormField>
        </div>

        <UFormField label="Note">
          <UTextarea
            v-model="draft.note"
            class="w-full"
            placeholder="Optional note for this inventory record"
          />
        </UFormField>
      </div>
    </template>
    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton color="neutral" variant="ghost" @click="emit('close', false)">
          Cancel
        </UButton>
        <UButton
          color="primary"
          :disabled="isSubmitDisabled"
          :loading="isSaving"
          @click="handleSave"
        >
          Save Movement
        </UButton>
      </div>
    </template>
  </UModal>
</template>
