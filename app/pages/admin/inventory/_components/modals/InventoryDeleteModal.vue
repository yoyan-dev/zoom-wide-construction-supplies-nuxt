<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { InventoryLog } from "~/types/inventory";
import type { Product } from "~/types/product";

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

const inventoryStore = useInventoryStore();
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

const isDeleting = ref(false);

const handleDelete = async () => {
  if (!log.value?.id) return;
  isDeleting.value = true;
  await inventoryStore.deleteInventoryLog(log.value.id);
  isDeleting.value = false;
  emit("close", false);
};
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }">
    <template #header>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Delete Entry
        </p>
        <h3 class="mt-2 text-lg font-semibold">
          {{ log?.id ?? "Inventory log" }}
        </h3>
      </div>
    </template>

    <template #body>
      <div class="text-sm text-slate-600 space-y-3">
        <p>
          This action cannot be undone. Are you sure you want to delete this
          inventory entry?
        </p>
        <div class="rounded-lg border border-slate-200 p-3 text-xs text-slate-500">
          <div class="font-medium text-slate-700">
            {{
              productMap[log?.product_id ?? ""]?.name ??
                log?.product_id ??
                "No product"
            }}
          </div>
          <div class="mt-1">
            Movement: {{ log?.movement_type ?? "--" }} · Quantity:
            {{ log?.quantity_change ?? "--" }}
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton color="neutral" variant="ghost" @click="emit('close', false)">
          Cancel
        </UButton>
        <UButton color="error" :loading="isDeleting" @click="handleDelete">
          Delete
        </UButton>
      </div>
    </template>
  </UModal>
</template>
