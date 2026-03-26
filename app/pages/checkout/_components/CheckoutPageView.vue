<script setup lang="ts">
import { storeToRefs } from "pinia";
import CheckoutContactFormCard from "./CheckoutContactFormCard.vue";
import CheckoutEmptyState from "./CheckoutEmptyState.vue";
import CheckoutHeader from "./CheckoutHeader.vue";
import CheckoutOrderSummaryCard from "./CheckoutOrderSummaryCard.vue";
import CheckoutPaymentPlaceholderCard from "./CheckoutPaymentPlaceholderCard.vue";

type CheckoutDraft = {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  deliveryAddress: string;
  deliveryNotes: string;
};

const cartStore = useCartStore();
const { items, hasItems, distinctItemCount, itemCount, subtotal } =
  storeToRefs(cartStore);

const draft = reactive<CheckoutDraft>({
  companyName: "",
  contactName: "",
  email: "",
  phone: "",
  deliveryAddress: "",
  deliveryNotes: "",
});

const canReviewOrder = computed(
  () =>
    !!draft.companyName.trim() &&
    !!draft.contactName.trim() &&
    !!draft.email.trim() &&
    !!draft.phone.trim() &&
    !!draft.deliveryAddress.trim() &&
    hasItems.value,
);

const reviewMessage = computed(() =>
  canReviewOrder.value
    ? "Your checkout details are ready for the order-submission phase."
    : "Complete the delivery and contact details to prepare this cart for the next order step.",
);
</script>

<template>
  <div class="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
    <CheckoutHeader
      :distinct-item-count="distinctItemCount"
      :item-count="itemCount"
    />

    <CheckoutEmptyState v-if="!hasItems" />

    <div
      v-else
      class="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)] xl:items-start"
    >
      <div class="space-y-6">
        <CheckoutContactFormCard v-model="draft" />
        <CheckoutPaymentPlaceholderCard :review-message="reviewMessage" />
      </div>

      <CheckoutOrderSummaryCard
        :items="items"
        :distinct-item-count="distinctItemCount"
        :item-count="itemCount"
        :subtotal="subtotal"
        :can-review-order="canReviewOrder"
      />
    </div>
  </div>
</template>
