<template>
  <StorefrontStateCard
    eyebrow="Project Load"
    title="Your cart is empty."
    description="Start with the storefront home or head straight to the catalog to build a material shortlist for your next order."
    align="center"
  >
    <template #actions>
      <div class="flex flex-wrap justify-center gap-3">
        <StorefrontButton tone="primary" to="/shop/catalog">
          Browse catalog
        </StorefrontButton>
        <StorefrontButton tone="secondary" to="/shop">
          Return home
        </StorefrontButton>
      </div>
    </template>
  </StorefrontStateCard>
</template>
