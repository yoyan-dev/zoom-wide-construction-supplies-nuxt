<script setup lang="ts">
import type { Category } from "~/types/category";
import type {
  Product,
  ProductHandbookDetails,
  ProductSpecification,
} from "~/types/product";
import type { Supplier } from "~/types/supplier";
import type { Warehouse } from "~/types/warehouse";

type ProductSubmitValue = Omit<Product, "id" | "created_at" | "updated_at">;

type ProductDraft = {
  name: string;
  sku: string;
  image_url: string | null;
  category_id: string;
  supplier_id: string | null;
  warehouse_id: string | null;
  unit: string;
  price: number;
  stock_quantity: number;
  minimum_stock_quantity: number;
  description: string;
  is_active: boolean;
  handbook_summary: string;
  handbook_features: string;
  handbook_applications: string;
  handbook_specifications: string;
};

const props = defineProps<{
  product: Product | null;
  categories: Category[];
  suppliers: Supplier[];
  warehouses: Warehouse[];
  submitLabel: string;
  cancelTo: string;
}>();

const emit = defineEmits<{
  (e: "submit", value: ProductSubmitValue): void;
}>();

const draft = ref<ProductDraft>({
  name: "",
  sku: "",
  image_url: "",
  category_id: "",
  supplier_id: null,
  warehouse_id: null,
  unit: "unit",
  price: 0,
  stock_quantity: 0,
  minimum_stock_quantity: 0,
  description: "",
  is_active: true,
  handbook_summary: "",
  handbook_features: "",
  handbook_applications: "",
  handbook_specifications: "",
});

const toLineBlock = (items?: string[]) => (items ?? []).join("\n");

const toSpecificationBlock = (items?: ProductSpecification[]) =>
  (items ?? []).map((item) => `${item.label}: ${item.value}`).join("\n");

const parseLines = (value: string) =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

const parseSpecifications = (value: string): ProductSpecification[] =>
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

const selectedCategory = computed(() =>
  props.categories.find((category) => category.id === draft.value.category_id),
);

watch(
  () => props.product,
  (value) => {
    draft.value = {
      name: value?.name ?? "",
      sku: value?.sku ?? "",
      image_url: value?.image_url ?? "",
      category_id: value?.category_id ?? "",
      supplier_id: value?.supplier_id ?? null,
      warehouse_id: value?.warehouse_id ?? null,
      unit: value?.unit ?? "unit",
      price: value?.price ?? 0,
      stock_quantity: value?.stock_quantity ?? 0,
      minimum_stock_quantity: value?.minimum_stock_quantity ?? 0,
      description: value?.description ?? "",
      is_active: value?.is_active ?? true,
      handbook_summary: value?.handbook?.summary ?? "",
      handbook_features: toLineBlock(value?.handbook?.features),
      handbook_applications: toLineBlock(value?.handbook?.applications),
      handbook_specifications: toSpecificationBlock(
        value?.handbook?.specifications,
      ),
    };
  },
  { immediate: true },
);

const submit = () => {
  const handbook: ProductHandbookDetails = {
    summary: draft.value.handbook_summary.trim() || undefined,
    features: parseLines(draft.value.handbook_features),
    applications: parseLines(draft.value.handbook_applications),
    specifications: parseSpecifications(draft.value.handbook_specifications),
  };

  emit("submit", {
    name: draft.value.name,
    sku: draft.value.sku,
    image_url: draft.value.image_url || null,
    category_id: draft.value.category_id,
    supplier_id: draft.value.supplier_id || null,
    warehouse_id: draft.value.warehouse_id || null,
    unit: draft.value.unit,
    price: draft.value.price,
    stock_quantity: draft.value.stock_quantity,
    minimum_stock_quantity: draft.value.minimum_stock_quantity,
    description: draft.value.description,
    handbook: {
      summary: handbook.summary,
      features: handbook.features?.length ? handbook.features : undefined,
      applications: handbook.applications?.length
        ? handbook.applications
        : undefined,
      specifications: handbook.specifications?.length
        ? handbook.specifications
        : undefined,
    },
    is_active: draft.value.is_active,
  });
};
</script>

