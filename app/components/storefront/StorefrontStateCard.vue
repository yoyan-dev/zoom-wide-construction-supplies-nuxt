<script setup lang="ts">
import StorefrontSectionCard from "./StorefrontSectionCard.vue";
import StorefrontSectionHeading from "./StorefrontSectionHeading.vue";

const props = withDefaults(
  defineProps<{
    eyebrow?: string;
    title: string;
    description: string;
    tone?: "neutral" | "error" | "dashed";
    align?: "left" | "center";
  }>(),
  {
    eyebrow: "Status",
    tone: "neutral",
    align: "left",
  },
);

const tone = computed(() => {
  switch (props.tone) {
    case "error":
      return "error";
    case "dashed":
      return "dashed";
    default:
      return "default";
  }
});
</script>

<template>
  <StorefrontSectionCard :tone="tone" padding="lg">
    <div
      :class="[
        'flex flex-col gap-5',
        props.align === 'center' && 'items-center text-center',
        props.align === 'left' &&
          'md:flex-row md:items-center md:justify-between md:gap-6',
      ]"
    >
      <StorefrontSectionHeading
        :eyebrow="props.eyebrow"
        :title="props.title"
        :description="props.description"
        :align="props.align"
      />

      <div
        v-if="$slots.actions"
        :class="[
          'flex flex-wrap gap-3',
          props.align === 'center' ? 'justify-center' : 'md:justify-end',
        ]"
      >
        <slot name="actions" />
      </div>
    </div>
  </StorefrontSectionCard>
</template>
