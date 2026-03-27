<script setup lang="ts">
import PaymentsListView from "~/pages/admin/payments/_components/PaymentsListView.vue";

definePageMeta({
  layout: "finance",
});
</script>

<template>
  <PaymentsListView detail-base-path="/finance/payments" />
</template>
