<script setup lang="ts">
import { storeToRefs } from "pinia";
import InventoryHeader from "./_components/table/InventoryHeader.vue";
import InventoryTable from "./_components/table/InventoryTable.vue";
import AddInventoryModal from "./_components/modals/AddInventoryModal.vue";
import { useModal } from "~/composables/admin/useModal";

definePageMeta({
  layout: "admin",
});

const inventoryStore = useInventoryStore();
const productStore = useProductStore();
const { openModal } = useModal();

await Promise.all([
  inventoryStore.fetchInventoryLogs(),
  productStore.fetchProducts(),
]);

const { logs } = storeToRefs(inventoryStore);
const { products } = storeToRefs(productStore);

const handleCreate = () => {
  openModal(AddInventoryModal);
};
</script>

<template>
  <div class="min-h-screen">
    <div class="space-y-6">
      <InventoryHeader :total="logs.length" @create="handleCreate" />
      <InventoryTable :logs="logs" :products="products" />
    </div>
  </div>
</template>
