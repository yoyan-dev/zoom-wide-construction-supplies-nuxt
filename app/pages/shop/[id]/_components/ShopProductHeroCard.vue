<script setup lang="ts">
import type { Product } from "~/types/product";
import { formatCurrency, formatNumber } from "~/utils/format";

const props = defineProps<{
  product: Product;
}>();

const productInitial = computed(
  () => props.product.name?.slice(0, 1).toUpperCase() ?? "P",
);

type GalleryItem = {
  id: string;
  label: string;
  imageUrl: string | null;
};

const galleryItems = computed<GalleryItem[]>(() => {
  const mainImage = props.product.image_url?.trim() || null;

  return [
    { id: "main", label: "Main", imageUrl: mainImage },
    { id: "detail", label: "Detail", imageUrl: mainImage },
    { id: "spec", label: "Spec View", imageUrl: mainImage },
  ];
});

const activeGalleryItemId = ref("main");

watch(
  () => props.product.id,
  () => {
    activeGalleryItemId.value = "main";
  },
);

const activeGalleryItem = computed(
  () =>
    galleryItems.value.find((item) => item.id === activeGalleryItemId.value) ??
    galleryItems.value[0],
);
</script>

<template>
  <UCard class="rounded-xl bg-white/95 shadow-sm">
    <div
      class="relative flex h-[380px] items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-slate-100 via-white to-amber-50 md:h-[460px]"
    >
      <NuxtImg
        v-if="activeGalleryItem?.imageUrl"
        :src="activeGalleryItem.imageUrl"
        :alt="props.product.name ?? 'Product image'"
        class="h-full w-full object-cover"
        width="960"
        height="720"
      />
      <div v-else class="text-center">
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Product
        </p>
        <p class="mt-3 text-5xl font-semibold text-slate-800">
          {{ productInitial }}
        </p>
      </div>

      <div class="absolute inset-x-4 top-4 flex items-center justify-between gap-2">
        <UBadge color="neutral" variant="solid">
          {{ props.product.category?.name ?? "Catalog item" }}
        </UBadge>
        <div class="rounded-full bg-white/95 px-3 py-1 text-sm font-semibold text-slate-900 shadow-sm">
          {{ formatCurrency(props.product.price ?? 0) }}
        </div>
      </div>
    </div>

    <div class="mt-4 flex gap-2 overflow-x-auto pb-1">
      <button
        v-for="item in galleryItems"
        :key="item.id"
        type="button"
        class="group shrink-0 rounded-lg p-1 transition"
        :class="
          item.id === activeGalleryItemId
            ? 'bg-amber-100'
            : 'bg-slate-100 hover:bg-slate-200'
        "
        @click="activeGalleryItemId = item.id"
      >
        <div class="flex h-14 w-14 items-center justify-center overflow-hidden rounded-md bg-white">
          <NuxtImg
            v-if="item.imageUrl"
            :src="item.imageUrl"
            :alt="item.label"
            class="h-full w-full object-cover"
            width="112"
            height="112"
          />
          <span v-else class="text-xs font-semibold text-slate-500">
            {{ item.label.slice(0, 1) }}
          </span>
        </div>
      </button>
    </div>

    <div class="mt-6 grid gap-3 sm:grid-cols-3">
      <div class="rounded-lg bg-slate-50/80 p-4">
        <p class="text-xs uppercase tracking-[0.16em] text-slate-500">
          Unit Price
        </p>
        <p class="mt-2 text-lg font-semibold text-slate-800">
          {{ formatCurrency(props.product.price ?? 0) }}
        </p>
      </div>
      <div class="rounded-lg bg-slate-50/80 p-4">
        <p class="text-xs uppercase tracking-[0.16em] text-slate-500">
          Stock On Hand
        </p>
        <p class="mt-2 text-lg font-semibold text-slate-800">
          {{ formatNumber(props.product.stock_quantity ?? 0) }}
        </p>
      </div>
      <div class="rounded-lg bg-slate-50/80 p-4">
        <p class="text-xs uppercase tracking-[0.16em] text-slate-500">
          Minimum Stock
        </p>
        <p class="mt-2 text-lg font-semibold text-slate-800">
          {{ formatNumber(props.product.minimum_stock_quantity ?? 0) }}
        </p>
      </div>
    </div>
  </UCard>
</template>
