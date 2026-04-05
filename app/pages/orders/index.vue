<script setup lang="ts">
import MyOrdersPageView from "./_components/MyOrdersPageView.vue";

definePageMeta({
  layout: "shop",
});

useSeoMeta({
  title: "My Orders | ZOOM WIDE Construction Supplies",
  description:
    "Review submitted customer orders, filter order history, and continue to tracking from the ZOOM WIDE storefront.",
});
</script>

<template>
  <MyOrdersPageView />
</template>
