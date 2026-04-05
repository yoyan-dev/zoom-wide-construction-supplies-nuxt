<script setup lang="ts">
import type { AdminActionItem, AdminActionSection } from "./admin-table";

const props = defineProps<{
  sections: AdminActionSection[];
}>();

const visibleSections = computed(() =>
  props.sections.filter((section) => section.actions.length > 0),
);

const handleAction = async (action: AdminActionItem, close: () => void) => {
  if (action.onClick) {
    const shouldClose = (await action.onClick()) !== false;

    if (!shouldClose) {
      return;
    }
  }

  close();
};
</script>

<template>
  <UPopover :dismissible="false" :ui="{ content: 'p-4' }">
    <UButton
      icon="i-lucide-ellipsis-vertical"
      variant="ghost"
      color="neutral"
      size="sm"
    />

    <template #content="{ close }">
      <div class="mb-4 flex w-full items-center justify-between gap-4">
        <h2 class="text-highlighted font-semibold">Actions</h2>

        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-x"
          @click="close"
        />
      </div>

      <div class="flex min-w-64 flex-col gap-3">
        <template v-for="(section, index) in visibleSections" :key="section.label">
          <div class="flex flex-col gap-1">
            <p class="px-2 text-xs uppercase tracking-[0.18em] text-slate-500">
              {{ section.label }}
            </p>
            <UButton
              v-for="action in section.actions"
              :key="action.label"
              :icon="action.icon"
              :color="action.color ?? 'neutral'"
              variant="ghost"
              size="sm"
              class="w-full justify-start"
              :to="action.to"
              @click="handleAction(action, close)"
            >
              {{ action.label }}
            </UButton>
          </div>

          <UDivider v-if="index < visibleSections.length - 1" />
        </template>
      </div>
    </template>
  </UPopover>
</template>
