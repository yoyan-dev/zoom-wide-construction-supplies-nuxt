<template>
  <UModal
    title="New Supplier"
    description="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
  >
    <UButton color="primary" icon="i-lucide-plus">New Supplier</UButton>

    <template #body>
      <div class="space-y-4">
        <UFormField label="Supplier name">
          <UInput class="w-full" name="name" placeholder="Atlas Aggregates" />
        </UFormField>
        <UFormField label="Contact name">
          <UInput class="w-full" name="contact_name" placeholder="Kim Warren" />
        </UFormField>
        <div class="grid gap-4 md:grid-cols-2">
          <UFormField label="Phone">
            <UInput class="w-full" name="phone" placeholder="+1-555-555-5555" />
          </UFormField>
          <UFormField label="Email">
            <UInput
              class="w-full"
              name="email"
              placeholder="contact@supplier.com"
            />
          </UFormField>
        </div>
        <UFormField label="Address">
          <UTextarea
            class="w-full"
            name="address"
            placeholder="Street, City, State"
          />
        </UFormField>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton color="neutral" variant="ghost"> Cancel </UButton>
        <UButton color="primary">Save</UButton>
      </div>
    </template>
  </UModal>
</template>
