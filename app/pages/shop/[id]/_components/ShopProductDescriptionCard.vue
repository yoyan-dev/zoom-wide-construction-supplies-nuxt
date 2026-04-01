<script setup lang="ts">
import type { Product } from "~/types/product";

const props = defineProps<{
  product: Product;
}>();

const activeTab = ref<"details" | "applications" | "specifications">("details");

const featureList = computed(() => props.product.handbook?.features ?? []);
const applicationList = computed(() => props.product.handbook?.applications ?? []);
const specificationList = computed(
  () => props.product.handbook?.specifications ?? [],
);

const productDescription = computed(
  () =>
    props.product.description?.trim() ||
    "No product description has been provided for this item.",
);

const handbookSummary = computed(
  () =>
    props.product.handbook?.summary?.trim() ||
    "No additional product summary is available.",
);
</script>

<template>
  <div class="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
    <UCard class="rounded-xl bg-white/95 shadow-sm">
      <div class="space-y-5">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-xs uppercase tracking-[0.16em] text-slate-500">
              Product Information
            </p>
            <h2 class="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Details and specifications
            </h2>
          </div>

          <div class="flex flex-wrap gap-2">
            <UButton
              color="neutral"
              size="sm"
              :variant="activeTab === 'details' ? 'solid' : 'soft'"
              class="rounded-lg"
              @click="activeTab = 'details'"
            >
              Details
            </UButton>
            <UButton
              color="neutral"
              size="sm"
              :variant="activeTab === 'applications' ? 'solid' : 'soft'"
              class="rounded-lg"
              @click="activeTab = 'applications'"
            >
              Uses
            </UButton>
            <UButton
              color="neutral"
              size="sm"
              :variant="activeTab === 'specifications' ? 'solid' : 'soft'"
              class="rounded-lg"
              @click="activeTab = 'specifications'"
            >
              Specs
            </UButton>
          </div>
        </div>

        <div v-if="activeTab === 'details'" class="space-y-4">
          <div class="rounded-lg bg-slate-50/80 p-4">
            <p class="text-xs uppercase tracking-[0.16em] text-slate-500">
              Description
            </p>
            <p class="mt-2 text-sm leading-7 text-slate-700">
              {{ productDescription }}
            </p>
          </div>
          <div class="rounded-lg bg-slate-50/80 p-4">
            <p class="text-xs uppercase tracking-[0.16em] text-slate-500">
              Product Summary
            </p>
            <p class="mt-2 text-sm leading-7 text-slate-700">
              {{ handbookSummary }}
            </p>
          </div>
        </div>

        <div v-else-if="activeTab === 'applications'" class="space-y-5">
          <div>
            <p class="text-xs uppercase tracking-[0.16em] text-slate-500">
              Key Features
            </p>
            <div v-if="featureList.length" class="mt-3 flex flex-wrap gap-2">
              <UBadge
                v-for="feature in featureList"
                :key="feature"
                color="info"
                variant="subtle"
              >
                {{ feature }}
              </UBadge>
            </div>
            <p v-else class="mt-3 text-sm text-slate-600">
              No key features listed.
            </p>
          </div>

          <div>
            <p class="text-xs uppercase tracking-[0.16em] text-slate-500">
              Typical Applications
            </p>
            <div v-if="applicationList.length" class="mt-3 grid gap-2">
              <div
                v-for="application in applicationList"
                :key="application"
                class="rounded-lg bg-slate-100/90 px-3 py-2 text-sm text-slate-700"
              >
                {{ application }}
              </div>
            </div>
            <p v-else class="mt-3 text-sm text-slate-600">
              No applications listed.
            </p>
          </div>
        </div>

        <div v-else class="space-y-4">
          <div
            v-if="specificationList.length"
            class="grid gap-3 md:grid-cols-2"
          >
            <div
              v-for="specification in specificationList"
              :key="`${specification.label}-${specification.value}`"
              class="rounded-lg bg-slate-50/80 p-4"
            >
              <p class="text-xs uppercase tracking-[0.16em] text-slate-500">
                {{ specification.label }}
              </p>
              <p class="mt-2 text-sm font-medium text-slate-800">
                {{ specification.value }}
              </p>
            </div>
          </div>
          <p v-else class="text-sm text-slate-600">
            No specifications have been added for this product.
          </p>
        </div>
      </div>
    </UCard>

    <UCard class="rounded-xl bg-white/95 shadow-sm">
      <div class="space-y-4">
        <p class="text-xs uppercase tracking-[0.16em] text-slate-500">
          Buyer Confidence
        </p>
        <div class="rounded-lg bg-slate-50/80 p-4">
          <p class="text-sm font-semibold text-slate-900">
            Stock visibility first
          </p>
          <p class="mt-2 text-sm leading-6 text-slate-600">
            Product stock is shown before checkout so teams can avoid sourcing delays.
          </p>
        </div>
        <div class="rounded-lg bg-slate-50/80 p-4">
          <p class="text-sm font-semibold text-slate-900">
            Fast next step
          </p>
          <p class="mt-2 text-sm leading-6 text-slate-600">
            Add the selected quantity to cart, then continue into checkout details.
          </p>
        </div>
        <div class="flex flex-col gap-2">
          <UButton color="neutral" variant="outline" class="rounded-lg font-semibold" to="/shop/help">
            View buyer help
          </UButton>
          <UButton color="warning" variant="soft" class="rounded-lg font-semibold" to="/cart">
            Open cart
          </UButton>
        </div>
      </div>
    </UCard>
  </div>
</template>
