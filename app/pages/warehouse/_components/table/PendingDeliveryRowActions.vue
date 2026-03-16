<script setup lang="ts">
import type { Delivery } from "~/types/delivery";

const props = defineProps<{
  delivery: Delivery;
}>();

const deliveryStore = useDeliveryStore();

const deliveryId = computed(() => props.delivery.id);

const handleMarkOut = async () => {
  if (props.delivery.status === "delivered") return;
  await deliveryStore.updateDeliveryStatus(deliveryId.value, "in_transit");
};

const handleMarkDelivered = async () => {
  await deliveryStore.updateDeliveryStatus(deliveryId.value, "delivered");
};

type ActionItem = {
  label: string;
  icon: string;
  color?: string;
  to?: string;
  onClick?: () => void | Promise<void>;
};

const viewActions = computed<ActionItem[]>(() => [
  {
    label: "View Delivery",
    icon: "i-lucide-eye",
    to: `/warehouse/deliveries/${deliveryId.value}`,
  },
]);

const statusActions = computed<ActionItem[]>(() => [
  {
    label: "Mark Out for Delivery",
    icon: "i-lucide-truck",
    onClick: handleMarkOut,
  },
  {
    label: "Mark Delivered",
    icon: "i-lucide-check",
    onClick: handleMarkDelivered,
  },
]);

const handleAction = async (action: ActionItem, close: () => void) => {
  if (action.onClick) {
    await action.onClick();
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
      <div class="flex items-center justify-between gap-4 mb-4 w-full">
        <h2 class="text-highlighted font-semibold">Actions</h2>

        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-x"
          @click="close"
        />
      </div>

      <div class="flex flex-col gap-3 min-w-56">
        <div class="flex flex-col gap-1">
          <p class="px-2 text-xs uppercase tracking-[0.18em] text-slate-500">
            View
          </p>
          <UButton
            v-for="action in viewActions"
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

        <UDivider />

        <div class="flex flex-col gap-1">
          <p class="px-2 text-xs uppercase tracking-[0.18em] text-slate-500">
            Status Updates
          </p>
          <UButton
            v-for="action in statusActions"
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
      </div>
    </template>
  </UPopover>
</template>
