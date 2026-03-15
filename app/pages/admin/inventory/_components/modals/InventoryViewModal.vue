<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { InventoryLog, InventoryMovementType } from "~/types/inventory";
import type { Product } from "~/types/product";
import { formatNumber, formatShortDate } from "~/utils/format";

const props = defineProps<{
  payload: InventoryLog | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();

const log = ref<InventoryLog | null>(props.payload);

watch(
  () => props.payload,
  (value) => {
    log.value = value;
  },
  { immediate: true },
);

const productStore = useProductStore();
const { products } = storeToRefs(productStore);

const productMap = computed(() => {
  const map: Record<string, Product> = {};
  for (const product of products.value) {
    if (!product.id) continue;
    map[product.id] = product;
  }
  return map;
});

type BadgeColor =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "error"
  | "neutral";

const movementTone: Record<InventoryMovementType, BadgeColor> = {
  in: "success",
  out: "warning",
  adjustment: "info",
};
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }">
    <template #header>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Inventory Details
        </p>
        <h3 class="mt-2 text-lg font-semibold">
          {{ log?.id ?? "Inventory log" }}
        </h3>
      </div>
    </template>

    <template #body>
      <div class="space-y-4 text-sm text-slate-600">
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Product</p>
          <p class="mt-1 font-medium text-slate-700">
            {{
              productMap[log?.product_id ?? ""]?.name ??
                log?.product_id ??
                "No product"
            }}
          </p>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Movement
            </p>
            <div class="mt-1">
              <UBadge
                v-if="log"
                :color="movementTone[log.movement_type]"
                variant="subtle"
              >
                {{ log.movement_type }}
              </UBadge>
              <span v-else>--</span>
            </div>
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Quantity
            </p>
            <p class="mt-1">{{ log ? formatNumber(log.quantity_change) : "--" }}</p>
          </div>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Reference type
            </p>
            <p class="mt-1">{{ log?.reference_type ?? "No reference" }}</p>
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Reference ID
            </p>
            <p class="mt-1">{{ log?.reference_id ?? "No reference" }}</p>
          </div>
        </div>
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Note</p>
          <p class="mt-1">{{ log?.note ?? "No notes" }}</p>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Created by
            </p>
            <p class="mt-1">{{ log?.created_by ?? "--" }}</p>
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Created
            </p>
            <p class="mt-1">
              {{ log?.created_at ? formatShortDate(log.created_at) : "--" }}
            </p>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end w-full">
        <UButton color="neutral" variant="ghost" @click="emit('close', false)">
          Close
        </UButton>
      </div>
    </template>
  </UModal>
</template>

