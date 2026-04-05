<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    as?: string;
    size?: "default" | "narrow" | "wide";
  }>(),
  {
    as: "div",
    size: "default",
  },
);

const sizeClass = computed(() => {
  switch (props.size) {
    case "narrow":
      return "sf-page--narrow";
    case "wide":
      return "sf-page--wide";
    default:
      return "sf-page--default";
  }
});
</script>

<template>
  <component :is="props.as" :class="['sf-page', sizeClass]">
    <slot />
  </component>
</template>
