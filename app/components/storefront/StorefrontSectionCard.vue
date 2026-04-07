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
      return "bg-slate-50/90";
    case "dashed":
      return "border-dashed bg-white/70";
    case "error":
      return "border-red-200 bg-red-50/95";
    default:
      return "bg-white/90";
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
  <component
    :is="props.as"
    :class="[
      'rounded-lg border border-slate-300/75 shadow-[0_20px_40px_rgba(15,23,42,0.05)]',
      toneClass,
      paddingClass,
    ]"
  >
    <slot />
  </component>
</template>
