<script setup lang="ts">
import type { Category } from "~/types/category";

const props = defineProps<{
  payload: Category | null;
}>();

const category = ref<Category | null>(props.payload);
const emit = defineEmits<{ close: [boolean] }>();
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }">
    <template #header>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Category Details
        </p>
        <h3 class="mt-2 text-lg font-semibold">
          {{ category?.name ?? "Category" }}
        </h3>
      </div>
    </template>

    <template #body>
      <div class="space-y-4 text-sm text-slate-600">
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">ID</p>
          <p class="mt-1 font-medium text-slate-700">
            {{ category?.id ?? "—" }}
          </p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Description
          </p>
          <p class="mt-1">
            {{ category?.description ?? "No description" }}
          </p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Image
          </p>
          <p class="mt-1 break-all">
            {{ category?.image_url ?? "No image" }}
          </p>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Created
            </p>
            <p class="mt-1">{{ category?.created_at ?? "—" }}</p>
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Updated
            </p>
            <p class="mt-1">{{ category?.updated_at ?? "—" }}</p>
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
