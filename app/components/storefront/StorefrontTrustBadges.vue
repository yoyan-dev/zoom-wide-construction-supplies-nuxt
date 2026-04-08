<script setup lang="ts">
type TrustBadge = {
  icon: string;
  title: string;
  description: string;
};

const props = withDefaults(
  defineProps<{
    items?: TrustBadge[];
    compact?: boolean;
  }>(),
  {
    items: () => [
      {
        icon: "i-lucide-shield-check",
        title: "Verified supply",
        description: "Product details stay tied to live stock and pricing records.",
      },
      {
        icon: "i-lucide-truck",
        title: "Delivery planning",
        description: "Freight details are reviewed before order submission.",
      },
      {
        icon: "i-lucide-headphones",
        title: "Project support",
        description: "Customer orders remain easy to review after checkout.",
      },
    ],
    compact: false,
  },
);
</script>

<template>
  <div
    :class="[
      'grid gap-3',
      props.compact ? 'sm:grid-cols-3' : 'md:grid-cols-3',
    ]"
  >
    <div
      v-for="item in props.items"
      :key="item.title"
      class="rounded-lg border border-slate-200 bg-white p-4"
    >
      <div class="flex items-start gap-3">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700"
        >
          <UIcon :name="item.icon" class="text-lg" />
        </div>
        <div>
          <p class="text-sm font-semibold text-slate-950">
            {{ item.title }}
          </p>
          <p class="mt-1 text-xs leading-6 text-slate-500">
            {{ item.description }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
