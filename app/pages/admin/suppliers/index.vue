<script setup lang="ts">
import { storeToRefs } from "pinia";
import SupplierHeader from "./_components/table/SupplierHeader.vue";
import SupplierTable from "./_components/table/SupplierTable.vue";
import AddSupplierModal from "./_components/modals/AddSupplierModal.vue";
import { useModal } from "~/composables/admin/useModal";

definePageMeta({
  layout: "admin",
});

const supplierStore = useSupplierStore();
const productStore = useProductStore();
const { openModal } = useModal();

await Promise.all([
  supplierStore.fetchSuppliers(),
  productStore.fetchProducts(),
]);

const { suppliers } = storeToRefs(supplierStore);
const { products } = storeToRefs(productStore);

const handleCreate = () => {
  openModal(AddSupplierModal);
};
</script>

<template>
  <div class="min-h-screen">
    <div class="space-y-6">
      <SupplierHeader :total="suppliers.length" @create="handleCreate" />
      <SupplierTable :suppliers="suppliers" :products="products" />
    </div>
  </div>
</template>
