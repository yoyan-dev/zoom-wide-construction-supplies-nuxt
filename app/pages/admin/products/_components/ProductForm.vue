<script setup lang="ts">
import type {
  Product,
  ProductHandbookDetails,
  ProductSpecification,
} from "~/types/product";
import type { Category } from "~/types/category";
import type { Warehouse } from "~/types/warehouse";
import ImageInput from "./ImageInput.vue";

type ProductDraft = {
  category_id: string;
  warehouse_id: string;
  sku: string;
  name: string;
  description: string;
  unit: string;
  price: number | null;
  stock_quantity: number | null;
  minimum_stock_quantity: number | null;
  handbook_summary: string;
  handbook_features: string;
  handbook_applications: string;
  handbook_specifications: string;
  is_active: boolean;
};

const props = defineProps<{
  product?: Product | null;
  categories: Category[];
  warehouses: Warehouse[];
  submitLabel: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
}>();

const emit = defineEmits<{
  (e: "submit", value: FormData): void;
  (e: "cancel"): void;
}>();

const draft = reactive<ProductDraft>({
  category_id: "",
  warehouse_id: "",
  sku: "",
  name: "",
  description: "",
  unit: "",
  price: null,
  stock_quantity: 0,
  minimum_stock_quantity: 0,
  handbook_summary: "",
  handbook_features: "",
  handbook_applications: "",
  handbook_specifications: "",
  is_active: true,
});

const imageFile = ref<File | null>(null);

const toLineBlock = (items?: string[]) => (items ?? []).join("\n");

const toSpecBlock = (items?: ProductSpecification[]) =>
  (items ?? []).map((item) => `${item.label}: ${item.value}`).join("\n");

const parseLines = (value: string) =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

const parseSpecs = (value: string): ProductSpecification[] =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const separatorIndex = item.indexOf(":");

      if (separatorIndex === -1) {
        return { label: item, value: "" };
      }

      return {
        label: item.slice(0, separatorIndex).trim(),
        value: item.slice(separatorIndex + 1).trim(),
      };
    })
    .filter((item) => item.label);

const syncDraft = (product?: Product | null) => {
  const handbook = product?.handbook;

  draft.category_id = product?.category_id ?? "";
  draft.warehouse_id = product?.warehouse_id ?? "";
  draft.sku = product?.sku ?? "";
  draft.name = product?.name ?? "";
  draft.description = product?.description ?? "";
  draft.unit = product?.unit ?? "";
  draft.price = typeof product?.price === "number" ? product.price : null;
  draft.stock_quantity =
    typeof product?.stock_quantity === "number" ? product.stock_quantity : 0;
  draft.minimum_stock_quantity =
    typeof product?.minimum_stock_quantity === "number"
      ? product.minimum_stock_quantity
      : 0;
  draft.handbook_summary = handbook?.summary ?? "";
  draft.handbook_features = toLineBlock(handbook?.features);
  draft.handbook_applications = toLineBlock(handbook?.applications);
  draft.handbook_specifications = toSpecBlock(handbook?.specifications);
  draft.is_active = product?.is_active ?? true;
  imageFile.value = null;
};

const appendIfPresent = (formData: FormData, key: string, value: string) => {
  const trimmed = value.trim();

  if (trimmed) {
    formData.append(key, trimmed);
  }
};

const appendIfFiniteNumber = (
  formData: FormData,
  key: string,
  value: number | null,
) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    formData.append(key, String(value));
  }
};

const buildHandbookPayload = (): ProductHandbookDetails | undefined => {
  const summary = draft.handbook_summary.trim();
  const features = parseLines(draft.handbook_features);
  const applications = parseLines(draft.handbook_applications);
  const specifications = parseSpecs(draft.handbook_specifications);

  if (
    !summary &&
    !features.length &&
    !applications.length &&
    !specifications.length
  ) {
    return undefined;
  }

  return {
    summary: summary || undefined,
    features: features.length ? features : undefined,
    applications: applications.length ? applications : undefined,
    specifications: specifications.length ? specifications : undefined,
  };
};

const canSubmit = computed(
  () =>
    !!draft.category_id.trim() &&
    !!draft.sku.trim() &&
    !!draft.name.trim() &&
    !!draft.unit.trim() &&
    typeof draft.price === "number" &&
    Number.isFinite(draft.price) &&
    draft.price >= 0,
);

const handleImageChange = (file: File | null) => {
  imageFile.value = file;
};

const handleSubmit = async () => {
  if (!canSubmit.value) return;

  const formData = new FormData();
  const handbook = buildHandbookPayload();

  appendIfPresent(formData, "category_id", draft.category_id);
  appendIfPresent(formData, "warehouse_id", draft.warehouse_id);
  appendIfPresent(formData, "sku", draft.sku);
  appendIfPresent(formData, "name", draft.name);
  appendIfPresent(formData, "description", draft.description);
  appendIfPresent(formData, "unit", draft.unit);
  appendIfFiniteNumber(formData, "price", draft.price);
  appendIfFiniteNumber(formData, "stock_quantity", draft.stock_quantity);
  appendIfFiniteNumber(
    formData,
    "minimum_stock_quantity",
    draft.minimum_stock_quantity,
  );

  if (handbook) {
    formData.append("handbook", JSON.stringify(handbook));
  }

  formData.append("is_active", String(draft.is_active));

  if (imageFile.value) {
    formData.append("imageFile", imageFile.value);
  }

  emit("submit", formData);
};

