<template>
  <StorefrontStateCard
    eyebrow="Order History"
    title="No orders yet"
    description="Once you submit an order, it will appear here for review and tracking."
    tone="dashed"
    align="center"
  >
    <template #actions>
      <div class="flex flex-wrap justify-center gap-3">
        <StorefrontButton tone="primary" to="/shop">
          Browse products
        </StorefrontButton>
        <StorefrontButton tone="secondary" to="/cart">
          View cart
        </StorefrontButton>
      </div>
    </template>
  </StorefrontStateCard>
</template>
