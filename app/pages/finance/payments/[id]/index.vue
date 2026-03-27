<script setup lang="ts">
import PaymentDetailView from "~/pages/admin/payments/_components/detail/PaymentDetailView.vue";

definePageMeta({
  layout: "finance",
});
</script>

<template>
  <PaymentDetailView back-to="/finance/payments" />
</template>
