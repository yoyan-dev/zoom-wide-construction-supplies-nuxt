<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    tone?: "primary" | "secondary" | "ghost" | "subtle" | "danger";
    size?: "sm" | "md" | "lg" | "xl";
    block?: boolean;
  }>(),
  {
    tone: "secondary",
    size: "md",
    block: false,
  },
);

const resolvedVariant = computed(() => {
  switch (props.tone) {
    case "primary":
      return { color: "warning", variant: "solid" as const };
    case "ghost":
      return { color: "neutral", variant: "ghost" as const };
    case "subtle":
      return { color: "warning", variant: "soft" as const };
    case "danger":
      return { color: "error", variant: "soft" as const };
    default:
      return { color: "neutral", variant: "outline" as const };
  }
});

const sizeClass = computed(() => {
  switch (props.size) {
    case "sm":
      return "min-h-9";
    case "lg":
      return "min-h-12";
    case "xl":
      return "min-h-14";
    default:
      return "min-h-11";
  }
});
</script>

<template>
  <UButton
    v-bind="$attrs"
    :color="resolvedVariant.color"
    :variant="resolvedVariant.variant"
    :size="props.size"
    :class="[
      'rounded-lg font-semibold',
      sizeClass,
      props.block && 'w-full justify-center',
    ]"
  >
    <slot />
  </UButton>
</template>
