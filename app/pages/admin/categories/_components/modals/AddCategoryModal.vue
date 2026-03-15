<template>
  <UModal
    title="New Category"
    description="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
  >
    <UButton color="primary" icon="i-lucide-plus">New Category</UButton>

    <template #body>
      <div class="space-y-4">
        <UFormField label="Category name">
          <UInput placeholder="Concrete & Cement" />
        </UFormField>
        <UFormField label="Description">
          <UTextarea placeholder="Add a short description..." />
        </UFormField>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton color="neutral" variant="ghost"> Cancel </UButton>
        <UButton color="primary">Save Changes</UButton>
      </div>
    </template>
  </UModal>
</template>
