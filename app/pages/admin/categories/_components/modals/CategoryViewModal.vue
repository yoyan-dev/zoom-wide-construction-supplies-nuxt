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
      <div class="space-y-5 text-sm text-slate-600">
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">ID</p>
          <p class="mt-1 font-medium text-slate-700">
            {{ category?.id ?? "-" }}
          </p>
        </div>

        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Overview
          </p>
          <p class="mt-1">
            {{
              category?.overview ??
              category?.description ??
              "No overview available."
            }}
          </p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Typical Uses
            </p>
            <ul class="mt-2 grid gap-2">
              <li v-for="item in category?.typical_uses ?? []" :key="item">
                {{ item }}
              </li>
              <li v-if="!(category?.typical_uses?.length)" class="text-slate-400">
                No usage notes.
              </li>
            </ul>
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Buying Notes
            </p>
            <ul class="mt-2 grid gap-2">
              <li
                v-for="item in category?.buying_considerations ?? []"
                :key="item"
              >
                {{ item }}
              </li>
              <li
                v-if="!(category?.buying_considerations?.length)"
                class="text-slate-400"
              >
                No buying notes.
              </li>
            </ul>
          </div>
        </div>

        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Featured Specifications
          </p>
          <div class="mt-2 grid gap-3 sm:grid-cols-2">
            <div
              v-for="spec in category?.featured_specs ?? []"
              :key="spec.label"
              class="rounded-2xl border border-slate-200/70 p-4"
            >
              <p class="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                {{ spec.label }}
              </p>
              <p class="mt-2 font-medium text-slate-800">
                {{ spec.value }}
              </p>
            </div>
            <p v-if="!(category?.featured_specs?.length)" class="text-slate-400">
              No featured specs.
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