<template>
  <UCard>
    <div class="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.95fr)]">
      <div class="space-y-6">
        <div class="grid gap-6 md:grid-cols-2">
          <UFormField class="w-full" label="Product name">
            <UInput
              class="w-full"
              v-model="draft.name"
              placeholder="Ready-Mix Concrete 25MPa"
            />
          </UFormField>
          <UFormField class="w-full" label="SKU">
            <UInput
              class="w-full"
              v-model="draft.sku"
              placeholder="CON-25MPA-001"
            />
          </UFormField>
          <UFormField class="w-full" label="Image URL">
            <UInput
              class="w-full"
              v-model="draft.image_url"
              placeholder="https://example.com/product.jpg"
            />
          </UFormField>
          <UFormField class="w-full" label="Category">
            <USelect
              class="w-full"
              valueKey="id"
              labelKey="name"
              v-model="draft.category_id"
              :items="props.categories"
            />
          </UFormField>
          <UFormField class="w-full" label="Supplier">
            <USelect
              class="w-full"
              valueKey="id"
              labelKey="name"
              v-model="draft.supplier_id"
              :items="props.suppliers"
            />
          </UFormField>
          <UFormField class="w-full" label="Stock warehouse">
            <USelect
              class="w-full"
              valueKey="id"
              labelKey="name"
              v-model="draft.warehouse_id"
              :items="props.warehouses"
              placeholder="Select warehouse"
            />
          </UFormField>
          <UFormField class="w-full" label="Unit of measure">
            <UInput
              class="w-full"
              v-model="draft.unit"
              placeholder="m3, bag, sheet"
            />
          </UFormField>
          <UFormField class="w-full" label="Unit price">
            <UInput class="w-full" v-model.number="draft.price" type="number" />
          </UFormField>
          <UFormField class="w-full" label="Stock quantity">
            <UInput
              class="w-full"
              v-model.number="draft.stock_quantity"
              type="number"
            />
          </UFormField>
          <UFormField class="w-full" label="Minimum stock">
            <UInput
              class="w-full"
              v-model.number="draft.minimum_stock_quantity"
              type="number"
            />
          </UFormField>
        </div>

        <UFormField class="w-full" label="Description">
          <UTextarea
            class="w-full"
            v-model="draft.description"
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
                class="w-full"
                v-model="draft.handbook_summary"
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
                  class="w-full"
                  v-model="draft.handbook_features"
                  placeholder="Consistent batching&#10;Structural-grade supply&#10;Site-ready delivery"
                />
              </UFormField>
              <UFormField
                class="w-full"
                label="Applications"
                description="One use case per line"
              >
                <UTextarea
                  class="w-full"
                  v-model="draft.handbook_applications"
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
                class="w-full"
                v-model="draft.handbook_specifications"
                placeholder="Strength Class: 25 MPa&#10;Unit of Measure: m3&#10;Supply Format: Delivered ready-mix"
              />
            </UFormField>
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div
          class="rounded-[28px] border border-slate-200/80 bg-gradient-to-br from-stone-50 via-white to-sky-50 p-6"
        >
          <p class="text-xs uppercase tracking-[0.2em] text-slate-500">
            Category Context
          </p>
          <h3 class="mt-2 text-xl font-semibold text-slate-900">
            {{ selectedCategory?.name ?? "Select a category" }}
          </h3>
          <p class="mt-3 text-sm leading-6 text-slate-600">
            {{
              selectedCategory?.overview ??
              selectedCategory?.description ??
              "Choose a category to load its handbook context and buying notes."
            }}
          </p>

          <div
            v-if="selectedCategory?.featured_specs?.length"
            class="mt-5 grid gap-3"
          >
            <div
              v-for="spec in selectedCategory.featured_specs"
              :key="spec.label"
              class="rounded-2xl border border-white/70 bg-white/80 p-4"
            >
              <p class="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                {{ spec.label }}
              </p>
              <p class="mt-2 font-medium text-slate-800">
                {{ spec.value }}
              </p>
            </div>
          </div>
        </div>

        <div
          v-if="selectedCategory?.typical_uses?.length || selectedCategory?.buying_considerations?.length"
          class="grid gap-4"
        >
          <div
            v-if="selectedCategory?.typical_uses?.length"
            class="rounded-2xl border border-slate-200/70 p-5"
          >
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Typical Uses
            </p>
            <ul class="mt-3 grid gap-2 text-sm text-slate-600">
              <li
                v-for="item in selectedCategory.typical_uses"
                :key="item"
              >
                {{ item }}
              </li>
            </ul>
          </div>

          <div
            v-if="selectedCategory?.buying_considerations?.length"
            class="rounded-2xl border border-slate-200/70 p-5"
          >
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Buying Notes
            </p>
            <ul class="mt-3 grid gap-2 text-sm text-slate-600">
              <li
                v-for="item in selectedCategory.buying_considerations"
                :key="item"
              >
                {{ item }}
              </li>
            </ul>
          </div>
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
      <USwitch v-model="draft.is_active" />
    </div>

    <div class="mt-6 flex justify-end gap-2">
      <UButton color="neutral" variant="ghost" :to="props.cancelTo">
        Cancel
      </UButton>
      <UButton color="primary" @click="submit">
        {{ props.submitLabel }}
      </UButton>
    </div>
  </UCard>
</template>
