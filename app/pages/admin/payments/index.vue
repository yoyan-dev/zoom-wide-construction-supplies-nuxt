<script setup lang="ts">
import { storeToRefs } from "pinia";
import PaymentsHeader from "./_components/PaymentsHeader.vue";
import PaymentsTable from "./_components/PaymentsTable.vue";

definePageMeta({
  layout: "admin",
});

const paymentStore = usePaymentStore();

await paymentStore.fetchPayments();

const { payments } = storeToRefs(paymentStore);
</script>

<template>
  <div class="min-h-screen">
    <div class="space-y-6">
      <PaymentsHeader :total="payments.length" />
      <PaymentsTable :payments="payments" />
    </div>
  </div>
</template>
