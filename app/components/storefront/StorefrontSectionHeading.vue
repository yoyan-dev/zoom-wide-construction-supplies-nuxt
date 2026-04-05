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
  <div :class="['sf-heading', props.align === 'center' && 'text-center']">
    <p v-if="props.eyebrow" class="sf-eyebrow">
      {{ props.eyebrow }}
    </p>
    <component :is="props.titleTag" class="sf-title">
      {{ props.title }}
    </component>
    <p v-if="props.description" class="sf-description">
      {{ props.description }}
    </p>
  </div>
</template>