watch(
  () => props.product,
  (value) => {
    syncDraft(value);
  },
  { immediate: true },
);
</script>

<template>
  <UCard>
    <UForm @submit.prevent="handleSubmit">
      <div class="space-y-6">
        <div class="grid gap-6 md:grid-cols-2">
          <UFormField class="w-full" label="Image">
            <ImageInput
              :key="`${props.product?.id ?? 'new'}:${props.product?.image_url ?? ''}`"
              :initial-image="props.product?.image_url ?? null"
              @change="handleImageChange"
            />
          </UFormField>
          <UFormField class="w-full" label="Product name">
            <UInput
              v-model="draft.name"
              class="w-full"
              name="name"
              placeholder="Ready-Mix Concrete 25MPa"
            />
          </UFormField>
          <UFormField class="w-full" label="SKU">
            <UInput
              v-model="draft.sku"
              class="w-full"
              name="sku"
              placeholder="CON-25MPA-001"
            />
          </UFormField>

          <UFormField class="w-full" label="Category">
            <USelect
              v-model="draft.category_id"
              class="w-full"
              valueKey="id"
              labelKey="name"
              name="category_id"
              :items="props.categories"
              placeholder="Select category"
            />
          </UFormField>
          <UFormField class="w-full" label="Stock warehouse">
            <USelect
              v-model="draft.warehouse_id"
              class="w-full"
              valueKey="id"
              labelKey="name"
              name="warehouse_id"
              :items="props.warehouses"
              placeholder="Select warehouse"
            />
          </UFormField>
          <UFormField class="w-full" label="Unit of measure">
            <UInput
              v-model="draft.unit"
              class="w-full"
              name="unit"
              placeholder="m3, bag, sheet"
            />
          </UFormField>
          <UFormField class="w-full" label="Unit price">
            <UInputNumber
              v-model="draft.price"
              class="w-full"
              name="price"
              :min="0"
            />
          </UFormField>
          <UFormField class="w-full" label="Stock quantity">
            <UInputNumber
              v-model="draft.stock_quantity"
              class="w-full"
              name="stock_quantity"
              :min="0"
            />
          </UFormField>
          <UFormField class="w-full" label="Minimum stock">
            <UInputNumber
              v-model="draft.minimum_stock_quantity"
              class="w-full"
              name="minimum_stock_quantity"
              :min="0"
            />
          </UFormField>
        </div>

        <UFormField class="w-full" label="Description">
          <UTextarea
            v-model="draft.description"
            class="w-full"
            name="description"
            placeholder="Add a short product description..."
          />
        </UFormField>

        <div class="rounded-2xl border border-slate-200/70 p-5">
          <div class="mb-4">
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Handbook Details
            </p>
            <h3 class="mt-2 text-lg font-semibold text-slate-900">
              Product Reference Content
            </h3>
            <p class="mt-1 text-sm text-slate-600">
              Add the specs, applications, and field notes you want the team to
              see in product details.
            </p>
          </div>

          <div class="grid gap-6">
            <UFormField class="w-full" label="Handbook summary">
              <UTextarea
                v-model="draft.handbook_summary"
                class="w-full"
                name="handbook_summary"
                placeholder="Short overview of where this product fits and what it is for."
              />
            </UFormField>

            <div class="grid gap-6 lg:grid-cols-2">
              <UFormField
                class="w-full"
                label="Key features"
                description="One item per line"
              >
                <UTextarea
                  v-model="draft.handbook_features"
                  class="w-full"
                  name="handbook_features"
                  placeholder="Consistent batching&#10;Structural-grade supply&#10;Site-ready delivery"
                />
              </UFormField>
              <UFormField
                class="w-full"
                label="Applications"
                description="One use case per line"
              >
                <UTextarea
                  v-model="draft.handbook_applications"
                  class="w-full"
                  name="handbook_applications"
                  placeholder="Slabs and footings&#10;Columns and beams&#10;General structural pours"
                />
              </UFormField>
            </div>

            <UFormField
              class="w-full"
              label="Specifications"
              description="Use the format Label: Value, one per line"
            >
              <UTextarea
                v-model="draft.handbook_specifications"
                class="w-full"
                name="handbook_specifications"
                placeholder="Strength Class: 25 MPa&#10;Unit of Measure: m3&#10;Supply Format: Delivered ready-mix"
              />
            </UFormField>
          </div>
        </div>
      </div>
      <div
        class="mt-6 flex items-center justify-between rounded-2xl border border-slate-200/70 p-4"
      >
        <div>
          <p class="text-sm font-medium">Active in catalog</p>
          <p class="text-xs text-slate-500">
            Toggle visibility for customer orders.
          </p>
        </div>
        <USwitch v-model="draft.is_active" name="is_active" />
      </div>

      <div class="mt-6 flex justify-end gap-2">
        <UButton
          color="neutral"
          variant="ghost"
          type="button"
          @click="emit('cancel')"
        >
          {{ props.cancelLabel ?? "Cancel" }}
        </UButton>
        <UButton
          color="primary"
          type="submit"
          :disabled="!canSubmit"
          :loading="props.isSubmitting"
        >
          {{ props.submitLabel }}
        </UButton>
      </div>
    </UForm>
  </UCard>
</template>
