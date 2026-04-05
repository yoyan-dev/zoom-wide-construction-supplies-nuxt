<script setup lang="ts">
import StorefrontSectionCard from "./StorefrontSectionCard.vue";
import StorefrontSectionHeading from "./StorefrontSectionHeading.vue";

defineProps<{
  eyebrow: string;
  title: string;
  description: string;
}>();
</script>

<template>
  <StorefrontSectionCard padding="lg">
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <StorefrontSectionHeading
        :eyebrow="eyebrow"
        :title="title"
        :description="description"
        title-tag="h1"
      />

      <div
        v-if="$slots.actions"
        class="flex shrink-0 flex-col gap-3 md:items-end"
      >
        <slot name="actions" />
      </div>
    </div>
  </StorefrontSectionCard>
</template>
