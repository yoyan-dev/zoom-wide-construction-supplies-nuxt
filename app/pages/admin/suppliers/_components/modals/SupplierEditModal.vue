<script setup lang="ts">
import type { Supplier } from "~/types/supplier";

const props = defineProps<{
  payload: Supplier | null;
}>();

const supplier = ref<Supplier | null>(props.payload);
const emit = defineEmits<{ close: [boolean] }>();
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }">
    <UButton color="primary" icon="i-lucide-pencil" label="edit" />
    <template #header>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Edit Supplier
        </p>
        <h3 class="mt-2 text-lg font-semibold">Edit supplier details</h3>
      </div>
    </template>
    <template #body>
      <div class="space-y-4" v-if="supplier">
        <UFormField label="Supplier name">
          <UInput
            class="w-full"
            v-model="supplier.name"
            name="name"
            placeholder="Atlas Aggregates"
          />
        </UFormField>
        <UFormField label="Contact name">
          <UInput
            class="w-full"
            v-model="supplier.contact_name"
            name="contact_name"
            placeholder="Kim Warren"
          />
        </UFormField>
        <div class="grid gap-4 md:grid-cols-2">
          <UFormField label="Phone">
            <UInput
              class="w-full"
              v-model="supplier.phone"
              name="phone"
              placeholder="+1-555-555-5555"
            />
          </UFormField>
          <UFormField label="Email">
            <UInput
              class="w-full"
              v-model="supplier.email"
              name="email"
              placeholder="contact@supplier.com"
            />
          </UFormField>
        </div>
        <UFormField label="Address">
          <UTextarea
            class="w-full"
            v-model="supplier.address"
            name="address"
            placeholder="Street, City, State"
          />
        </UFormField>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton color="neutral" variant="ghost" @click="emit('close', false)">
          Cancel
        </UButton>
        <UButton color="primary">Save Changes </UButton>
      </div>
    </template>
  </UModal>
</template>
