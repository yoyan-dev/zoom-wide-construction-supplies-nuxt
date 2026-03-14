<script setup lang="ts">
import { storeToRefs } from "pinia";
import InventoryHeader from "./_components/InventoryHeader.vue";
import InventoryTable from "./_components/InventoryTable.vue";

definePageMeta({
  layout: "admin",
});

const inventoryStore = useInventoryStore();
const productStore = useProductStore();

await Promise.all([
  inventoryStore.fetchInventoryLogs(),
  productStore.fetchProducts(),
]);

const { logs } = storeToRefs(inventoryStore);
const { products } = storeToRefs(productStore);
</script>

<template>
  <div class="min-h-screen">
    <div class="space-y-6">
      <InventoryHeader :total="logs.length" />
      <InventoryTable :logs="logs" :products="products" />
    </div>
  </div>
</template>
