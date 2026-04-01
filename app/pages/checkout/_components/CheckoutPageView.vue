<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { Order } from "~/types/order";
import CheckoutContactFormCard from "./CheckoutContactFormCard.vue";
import CheckoutEmptyState from "./CheckoutEmptyState.vue";
import CheckoutHeader from "./CheckoutHeader.vue";
import CheckoutOrderSummaryCard from "./CheckoutOrderSummaryCard.vue";
import CheckoutPaymentPlaceholderCard from "./CheckoutPaymentPlaceholderCard.vue";
import CheckoutSuccessState from "./CheckoutSuccessState.vue";

type CheckoutDraft = {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  deliveryAddress: string;
  deliveryNotes: string;
};

const cartStore = useCartStore();
const authStore = useAuthStore();
const toast = useToast();
const { items, hasItems, distinctItemCount, itemCount, subtotal } =
  storeToRefs(cartStore);
const { isCheckingOut: isSubmitting } = storeToRefs(cartStore);
const { customer, user } = storeToRefs(authStore);

const draft = reactive<CheckoutDraft>({
  companyName: "",
  contactName: "",
  email: "",
  phone: "",
  deliveryAddress: "",
  deliveryNotes: "",
});

const submittedOrder = ref<Order | null>(null);
const customerId = computed(() => customer.value?.id ?? null);

const canReviewOrder = computed(
  () =>
    !!customerId.value &&
    !!draft.companyName.trim() &&
    !!draft.contactName.trim() &&
    !!draft.email.trim() &&
    !!draft.phone.trim() &&
    !!draft.deliveryAddress.trim() &&
    hasItems.value,
);

const normalizedNotes = computed(() =>
  [
    `Company: ${draft.companyName.trim()}`,
    `Contact: ${draft.contactName.trim()}`,
    `Email: ${draft.email.trim()}`,
    `Phone: ${draft.phone.trim()}`,
    `Delivery Address: ${draft.deliveryAddress.trim()}`,
    draft.deliveryNotes.trim()
      ? `Delivery Notes: ${draft.deliveryNotes.trim()}`
      : "",
  ]
    .filter(Boolean)
    .join("\n"),
);

const reviewMessage = computed(() =>
  canReviewOrder.value
    ? "Your checkout details are ready for the order-submission phase."
    : "Complete the delivery and contact details to prepare this cart for the next order step.",
);

watch(
  [customer, user],
  () => {
    draft.companyName ||= customer.value?.company_name ?? "";
    draft.contactName ||=
      customer.value?.contact_name ?? user.value?.full_name ?? "";
    draft.email ||= customer.value?.email ?? user.value?.email ?? "";
    draft.phone ||= customer.value?.phone ?? user.value?.phone ?? "";
    draft.deliveryAddress ||=
      customer.value?.shipping_address ?? customer.value?.billing_address ?? "";
  },
  { immediate: true },
);

const handleSubmitOrder = async () => {
  if (!canReviewOrder.value || isSubmitting.value) {
    return;
  }

  const response = await cartStore.checkoutCart(normalizedNotes.value);

  if (response.status === "error" || !response.data) {
    toast.add({
      title: "Order request failed",
      description: response.message || "Please try again.",
      color: "error",
      icon: "i-lucide-circle-alert",
    });
    return;
  }

  submittedOrder.value = response.data;

  toast.add({
    title: "Order request created",
    description:
      response.message || "Your order request was submitted successfully.",
    color: "success",
    icon: "i-lucide-circle-check",
  });
};
</script>

<template>
  <div class="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
    <CheckoutSuccessState
      v-if="submittedOrder"
      :order="submittedOrder"
    />
    <template v-else>
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
          :is-submitting="isSubmitting"
          @submit="handleSubmitOrder"
        />
      </div>
    </template>
  </div>
</template>
