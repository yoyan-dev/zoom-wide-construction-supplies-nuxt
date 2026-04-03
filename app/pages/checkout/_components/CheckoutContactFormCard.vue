<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import PsgcAddressFields from "~/components/address/PsgcAddressFields.vue";
import type { Address } from "~/types/address";
import type { AddressDraft } from "~/utils/address";
import { formatAddress, isAddressDraftComplete } from "~/utils/address";

type CheckoutDraftModel = {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  deliveryNotes: string;
};

const props = withDefaults(
  defineProps<{
    savedAddresses: Address[];
    selectedAddressId: string | null;
    isAddressLoading?: boolean;
    isAddressSaving?: boolean;
    isAddressDeleting?: boolean;
    addressError?: string | null;
  }>(),
  {
    isAddressLoading: false,
    isAddressSaving: false,
    isAddressDeleting: false,
    addressError: null,
  },
);

const draft = defineModel<CheckoutDraftModel>({
  required: true,
});

const deliveryAddress = defineModel<AddressDraft>("deliveryAddress", {
  required: true,
});

const emit = defineEmits<{
  (e: "select-address", addressId: string): void;
  (e: "start-new-address"): void;
  (e: "save-address"): void;
  (e: "delete-address"): void;
}>();

const isEditingCustomerDetails = ref(false);
const hasCustomerDetails = computed(
  () =>
    !!draft.value.companyName.trim() &&
    !!draft.value.contactName.trim() &&
    !!draft.value.email.trim() &&
    !!draft.value.phone.trim(),
);
const canSaveAddress = computed(() =>
  isAddressDraftComplete(deliveryAddress.value),
);

watchEffect(() => {
  if (!hasCustomerDetails.value) {
    isEditingCustomerDetails.value = true;
  }
});
</script>

