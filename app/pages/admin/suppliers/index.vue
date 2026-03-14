<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { Supplier } from "~/types/supplier";
import SupplierHeader from "./_components/SupplierHeader.vue";
import SupplierTable from "./_components/SupplierTable.vue";
import SupplierEditModal from "./_components/SupplierEditModal.vue";

definePageMeta({
  layout: "admin",
});

const supplierStore = useSupplierStore();
const productStore = useProductStore();

await Promise.all([
  supplierStore.fetchSuppliers(),
  productStore.fetchProducts(),
]);

const { suppliers } = storeToRefs(supplierStore);
const { products } = storeToRefs(productStore);

const selectedSupplier = ref<Supplier | null>(null);
const editOpen = ref(false);

const openEdit = (supplier: Supplier) => {
  selectedSupplier.value = supplier;
  editOpen.value = true;
};
</script>

<template>
  <div class="min-h-screen">
    <div class="space-y-6">
      <SupplierHeader :total="suppliers.length" />
      <SupplierTable
        :suppliers="suppliers"
        :products="products"
        @edit="openEdit"
      />
    </div>
  </div>

  <!-- <SupplierEditModal
    :open="editOpen"
    :category="selectedSupplier"
    @update:open="editOpen = $event"
  /> -->
</template>
