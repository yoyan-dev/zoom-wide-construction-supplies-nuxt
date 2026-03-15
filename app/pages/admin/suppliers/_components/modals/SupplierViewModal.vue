<script setup lang="ts">
import type { Supplier } from "~/types/supplier";

const props = defineProps<{
  payload: Supplier | null;
}>();

const supplier = ref<Supplier | null>(props.payload);
console.log(props.payload);
const emit = defineEmits<{ close: [boolean] }>();
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }">
    <template #header>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Supplier Details
        </p>
        <h3 class="mt-2 text-lg font-semibold">
          {{ supplier?.name ?? "Supplier" }}
        </h3>
      </div>
    </template>
    <template #body>
      <div class="space-y-4 text-sm text-slate-600">
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">ID</p>
          <p class="mt-1 font-medium text-slate-700">
            {{ supplier?.id ?? "—" }}
          </p>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Contact
            </p>
            <p class="mt-1">
              {{ supplier?.contact_name ?? "No contact" }}
            </p>
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Phone
            </p>
            <p class="mt-1">{{ supplier?.phone ?? "No phone" }}</p>
          </div>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Email
            </p>
            <p class="mt-1">{{ supplier?.email ?? "No email" }}</p>
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Address
            </p>
            <p class="mt-1">{{ supplier?.address ?? "No address" }}</p>
          </div>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Created
            </p>
            <p class="mt-1">{{ supplier?.created_at ?? "—" }}</p>
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Updated
            </p>
            <p class="mt-1">{{ supplier?.updated_at ?? "—" }}</p>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end">
        <UButton color="neutral" variant="ghost" @click="emit('close', false)">
          Close
        </UButton>
      </div>
    </template>
  </UModal>
</template>
