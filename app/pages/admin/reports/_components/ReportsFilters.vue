<script setup lang="ts">
const props = defineProps<{
  fromDate: string;
  toDate: string;
  orderStatus: string;
  paymentStatus: string;
  deliveryStatus: string;
  stockStatus: string;
  orderStatusOptions: Array<{ label: string; value: string }>;
  paymentStatusOptions: Array<{ label: string; value: string }>;
  deliveryStatusOptions: Array<{ label: string; value: string }>;
  stockStatusOptions: Array<{ label: string; value: string }>;
  isLoading: boolean;
}>();

const emit = defineEmits<{
  (event: "update:fromDate", value: string): void;
  (event: "update:toDate", value: string): void;
  (event: "update:orderStatus", value: string): void;
  (event: "update:paymentStatus", value: string): void;
  (event: "update:deliveryStatus", value: string): void;
  (event: "update:stockStatus", value: string): void;
  (event: "refresh"): void;
  (event: "export"): void;
}>();
</script>

<template>
  <UCard>
    <div class="grid gap-4 lg:grid-cols-6">
      <UFormField label="From date">
        <UInput
          :model-value="props.fromDate"
          type="date"
          @update:model-value="emit('update:fromDate', String($event))"
        />
      </UFormField>

      <UFormField label="To date">
        <UInput
          :model-value="props.toDate"
          type="date"
          @update:model-value="emit('update:toDate', String($event))"
        />
      </UFormField>

      <UFormField label="Orders">
        <USelect
          :items="props.orderStatusOptions"
          :model-value="props.orderStatus"
          @update:model-value="emit('update:orderStatus', String($event))"
        />
      </UFormField>

      <UFormField label="Payments">
        <USelect
          :items="props.paymentStatusOptions"
          :model-value="props.paymentStatus"
          @update:model-value="emit('update:paymentStatus', String($event))"
        />
      </UFormField>

      <UFormField label="Deliveries">
        <USelect
          :items="props.deliveryStatusOptions"
          :model-value="props.deliveryStatus"
          @update:model-value="emit('update:deliveryStatus', String($event))"
        />
      </UFormField>

      <UFormField label="Stock">
        <USelect
          :items="props.stockStatusOptions"
          :model-value="props.stockStatus"
          @update:model-value="emit('update:stockStatus', String($event))"
        />
      </UFormField>
    </div>

    <div class="mt-4 flex flex-wrap gap-3">
      <UButton
        color="neutral"
        variant="outline"
        icon="i-lucide-refresh-cw"
        :loading="props.isLoading"
        @click="emit('refresh')"
      >
        Refresh reports
      </UButton>
      <UButton
        color="primary"
        icon="i-lucide-download"
        @click="emit('export')"
      >
        Download CSV
      </UButton>
    </div>
  </UCard>
</template>
