<script setup lang="ts">
import { storeToRefs } from "pinia";
import { formatCurrency } from "~/utils/format";
import { getInventoryBalance } from "~/utils/inventory-balance";

definePageMeta({
  layout: "shop",
});

const route = useRoute();
const productId = computed(() => String(route.params.id));

const productStore = useProductStore();
const categoryStore = useCategoryStore();
const supplierStore = useSupplierStore();
const inventoryStore = useInventoryStore();

await Promise.all([
  productStore.fetchProductById(productId.value),
  categoryStore.fetchCategories(),
  supplierStore.fetchSuppliers(),
  inventoryStore.fetchInventoryLogs(),
]);

const { product } = storeToRefs(productStore);
const { logs } = storeToRefs(inventoryStore);

const features = computed(() => product.value?.handbook?.features ?? []);
const applications = computed(() => product.value?.handbook?.applications ?? []);
const specifications = computed(() => product.value?.handbook?.specifications ?? []);
const currentStock = computed(() =>
  getInventoryBalance(
    logs.value,
    product.value?.id,
    product.value?.stock_quantity ?? 0,
  ),
);
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <div class="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <section
        v-if="product"
        class="grid gap-8 rounded-[32px] bg-white p-8 shadow-sm ring-1 ring-slate-200/70 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]"
      >
        <div class="space-y-6">
          <div class="overflow-hidden rounded-[28px] border border-slate-200/70">
            <img
              v-if="product.image_url"
              :src="product.image_url"
              :alt="product.name ?? 'Product image'"
              class="h-[420px] w-full object-cover"
            />
            <div
              v-else
              class="flex h-[420px] items-center justify-center bg-slate-100 text-slate-400"
            >
              No product image
            </div>
          </div>

          <div class="grid gap-4 md:grid-cols-3">
            <div class="rounded-2xl border border-slate-200/70 p-4">
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Price
              </p>
              <p class="mt-2 text-lg font-semibold text-slate-900">
                {{ formatCurrency(product.price) }}
              </p>
            </div>
            <div class="rounded-2xl border border-slate-200/70 p-4">
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Unit
              </p>
              <p class="mt-2 text-lg font-semibold text-slate-900">
                {{ product.unit }}
              </p>
            </div>
            <div class="rounded-2xl border border-slate-200/70 p-4">
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Available Stock
              </p>
              <p class="mt-2 text-lg font-semibold text-slate-900">
                {{ currentStock }} {{ product.unit }}
              </p>
            </div>
            <div class="rounded-2xl border border-slate-200/70 p-4">
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Category
              </p>
              <p class="mt-2 text-lg font-semibold text-slate-900">
                {{ product.category?.name ?? "Unassigned" }}
              </p>
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-slate-500">
              Product Reference
            </p>
            <h1 class="mt-3 text-3xl font-semibold text-slate-900">
              {{ product.name }}
            </h1>
            <p class="mt-2 text-sm text-slate-500">{{ product.sku }}</p>
            <p class="mt-5 text-sm leading-7 text-slate-600">
              {{
                product.handbook?.summary ??
                product.description ??
                "No product summary available."
              }}
            </p>
          </div>

          <div class="rounded-2xl border border-slate-200/70 p-5">
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Category Guidance
            </p>
            <p class="mt-3 text-sm leading-6 text-slate-600">
              {{
                product.category?.overview ??
                product.category?.description ??
                "No category overview available."
              }}
            </p>
          </div>

          <div class="grid gap-4 lg:grid-cols-2">
            <div class="rounded-2xl border border-slate-200/70 p-5">
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Key Features
              </p>
              <ul class="mt-3 grid gap-2 text-sm text-slate-600">
                <li v-for="item in features" :key="item">{{ item }}</li>
                <li v-if="!features.length" class="text-slate-400">
                  No feature notes available.
                </li>
              </ul>
            </div>

            <div class="rounded-2xl border border-slate-200/70 p-5">
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Applications
              </p>
              <ul class="mt-3 grid gap-2 text-sm text-slate-600">
                <li v-for="item in applications" :key="item">{{ item }}</li>
                <li v-if="!applications.length" class="text-slate-400">
                  No application notes available.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section v-if="product" class="grid gap-6 lg:grid-cols-2">
        <div class="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Specifications
          </p>
          <div class="mt-4 grid gap-3">
            <div
              v-for="spec in specifications"
              :key="spec.label"
              class="rounded-2xl border border-slate-200/70 p-4"
            >
              <p class="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                {{ spec.label }}
              </p>
              <p class="mt-2 font-medium text-slate-900">
                {{ spec.value }}
              </p>
            </div>
            <p v-if="!specifications.length" class="text-sm text-slate-400">
              No specification details available.
            </p>
          </div>
        </div>

        <div class="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Buying Notes
          </p>
          <ul class="mt-4 grid gap-2 text-sm text-slate-600">
            <li
              v-for="item in product.category?.buying_considerations ?? []"
              :key="item"
            >
              {{ item }}
            </li>
            <li
              v-if="!(product.category?.buying_considerations?.length)"
              class="text-slate-400"
            >
              No buying notes available.
            </li>
          </ul>

          <div class="mt-6 rounded-2xl border border-slate-200/70 p-4">
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Supplier
            </p>
            <p class="mt-2 text-sm font-medium text-slate-900">
              {{ product.supplier?.name ?? "No supplier assigned" }}
            </p>
          </div>
        </div>
      </section>

      <UCard v-if="!product">
        <p class="text-sm text-slate-600">
          Product not found. Go back to categories or pick another catalog item.
        </p>
      </UCard>
    </div>
  </div>
</template>
