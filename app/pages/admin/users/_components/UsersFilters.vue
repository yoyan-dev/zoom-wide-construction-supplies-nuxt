<script setup lang="ts">
const props = defineProps<{
  search: string;
  role: string;
  status: string;
  roleOptions: Array<{ label: string; value: string }>;
  statusOptions: Array<{ label: string; value: string }>;
}>();

const emit = defineEmits<{
  (e: "update:search", value: string): void;
  (e: "update:role", value: string): void;
  (e: "update:status", value: string): void;
}>();
</script>

<template>
  <UCard>
    <div class="grid gap-4 lg:grid-cols-3">
      <UInput
        :model-value="props.search"
        icon="i-lucide-search"
        placeholder="Search name, email, role, or phone"
        @update:model-value="emit('update:search', String($event))"
      />
      <USelect
        :items="props.roleOptions"
        :model-value="props.role"
        placeholder="All roles"
        @update:model-value="emit('update:role', String($event))"
      />
      <USelect
        :items="props.statusOptions"
        :model-value="props.status"
        placeholder="All statuses"
        @update:model-value="emit('update:status', String($event))"
      />
    </div>
  </UCard>
</template>
