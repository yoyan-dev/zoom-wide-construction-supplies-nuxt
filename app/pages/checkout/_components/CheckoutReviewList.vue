<script setup lang="ts">
import type { CartLineItem } from "~/types/cart";
import { formatCurrency } from "~/utils/format";

defineProps<{
  items: CartLineItem[];
}>();
</script>

<template>
  <div class="space-y-5">
    <StorefrontSectionCard
      v-for="item in items"
      :key="item.product_id"
      class="overflow-hidden bg-white"
      padding="lg"
    >
      <div class="flex flex-col gap-5 md:flex-row md:items-center">
        <NuxtLink
          :to="`/shop/${item.product_id}`"
          class="h-28 w-full overflow-hidden rounded-xl bg-slate-100 md:w-28 md:min-w-28"
        >
          <NuxtImg
            :src="
              item.image_url ||
              `https://placehold.co/320x320/e2e8f0/0f172a?text=${encodeURIComponent(item.name)}`
            "
            :alt="item.name"
            class="h-full w-full object-cover"
            loading="lazy"
          />
        </NuxtLink>

        <div class="flex-1">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p
                class="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-amber-700"
              >
                {{ item.category_id ? "Catalog item" : "Project supply" }}
              </p>
              <NuxtLink
                :to="`/shop/${item.product_id}`"
                class="mt-1 block text-xl font-bold tracking-tight text-slate-950 transition hover:text-[#004687]"
              >
                {{ item.name }}
              </NuxtLink>
              <p
                class="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500"
              >
                <span v-if="item.sku">SKU {{ item.sku }}</span>
                <span v-if="item.sku"> / </span>
                <span>{{ item.unit }}</span>
              </p>
            </div>

            <div
              class="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-right"
            >
              <p
                class="text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-slate-500"
              >
                Quantity
              </p>
              <p class="mt-1 text-lg font-bold tracking-tight text-slate-950">
                {{ item.quantity }}
              </p>
            </div>
          </div>

          <div
            class="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
          >
            <p class="text-sm leading-7 text-slate-600">
              Final quantity changes can still be made from the cart before the
              order is submitted.
            </p>

            <div class="text-right">
              <p
                class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500"
              >
                Unit {{ formatCurrency(item.price) }}
              </p>
              <p class="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                {{ formatCurrency(item.price * item.quantity) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </StorefrontSectionCard>
  </div>
</template>
