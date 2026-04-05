<script setup lang="ts">
const props = defineProps<{
  search: string;
  accountStatus: string;
  accountOptions: Array<{ label: string; value: string }>;
}>();

const emit = defineEmits<{
  (e: "update:search", value: string): void;
  (e: "update:accountStatus", value: string): void;
}>();
</script>

<template>
  <UCard>
    <div class="grid gap-4 md:grid-cols-2">
      <UInput
        :model-value="props.search"
        icon="i-lucide-search"
        placeholder="Search company, contact, email, or phone"
        @update:model-value="emit('update:search', String($event))"
      />
      <USelect
        :items="props.accountOptions"
        :model-value="props.accountStatus"
        placeholder="All accounts"
        @update:model-value="emit('update:accountStatus', String($event))"
      />
    </div>
  </UCard>
</template>
