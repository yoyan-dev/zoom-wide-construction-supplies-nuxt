<script setup lang="ts">
import { storeToRefs } from "pinia";
import CustomersHeader from "./_components/CustomersHeader.vue";
import CustomersTable from "./_components/CustomersTable.vue";

definePageMeta({
  layout: "admin",
});

const customerStore = useCustomerStore();

await customerStore.fetchCustomers();

const { customers } = storeToRefs(customerStore);
</script>

<template>
  <div class="min-h-screen">
    <div class="space-y-6">
      <CustomersHeader :total="customers.length" />
      <CustomersTable :customers="customers" />
    </div>
  </div>
</template>
