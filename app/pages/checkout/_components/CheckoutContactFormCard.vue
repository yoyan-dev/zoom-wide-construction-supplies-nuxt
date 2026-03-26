<script setup lang="ts">
type CheckoutDraftModel = {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  deliveryAddress: string;
  deliveryNotes: string;
};

const draft = defineModel<CheckoutDraftModel>({
  required: true,
});
</script>

<template>
  <UCard>
    <div class="space-y-6">
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Delivery Information
        </p>
        <h2 class="mt-2 text-xl font-semibold text-slate-900">
          Customer and Delivery Details
        </h2>
        <p class="mt-2 text-sm leading-6 text-slate-600">
          This foundation form collects the information needed for the next
          order phase without submitting an order yet.
        </p>
      </div>

      <UForm @submit.prevent>
        <div class="space-y-4">
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

          <UFormField label="Delivery address" required>
            <UTextarea
              v-model="draft.deliveryAddress"
              name="delivery_address"
              class="w-full"
              placeholder="Street, barangay, city, province"
            />
          </UFormField>

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
