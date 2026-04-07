<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    eyebrow?: string;
    title: string;
    description?: string;
    titleTag?: "h1" | "h2" | "h3";
    align?: "left" | "center";
  }>(),
  {
    eyebrow: "",
    description: "",
    titleTag: "h2",
    align: "left",
  },
);
</script>

<template>
  <div
    :class="['flex flex-col gap-3', props.align === 'center' && 'text-center']"
  >
    <p
      v-if="props.eyebrow"
      class="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-amber-700"
    >
      {{ props.eyebrow }}
    </p>
    <component
      :is="props.titleTag"
      class="text-3xl font-bold leading-none text-slate-900 md:text-5xl"
    >
      {{ props.title }}
    </component>
    <p v-if="props.description" class="max-w-2xl leading-7 text-slate-600">
      {{ props.description }}
    </p>
  </div>
</template>
