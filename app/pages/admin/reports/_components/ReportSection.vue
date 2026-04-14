<script setup lang="ts">
const props = defineProps<{
  eyebrow: string;
  title: string;
}>();
</script>

<template>
  <section class="space-y-4">
    <div>
      <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
        {{ props.eyebrow }}
      </p>
      <h2 class="mt-1 text-xl font-semibold text-slate-900">
        {{ props.title }}
      </h2>
    </div>

    <slot />
  </section>
</template>
