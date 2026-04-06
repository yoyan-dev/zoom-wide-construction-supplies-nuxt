<script setup lang="ts">
import type { Category } from "~/types/category";
import { formatCurrency } from "~/utils/format";

const props = defineProps<{
  categories: Category[];
  activeCategoryId?: string;
  stockFilter?: string;
  maxPrice?: number | null;
  maxPriceLimit?: number;
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:categoryId", value: string): void;
  (e: "update:stockFilter", value: string): void;
  (e: "update:maxPrice", value: number | null): void;
  (e: "reset"): void;
}>();

const isExpanded = ref(false);

const sliderValue = computed(() =>
  props.maxPrice !== null && props.maxPrice !== undefined
    ? props.maxPrice
    : props.maxPriceLimit || 0,
);

const activeFilterCount = computed(() => {
  let count = 0;

  if (props.activeCategoryId) {
    count += 1;
  }

  if ((props.stockFilter || "all") !== "all") {
    count += 1;
  }

  if (props.maxPrice !== null && props.maxPrice !== undefined) {
    count += 1;
  }

  return count;
});

const stockOptions = [
  { label: "All stock", value: "all" },
  { label: "Ready for dispatch", value: "in-stock" },
  { label: "Low stock", value: "low-stock" },
  { label: "Out of stock", value: "out-of-stock" },
] as const;

const handlePriceInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = Number(target.value);

  if (!Number.isFinite(value) || !props.maxPriceLimit) {
    emit("update:maxPrice", null);
    return;
  }

  if (value >= props.maxPriceLimit) {
    emit("update:maxPrice", null);
    return;
  }

  emit("update:maxPrice", value);
};
</script>

<template>
  <div class="space-y-5">
    <StorefrontSectionCard padding="lg" class="lg:sticky lg:top-28">
      <div class="flex items-center justify-between gap-3">
        <div>
          <p
            class="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-amber-700"
          >
            Filters
          </p>
          <h2 class="mt-2 text-2xl font-bold tracking-tight text-slate-950">
            Narrow the catalog
          </h2>
          <p class="mt-2 text-sm text-slate-500 lg:hidden">
            {{
              activeFilterCount
                ? `${activeFilterCount} active filter${activeFilterCount === 1 ? "" : "s"}`
                : "Open filters to refine this catalog."
            }}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <StorefrontButton
            v-if="activeFilterCount"
            tone="ghost"
            size="sm"
            @click="emit('reset')"
          >
            Reset
          </StorefrontButton>

          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 lg:hidden"
            :aria-expanded="isExpanded"
            aria-label="Toggle catalog filters"
            @click="isExpanded = !isExpanded"
          >
            <UIcon
              :name="isExpanded ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
              class="text-base"
            />
          </button>
        </div>
      </div>

      <div :class="[isExpanded ? 'block' : 'hidden', 'mt-8 space-y-8 lg:block']">
        <div>
          <p
            class="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-500"
          >
            Category
          </p>
          <div class="mt-4 flex flex-col gap-2">
            <button
              type="button"
              class="rounded-xl border px-4 py-3 text-left text-sm font-medium transition"
              :class="
                !props.activeCategoryId
                  ? 'border-amber-300 bg-amber-50 text-amber-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              "
              @click="emit('update:categoryId', '')"
            >
              All categories
            </button>
            <button
              v-for="category in props.categories"
              :key="category.id"
              type="button"
              class="rounded-xl border px-4 py-3 text-left text-sm font-medium transition"
              :class="
                category.id === props.activeCategoryId
                  ? 'border-amber-300 bg-amber-50 text-amber-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              "
              @click="emit('update:categoryId', category.id)"
            >
              {{ category.name }}
            </button>
          </div>
        </div>

        <div>
          <p
            class="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-500"
          >
            Stock status
          </p>
          <div class="mt-4 flex flex-wrap gap-2">
            <button
              v-for="option in stockOptions"
              :key="option.value"
              type="button"
              class="rounded-lg border px-3 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.14em] transition"
              :class="
                (props.stockFilter || 'all') === option.value
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              "
              @click="emit('update:stockFilter', option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between gap-3">
            <p
              class="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-500"
            >
              Price cap
            </p>
            <span class="text-sm font-semibold text-slate-900">
              {{
                props.maxPriceLimit ? formatCurrency(sliderValue) : "No data"
              }}
            </span>
          </div>

          <div class="mt-4">
            <input
              class="h-1.5 w-full cursor-pointer accent-amber-500"
              type="range"
              min="0"
              :max="props.maxPriceLimit || 0"
              :step="50"
              :value="sliderValue"
              :disabled="!props.maxPriceLimit"
              @input="handlePriceInput"
            />
          </div>

          <div
            class="mt-3 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-slate-500"
          >
            <span>{{ formatCurrency(0) }}</span>
            <span>{{
              props.maxPriceLimit
                ? formatCurrency(props.maxPriceLimit)
                : "No price data"
            }}</span>
          </div>
        </div>
      </div>
    </StorefrontSectionCard>
  </div>
</template>
