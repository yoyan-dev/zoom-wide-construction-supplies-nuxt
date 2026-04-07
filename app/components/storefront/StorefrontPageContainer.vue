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
      return "max-w-5xl";
    case "wide":
      return "max-w-[88rem]";
    default:
      return "max-w-7xl";
  }
});
</script>

<template>
  <component
    :is="props.as"
    :class="['mx-auto w-full px-4 sm:px-6 lg:px-8', sizeClass]"
  >
    <slot />
  </component>
</template>
