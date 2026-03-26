<script setup lang="ts">
import ShopProductDetailView from "./_components/ShopProductDetailView.vue";

definePageMeta({
  layout: "shop",
});

const route = useRoute();
const productId = computed(() => String(route.params.id));
</script>

<template>
  <ShopProductDetailView :product-id="productId" />
</template>
