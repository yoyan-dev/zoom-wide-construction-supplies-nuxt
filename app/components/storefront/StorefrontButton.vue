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

const sizeClass = computed(() => `sf-button--${props.size}`);
</script>

<template>
  <UButton
    v-bind="$attrs"
    :color="resolvedVariant.color"
    :variant="resolvedVariant.variant"
    :size="props.size"
    :class="['sf-button', sizeClass, props.block && 'w-full justify-center']"
  >
    <slot />
  </UButton>
</template>
