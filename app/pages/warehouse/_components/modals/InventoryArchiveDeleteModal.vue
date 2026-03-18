<script setup lang="ts">
import type { Product } from "~/types/product";

const props = defineProps<{
  payload: Product | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();

const inventoryStore = useInventoryStore();
const productStore = useProductStore();

const productId = computed(() => props.payload?.id ?? "");

const handleArchive = () => {
  if (!productId.value) return;
  inventoryStore.setInventoryStatus(productId.value, "archived");
  productStore.setProductArchived(productId.value, true);
  emit("close", false);
};

const handleDelete = async () => {
  if (!productId.value) return;
  await productStore.deleteProduct(productId.value);
  emit("close", false);
};
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }">
    <template #header>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Inventory Item
        </p>
        <h3 class="mt-2 text-lg font-semibold">Archive or Delete Item</h3>
      </div>
    </template>

    <template #body>
      <div class="space-y-3 text-sm text-slate-600">
        <p>
          {{
            props.payload?.name ??
            props.payload?.id ??
            "Selected inventory item"
          }}
        </p>
        <p>
          Archiving hides this item from active inventory lists. Deleting removes
          it permanently.
        </p>
      </div>
    </template>

    <template #footer>
      <div class="flex flex-wrap justify-end gap-2 w-full">
        <UButton color="neutral" variant="ghost" @click="emit('close', false)">
          Cancel
        </UButton>
        <UButton color="warning" variant="outline" @click="handleArchive">
          Archive
        </UButton>
        <UButton color="error" @click="handleDelete">Delete</UButton>
      </div>
    </template>
  </UModal>
</template>