<template>
  <UCard class="rounded-xl bg-white/95 shadow-sm">
    <div class="space-y-6">
      <div>
        <p class="text-xs uppercase tracking-[0.16em] text-slate-500">
          Delivery Information
        </p>
        <h2 class="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
          Customer and Delivery Details
        </h2>
        <p class="mt-2 text-sm leading-6 text-slate-600">
          This foundation form collects the information needed for the next
          order phase without submitting an order yet.
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <span
          class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
        >
          <UIcon name="i-lucide-shield-check" class="text-emerald-600" />
          Secure details
        </span>
        <span
          class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
        >
          <UIcon name="i-lucide-truck" class="text-amber-600" />
          Delivery ready
        </span>
        <span
          class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
        >
          <UIcon name="i-lucide-map-pinned" class="text-sky-600" />
          Address book
        </span>
      </div>

      <UForm @submit.prevent>
        <div class="space-y-4">
          <div
            class="space-y-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4"
          >
            <div
              class="flex flex-col gap-2 md:flex-row md:items-start md:justify-between"
            >
              <div>
                <p class="text-sm font-semibold text-slate-900">
                  Customer details
                </p>
                <p class="mt-1 text-sm leading-6 text-slate-600">
                  Review the buyer information first, then open edit mode only
                  when you need to change it.
                </p>
              </div>

              <UButton
                type="button"
                color="neutral"
                variant="outline"
                size="sm"
                @click="isEditingCustomerDetails = !isEditingCustomerDetails"
              >
                {{ isEditingCustomerDetails ? "Done" : "Edit details" }}
              </UButton>
            </div>

            <div
              v-if="!isEditingCustomerDetails && hasCustomerDetails"
              class="grid gap-3 md:grid-cols-2"
            >
              <div class="rounded-2xl bg-white px-4 py-3">
                <p class="text-xs uppercase tracking-[0.14em] text-slate-500">
                  Company name
                </p>
                <p class="mt-2 text-sm font-medium text-slate-900">
                  {{ draft.companyName }}
                </p>
              </div>

              <div class="rounded-2xl bg-white px-4 py-3">
                <p class="text-xs uppercase tracking-[0.14em] text-slate-500">
                  Contact name
                </p>
                <p class="mt-2 text-sm font-medium text-slate-900">
                  {{ draft.contactName }}
                </p>
              </div>

              <div class="rounded-2xl bg-white px-4 py-3">
                <p class="text-xs uppercase tracking-[0.14em] text-slate-500">
                  Email
                </p>
                <p class="mt-2 text-sm font-medium text-slate-900">
                  {{ draft.email }}
                </p>
              </div>

              <div class="rounded-2xl bg-white px-4 py-3">
                <p class="text-xs uppercase tracking-[0.14em] text-slate-500">
                  Phone
                </p>
                <p class="mt-2 text-sm font-medium text-slate-900">
                  {{ draft.phone }}
                </p>
              </div>
            </div>

            <div v-else class="space-y-4">
              <div class="grid gap-4 md:grid-cols-2">
                <UFormField label="Company name" required>
                  <UInput
                    v-model="draft.companyName"
                    name="company_name"
                    class="w-full"
                    placeholder="ZOOM Construction Supply Co."
                  />
                </UFormField>

                <UFormField label="Contact name" required>
                  <UInput
                    v-model="draft.contactName"
                    name="contact_name"
                    class="w-full"
                    placeholder="Jamie Santos"
                  />
                </UFormField>
              </div>

              <div class="grid gap-4 md:grid-cols-2">
                <UFormField label="Email" required>
                  <UInput
                    v-model="draft.email"
                    type="email"
                    name="email"
                    class="w-full"
                    placeholder="buyer@zoom.com"
                  />
                </UFormField>

                <UFormField label="Phone" required>
                  <UInput
                    v-model="draft.phone"
                    name="phone"
                    class="w-full"
                    placeholder="+63 900 000 0000"
                  />
                </UFormField>
              </div>
            </div>
          </div>

          <div
            class="space-y-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4"
          >
            <div
              class="flex flex-col gap-2 md:flex-row md:items-start md:justify-between"
            >
              <div>
                <p class="text-sm font-semibold text-slate-900">
                  Delivery addresses
                </p>
                <p class="mt-1 text-sm leading-6 text-slate-600">
                  Select a saved delivery address or create a new one before
                  submitting the cart for order processing.
                </p>
              </div>

              <UButton
                type="button"
                color="neutral"
                variant="outline"
                size="sm"
                @click="emit('start-new-address')"
              >
                Add new address
              </UButton>
            </div>

            <div
              v-if="props.isAddressLoading"
              class="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-5 text-sm text-slate-600"
            >
              Loading your delivery addresses...
            </div>

            <div v-else-if="props.savedAddresses.length" class="grid gap-3">
              <button
                v-for="(address, index) in props.savedAddresses"
                :key="address.id"
                type="button"
                class="rounded-2xl border px-4 py-4 text-left transition"
                :class="
                  props.selectedAddressId === address.id
                    ? 'border-emerald-300 bg-emerald-50/80 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                "
                @click="emit('select-address', address.id)"
              >
                <div class="flex items-center justify-between gap-3">
                  <p class="text-sm font-semibold text-slate-900">
                    Delivery address {{ index + 1 }}
                  </p>
                  <UBadge
                    v-if="props.selectedAddressId === address.id"
                    color="success"
                    variant="subtle"
                  >
                    Selected
                  </UBadge>
                </div>
                <p class="mt-3 text-sm text-slate-600">
                  {{ formatAddress(address) }}
                </p>
              </button>
            </div>

            <div
              v-else
              class="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-5 text-sm leading-6 text-slate-600"
            >
              No saved delivery addresses yet. Add one below so checkout can use
              a structured destination.
            </div>

            <UAlert
              v-if="props.addressError"
              color="error"
              variant="soft"
              icon="i-lucide-circle-alert"
              :title="props.addressError"
            />

            <PsgcAddressFields
              v-model="deliveryAddress"
              title="PSGC delivery address"
              description="Select the delivery location using PSGC-backed region, province, city, and barangay data."
            />

            <div
              class="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-end"
            >
              <div class="hidden md:block" />
              <UButton
                type="button"
                color="warning"
                class="justify-center"
                :loading="props.isAddressSaving"
                :disabled="!canSaveAddress"
                @click="emit('save-address')"
              >
                {{
                  props.selectedAddressId ? "Update address" : "Save address"
                }}
              </UButton>

              <UButton
                type="button"
                color="error"
                variant="soft"
                class="justify-center"
                :disabled="!props.selectedAddressId || props.isAddressDeleting"
                :loading="props.isAddressDeleting"
                @click="emit('delete-address')"
              >
                Delete address
              </UButton>
            </div>
          </div>

          <UFormField label="Delivery notes">
            <UTextarea
              v-model="draft.deliveryNotes"
              name="delivery_notes"
              class="w-full"
              placeholder="Gate instructions, site contact, or receiving hours"
            />
          </UFormField>
        </div>
      </UForm>
    </div>
  </UCard>
</template>
