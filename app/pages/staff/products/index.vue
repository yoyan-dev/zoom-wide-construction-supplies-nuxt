<script setup lang="ts">
import { storeToRefs } from "pinia";
import StaffProductsOverview from "./_components/StaffProductsOverview.vue";
import StaffProductsTable from "./_components/StaffProductsTable.vue";

definePageMeta({
  layout: "staff",
});

const productStore = useProductStore();
await productStore.fetchProducts();

const { products } = storeToRefs(productStore);

const sortedProducts = computed(() =>
  [...products.value].sort((left, right) => {
    const leftPressure =
      (left.stock_quantity ?? 0) - (left.minimum_stock_quantity ?? 0);
    const rightPressure =
      (right.stock_quantity ?? 0) - (right.minimum_stock_quantity ?? 0);
    return leftPressure - rightPressure;
  }),
);

const lowStock = computed(
  () =>
    products.value.filter((product) => {
      const minimum = product.minimum_stock_quantity ?? 0;
      return minimum > 0 && (product.stock_quantity ?? 0) <= minimum;
    }).length,
);

const active = computed(
  () => products.value.filter((product) => product.is_active).length,
);

const warehouses = computed(
  () =>
    new Set(
      products.value
        .map((product) => product.warehouse?.name ?? product.warehouse_id)
        .filter(Boolean),
    ).size,
);
</script>

<template>
  <div class="min-h-screen space-y-6">
    <StaffProductsOverview
      :total="products.length"
      :low-stock="lowStock"
      :active="active"
      :warehouses="warehouses"
    />

    <StaffProductsTable :products="sortedProducts" />
  </div>
</template>
