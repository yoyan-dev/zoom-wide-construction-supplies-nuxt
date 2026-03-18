<script setup lang="ts">
const props = defineProps<{
  modelValue: string;
  quickTerms: string[];
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "submit"): void;
  (e: "quick-term", value: string): void;
}>();

const localValue = computed({
  get: () => props.modelValue,
  set: (value: string) => emit("update:modelValue", value),
});

const submit = () => emit("submit");
</script>

<template>
  <div class="space-y-4">
    <form class="flex flex-col gap-3 sm:flex-row" @submit.prevent="submit">
      <UInput
        v-model="localValue"
        class="w-full"
        size="xl"
        icon="i-lucide-search"
        placeholder="Search cement, steel bars, plywood, GI pipes..."
      />
      <UButton
        type="submit"
        color="warning"
        size="xl"
        class="justify-center px-6"
      >
        Search Supplies
      </UButton>
    </form>

    <div class="flex flex-wrap gap-2">
      <UButton
        v-for="term in props.quickTerms"
        :key="term"
        color="neutral"
        variant="soft"
        size="sm"
        @click="emit('quick-term', term)"
      >
        {{ term }}
      </UButton>
    </div>
  </div>
</template>
