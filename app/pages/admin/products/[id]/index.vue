<script setup lang="ts">
import { storeToRefs } from "pinia";
import { formatCurrency, formatLongDate } from "~/utils/format";
import { getInventoryBalance } from "~/utils/inventory-balance";
import { getWarehouseNameById } from "~/utils/warehouse";

definePageMeta({
  layout: "admin",
});

const route = useRoute();
const router = useRouter();
const productId = computed(() => String(route.params.id));

const productStore = useProductStore();
const categoryStore = useCategoryStore();
const supplierStore = useSupplierStore();
const inventoryStore = useInventoryStore();
const warehouseStore = useWarehouseStore();

await Promise.all([
  productStore.fetchProductById(productId.value),
  categoryStore.fetchCategories(),
  supplierStore.fetchSuppliers(),
  inventoryStore.fetchInventoryLogs(),
  warehouseStore.fetchWarehouses(),
]);

const { product } = storeToRefs(productStore);
const { logs } = storeToRefs(inventoryStore);
const { warehouses } = storeToRefs(warehouseStore);

const specifications = computed(() => product.value?.handbook?.specifications ?? []);
const features = computed(() => product.value?.handbook?.features ?? []);
const applications = computed(() => product.value?.handbook?.applications ?? []);
const currentStock = computed(() =>
  getInventoryBalance(
    logs.value,
    product.value?.id,
    product.value?.stock_quantity ?? 0,
  ),
);
const warehouseName = computed(
  () => getWarehouseNameById(product.value?.warehouse_id, warehouses.value) ?? "Unassigned",
);

function goBack() {
  router.push("/admin/products");
}

function editProduct() {
  router.push(`/admin/products/edit/${productId.value}`);
}
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
              Catalog Management
            </p>
            <h1 class="mt-2 text-2xl font-semibold">
              {{ product?.name ?? "Product details" }}
            </h1>
            <p class="mt-2 text-sm text-slate-600">
              Review pricing, handbook details, stock position, and category context.
            </p>
          </div>

          <div class="flex gap-2">
            <UButton color="neutral" variant="outline" @click="goBack">
              Back
            </UButton>
            <UButton color="primary" @click="editProduct">Edit Product</UButton>
          </div>
        </div>
      </section>

      <div v-if="product" class="space-y-6">
        <div class="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <UCard>
            <div class="overflow-hidden rounded-[28px] border border-slate-200/70">
              <img
                v-if="product.image_url"
                :src="product.image_url"
                :alt="product.name ?? 'Product image'"
                class="h-72 w-full object-cover"
              />
              <div
                v-else
                class="flex h-72 items-center justify-center bg-slate-100 text-slate-400"
              >
                No Image
              </div>
            </div>

            <div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <p class="text-xs uppercase tracking-[0.18em] text-slate-500">SKU</p>
                <p class="mt-2 font-medium text-slate-900">{{ product.sku }}</p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Price</p>
                <p class="mt-2 font-medium text-slate-900">
                  {{ formatCurrency(product.price) }}
                </p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Stock</p>
                <p class="mt-2 font-medium text-slate-900">
                  {{ currentStock }} {{ product.unit }}
                </p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Minimum Stock
                </p>
                <p class="mt-2 font-medium text-slate-900">
                  {{ product.minimum_stock_quantity }} {{ product.unit }}
                </p>
              </div>
            </div>
          </UCard>

          <UCard>
            <div class="space-y-5">
              <div>
                <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Category
                </p>
                <p class="mt-2 text-lg font-semibold text-slate-900">
                  {{ product.category?.name ?? "Unassigned" }}
                </p>
                <p class="mt-2 text-sm leading-6 text-slate-600">
                  {{
                    product.category?.overview ??
                    product.category?.description ??
                    "No category overview available."
                  }}
                </p>
              </div>

              <div class="grid gap-4 sm:grid-cols-2">
                <div>
                  <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Supplier
                  </p>
                  <p class="mt-2 text-sm text-slate-700">
                    {{ product.supplier?.name ?? "No supplier" }}
                  </p>
                </div>
                <div>
                  <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Stock Warehouse
                  </p>
                  <p class="mt-2 text-sm text-slate-700">
                    {{ warehouseName }}
                  </p>
                </div>
                <div>
                  <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Status
                  </p>
                  <UBadge
                    :color="product.is_active ? 'success' : 'neutral'"
                    variant="subtle"
                    class="mt-2"
                  >
                    {{ product.is_active ? "Active" : "Inactive" }}
                  </UBadge>
                </div>
              </div>

              <div>
                <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Description
                </p>
                <p class="mt-2 text-sm leading-6 text-slate-600">
                  {{ product.description ?? "No description available." }}
                </p>
              </div>
            </div>
          </UCard>
        </div>

        <UCard>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Handbook Overview
          </p>
          <h2 class="mt-2 text-xl font-semibold text-slate-900">
            Product Guidance
          </h2>
          <p class="mt-3 text-sm leading-7 text-slate-700">
            {{
              product.handbook?.summary ??
              product.description ??
              "No handbook summary available."
            }}
          </p>
        </UCard>

        <div class="grid gap-6 lg:grid-cols-3">
          <UCard>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Key Features
            </p>
            <ul class="mt-4 grid gap-2 text-sm text-slate-600">
              <li v-for="item in features" :key="item">{{ item }}</li>
              <li v-if="!features.length" class="text-slate-400">
                No feature notes available.
              </li>
            </ul>
          </UCard>

          <UCard>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Applications
            </p>
            <ul class="mt-4 grid gap-2 text-sm text-slate-600">
              <li v-for="item in applications" :key="item">{{ item }}</li>
              <li v-if="!applications.length" class="text-slate-400">
                No application notes available.
              </li>
            </ul>
          </UCard>

          <UCard>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Category Buying Notes
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
                No category buying notes available.
              </li>
            </ul>
          </UCard>
        </div>

        <UCard>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Specifications
          </p>
          <div class="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
              No product specifications available.
            </p>
          </div>
        </UCard>

        <UCard>
          <div class="grid gap-4 md:grid-cols-2 text-sm">
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Created At
              </p>
              <p class="mt-2 text-slate-700">
                {{ product.created_at ? formatLongDate(product.created_at) : "N/A" }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Last Updated
              </p>
              <p class="mt-2 text-slate-700">
                {{ product.updated_at ? formatLongDate(product.updated_at) : "N/A" }}
              </p>
            </div>
          </div>
        </UCard>
      </div>

      <UCard v-else>
        <p class="text-sm text-slate-600">
          Product not found. Check the URL or return to the products list.
        </p>
      </UCard>
    </div>
  </div>
</template>
