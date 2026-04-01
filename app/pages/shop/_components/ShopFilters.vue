<script setup lang="ts">
const props = defineProps<{
  categoryId: string;
  categoryOptions: Array<{ label: string; value: string }>;
  supplier: string;
  supplierOptions: Array<{ label: string; value: string }>;
  maxPrice: number | null;
  maxPriceLimit: number;
  search: string;
}>();

const emit = defineEmits<{
  (e: "update:categoryId", value: string): void;
  (e: "update:supplier", value: string): void;
  (e: "update:maxPrice", value: number | null): void;
}>();

const hasCategoryFilter = computed(() => props.categoryId !== "all");
const hasSupplierFilter = computed(() => props.supplier !== "all");
const categoryTotal = computed(() => Math.max(props.categoryOptions.length - 1, 0));

const quickCategories = computed(() => {
  if (!props.categoryOptions.length) {
    return [];
  }

  const allOption = props.categoryOptions.find((option) => option.value === "all");
  const featuredOptions = props.categoryOptions
    .filter((option) => option.value !== "all")
    .slice(0, 6);
  const activeOption =
    props.categoryId !== "all"
      ? props.categoryOptions.find((option) => option.value === props.categoryId)
      : null;

  if (
    activeOption &&
    !featuredOptions.some((option) => option.value === activeOption.value)
  ) {
    featuredOptions.push(activeOption);
  }

  return allOption ? [allOption, ...featuredOptions] : featuredOptions;
});

const updateCategory = (value: string) => {
  emit("update:categoryId", value);
};

const updateSupplier = (value: string) => {
  emit("update:supplier", value);
};

const updateMaxPrice = (value: number | null) => {
  if (value === null || !Number.isFinite(value) || value < 0) {
    emit("update:maxPrice", null);
    return;
  }

  emit("update:maxPrice", value);
};

const normalizedMaxPrice = computed(() =>
  props.maxPrice === null ? "" : String(props.maxPrice),
);
</script>

<template>
  <section class="rounded-xl bg-white/95 shadow-sm p-5 md:p-6 xl:sticky xl:top-24">
    <div class="space-y-5">
      <div>
        <p class="text-xs font-medium uppercase tracking-[0.2em] text-amber-700">
          Catalog Filters
        </p>
        <h2 class="mt-2 text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">
          Refine results
        </h2>
      </div>

      <div class="space-y-3">
        <div class="flex items-center justify-between gap-3">
          <p class="text-xs uppercase tracking-[0.16em] text-slate-500">
            Category
          </p>
          <UBadge color="neutral" variant="subtle">
            {{ categoryTotal }}
          </UBadge>
        </div>
        <USelect
          :items="props.categoryOptions"
          :model-value="props.categoryId"
          placeholder="All categories"
          size="xl"
          @update:model-value="updateCategory(String($event))"
        />
      </div>

      <div class="space-y-3">
        <div class="flex items-center justify-between gap-3">
          <p class="text-xs uppercase tracking-[0.16em] text-slate-500">
            Supplier
          </p>
          <UBadge color="neutral" variant="subtle">
            {{ props.supplierOptions.length - 1 }}
          </UBadge>
        </div>
        <USelect
          :items="props.supplierOptions"
          :model-value="props.supplier"
          placeholder="All suppliers"
          size="xl"
          @update:model-value="updateSupplier(String($event))"
        />
      </div>

      <div class="space-y-3">
        <div class="flex items-center justify-between gap-3">
          <p class="text-xs uppercase tracking-[0.16em] text-slate-500">
            Max unit price
          </p>
          <span class="text-sm font-semibold text-slate-700">
            {{ props.maxPriceLimit ? `Up to ${props.maxPriceLimit}` : "Any" }}
          </span>
        </div>
        <UInput
          type="number"
          :min="0"
          :max="props.maxPriceLimit || undefined"
          :model-value="normalizedMaxPrice"
          placeholder="No max limit"
          size="xl"
          @update:model-value="
            updateMaxPrice(String($event).trim() ? Number($event) : null)
          "
        />
      </div>

      <div class="rounded-lg bg-slate-50/80 px-4 py-3 text-sm leading-6 text-slate-600">
        <span v-if="props.search">
          Search is active for "{{ props.search }}". Combine supplier and price to
          reduce product noise.
        </span>
        <span v-else>
          Use category, supplier, and max-price filters to narrow the catalog before
          opening product details.
        </span>
      </div>

      <div class="flex flex-wrap gap-2">
        <UButton
          v-for="option in quickCategories"
          :key="option.value"
          color="neutral"
          :variant="option.value === props.categoryId ? 'solid' : 'soft'"
          size="sm"
          class="rounded-lg"
          @click="updateCategory(option.value)"
        >
          {{ option.label }}
        </UButton>
      </div>

      <div class="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
        <UButton
          v-if="hasCategoryFilter || hasSupplierFilter || props.maxPrice !== null"
          color="neutral"
          variant="outline"
          class="rounded-lg font-semibold justify-center"
          @click="
            updateCategory('all');
            updateSupplier('all');
            updateMaxPrice(null);
          "
        >
          Reset filters
        </UButton>

        <UButton color="warning" variant="soft" to="/shop/categories" class="rounded-lg font-semibold shadow-sm justify-center">
          Browse categories
        </UButton>
      </div>
    </div>
  </section>
</template>
