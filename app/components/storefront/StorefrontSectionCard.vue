<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    as?: string;
    tone?: "default" | "muted" | "dashed" | "error";
    padding?: "none" | "sm" | "md" | "lg";
  }>(),
  {
    as: "section",
    tone: "default",
    padding: "md",
  },
);

const toneClass = computed(() => {
  switch (props.tone) {
    case "muted":
      return "sf-card--muted";
    case "dashed":
      return "sf-card--dashed";
    case "error":
      return "sf-card--danger";
    default:
      return "";
  }
});

const paddingClass = computed(() => {
  switch (props.padding) {
    case "none":
      return "";
    case "sm":
      return "p-4 md:p-5";
    case "lg":
      return "p-6 md:p-8";
    default:
      return "p-5 md:p-6";
  }
});
</script>

<template>
  <component :is="props.as" :class="['sf-card', toneClass, paddingClass]">
    <slot />
  </component>
</template>
