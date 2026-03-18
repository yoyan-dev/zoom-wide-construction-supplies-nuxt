<script setup lang="ts">
const props = defineProps<{
  eyebrow: string;
  title: string;
  description?: string;
  linkLabel?: string;
  linkTo?: string;
  invert?: boolean;
}>();
</script>

<template>
  <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
    <div>
      <p
        class="text-xs uppercase tracking-[0.22em]"
        :class="props.invert ? 'text-amber-300' : 'text-amber-700'"
      >
        {{ props.eyebrow }}
      </p>
      <h2
        class="mt-2 text-2xl font-semibold sm:text-3xl"
        :class="props.invert ? 'text-white' : 'text-slate-900'"
      >
        {{ props.title }}
      </h2>
      <p
        v-if="props.description"
        class="mt-3 max-w-2xl text-sm leading-6"
        :class="props.invert ? 'text-slate-300' : 'text-slate-600'"
      >
        {{ props.description }}
      </p>
    </div>

    <UButton
      v-if="props.linkLabel && props.linkTo"
      color="neutral"
      variant="ghost"
      trailing-icon="i-lucide-arrow-right"
      :to="props.linkTo"
      :class="props.invert ? 'text-slate-200 hover:text-white' : ''"
    >
      {{ props.linkLabel }}
    </UButton>
  </div>
</template>
