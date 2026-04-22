<script setup lang="ts">
import type { Product } from "~/types/product";
import type {
  CreateProjectItemPayload,
  ProjectItem,
  UpdateProjectItemPayload,
} from "~/types/project";
import { formatCurrency } from "~/utils/format";

const props = defineProps<{
  item?: ProjectItem | null;
  products: Product[];
  submitLabel: string;
  isSubmitting?: boolean;
  allowProductChange?: boolean;
}>();

const emit = defineEmits<{
  (e: "submit", value: CreateProjectItemPayload | UpdateProjectItemPayload): void;
  (e: "cancel"): void;
}>();

const draft = reactive({
  product_id: "",
  quantity: "1",
  unit_price: "",
});

const formError = ref<string | null>(null);

const productOptions = computed(() =>
  props.products
    .filter((product) => product.id && product.name)
    .map((product) => ({
      label: `${product.name} (${formatCurrency(product.price ?? 0)})`,
      value: product.id as string,
    })),
);

const selectedProduct = computed(
  () => props.products.find((product) => product.id === draft.product_id) ?? null,
);

watch(
  () => props.item,
  (value) => {
    draft.product_id = value?.product_id ?? "";
    draft.quantity = String(value?.quantity ?? 1);
    draft.unit_price =
      value?.unit_price === undefined || value?.unit_price === null
        ? ""
        : String(value.unit_price);
    formError.value = null;
  },
  { immediate: true },
);

watch(
  selectedProduct,
  (value) => {
    if (!props.allowProductChange || props.item) {
      return;
    }

    if (value?.price !== undefined && value?.price !== null) {
      draft.unit_price = String(value.price);
    }
  },
);

const canSubmit = computed(() => {
  const quantity = Number(draft.quantity);

  if (props.allowProductChange !== false && !draft.product_id) {
    return false;
  }

  return Number.isFinite(quantity) && quantity > 0 && !props.isSubmitting;
});

const handleSubmit = () => {
  formError.value = null;
  const quantity = Number(draft.quantity);

  if (!Number.isFinite(quantity) || quantity <= 0) {
    formError.value = "Quantity must be greater than zero.";
    return;
  }

  if (props.allowProductChange !== false) {
    if (!draft.product_id) {
      formError.value = "Select a product first.";
      return;
    }

    const unitPrice = draft.unit_price.trim().length
      ? Number(draft.unit_price)
      : null;

    emit("submit", {
      product_id: draft.product_id,
      quantity,
      unit_price: Number.isFinite(unitPrice) ? unitPrice : undefined,
    } satisfies CreateProjectItemPayload);
    return;
  }

  emit("submit", {
    quantity,
  } satisfies UpdateProjectItemPayload);
};
</script>

<template>
  <UForm class="space-y-5" @submit.prevent="handleSubmit">
    <UAlert
      v-if="formError"
      color="error"
      variant="soft"
      icon="i-lucide-circle-alert"
      :title="formError"
    />

    <UFormField v-if="props.allowProductChange !== false" label="Product" required>
      <USelect
        v-model="draft.product_id"
        class="w-full"
        :items="productOptions"
        searchable
        placeholder="Select a product"
      />
    </UFormField>

    <div class="grid gap-5 md:grid-cols-2">
      <UFormField label="Quantity" required>
        <UInput
          v-model="draft.quantity"
          type="number"
          min="1"
          class="w-full"
          placeholder="1"
        />
      </UFormField>

      <UFormField v-if="props.allowProductChange !== false" label="Unit price">
        <UInput
          v-model="draft.unit_price"
          type="number"
          min="0"
          step="0.01"
          class="w-full"
          placeholder="Use catalog price"
        />
      </UFormField>
    </div>

    <div class="flex justify-end gap-2">
      <UButton color="neutral" variant="ghost" type="button" @click="emit('cancel')">
        Cancel
      </UButton>
      <UButton
        color="warning"
        type="submit"
        :disabled="!canSubmit"
        :loading="props.isSubmitting"
      >
        {{ props.submitLabel }}
      </UButton>
    </div>
  </UForm>
</template>
