<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { Address } from "~/types/address";
import type { Order } from "~/types/order";
import {
  createEmptyAddressDraft,
  formatAddress,
  isAddressDraftComplete,
  toAddressDraft,
  toAddressPayload,
} from "~/utils/address";
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
  deliveryNotes: string;
};

const cartStore = useCartStore();
const authStore = useAuthStore();
const customerAddressesStore = useCustomerAddressesStore();
const toast = useToast();
const { items, hasItems, distinctItemCount, itemCount, subtotal } =
  storeToRefs(cartStore);
const { isCheckingOut: isSubmitting } = storeToRefs(cartStore);
const { customer, user } = storeToRefs(authStore);
const {
  addresses,
  isLoading: isAddressLoading,
  isSaving: isAddressSaving,
  isDeleting: isAddressDeleting,
} = storeToRefs(customerAddressesStore);

const draft = reactive<CheckoutDraft>({
  companyName: "",
  contactName: "",
  email: "",
  phone: "",
  deliveryNotes: "",
});

const deliveryAddress = reactive(createEmptyAddressDraft());
const submittedOrder = ref<Order | null>(null);
const selectedAddressId = ref<string | null>(null);
const addressError = ref<string | null>(null);
const customerId = computed(() => customer.value?.id ?? null);
const selectedAddress = computed(
  () =>
    addresses.value.find((entry) => entry.id === selectedAddressId.value) ?? null,
);
const hasCompleteDraftAddress = computed(() =>
  isAddressDraftComplete(deliveryAddress),
);
const hasUnsavedAddressChanges = computed(() => {
  if (!selectedAddress.value) {
    return hasCompleteDraftAddress.value;
  }

  const payload = toAddressPayload(deliveryAddress);

  return (
    payload.street !== selectedAddress.value.street ||
    payload.city !== selectedAddress.value.city ||
    payload.province !== selectedAddress.value.province ||
    (payload.postal_code ?? null) !== selectedAddress.value.postal_code ||
    (payload.country ?? null) !== selectedAddress.value.country ||
    (payload.address_line ?? null) !== selectedAddress.value.address_line
  );
});

const canReviewOrder = computed(
  () =>
    !!customerId.value &&
    !!draft.companyName.trim() &&
    !!draft.contactName.trim() &&
    !!draft.email.trim() &&
    !!draft.phone.trim() &&
    !!selectedAddress.value &&
    !hasUnsavedAddressChanges.value &&
    hasItems.value,
);

const normalizedNotes = computed(() =>
  [
    `Company: ${draft.companyName.trim()}`,
    `Contact: ${draft.contactName.trim()}`,
    `Email: ${draft.email.trim()}`,
    `Phone: ${draft.phone.trim()}`,
    selectedAddress.value
      ? `Delivery Address:\n${formatAddress(selectedAddress.value)}`
      : "",
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
    : "Complete the contact details, then save or select a delivery address to prepare this cart for the next order step.",
);

const applyAddressDraft = (value?: Partial<Address> | null) => {
  Object.assign(deliveryAddress, toAddressDraft(value));
};

const startNewAddress = () => {
  selectedAddressId.value = null;
  addressError.value = null;
  applyAddressDraft();
};

const syncSelectedAddress = () => {
  if (selectedAddress.value) {
    applyAddressDraft(selectedAddress.value);
    return;
  }

  if (addresses.value.length) {
    selectedAddressId.value = addresses.value[0]?.id ?? null;
    applyAddressDraft(addresses.value[0]);
    return;
  }

  startNewAddress();
};

const loadAddresses = async () => {
  if (!customerId.value) {
    customerAddressesStore.reset();
    startNewAddress();
    return;
  }

  const response = await customerAddressesStore.fetchAddresses(customerId.value, {
    page: 1,
    limit: 20,
  });

  if (response.status === "error") {
    addressError.value =
      response.message || "Delivery addresses could not be loaded.";
    customerAddressesStore.reset();
    startNewAddress();
    return;
  }

  addressError.value = null;
  syncSelectedAddress();
};

watch(
  [customer, user],
  () => {
    draft.companyName ||= customer.value?.company_name ?? "";
    draft.contactName ||=
      customer.value?.contact_name ?? user.value?.full_name ?? "";
    draft.email ||= customer.value?.email ?? user.value?.email ?? "";
    draft.phone ||= customer.value?.phone ?? user.value?.phone ?? "";
  },
  { immediate: true },
);

watch(
  customerId,
  async () => {
    await loadAddresses();
  },
  { immediate: true },
);

const handleSelectAddress = (addressId: string) => {
  selectedAddressId.value = addressId;
  addressError.value = null;
  applyAddressDraft(
    addresses.value.find((entry) => entry.id === addressId) ?? null,
  );
};

const handleSaveAddress = async () => {
  if (!customerId.value) {
    addressError.value = "Sign in again before saving a delivery address.";
    return;
  }

  if (!hasCompleteDraftAddress.value) {
    addressError.value =
      "Complete the PSGC delivery address fields before saving.";
    return;
  }

  addressError.value = null;

  const wasEditing = Boolean(selectedAddressId.value);
  const payload = toAddressPayload(deliveryAddress);
  const response = selectedAddressId.value
    ? await customerAddressesStore.updateAddress(
        customerId.value,
        selectedAddressId.value,
        payload,
      )
    : await customerAddressesStore.addAddress(customerId.value, payload);

  if (response.status === "error") {
    addressError.value =
      response.message || "The delivery address could not be saved.";
    toast.add({
      title: "Address update failed",
      description: addressError.value,
      color: "error",
      icon: "i-lucide-circle-alert",
    });
    return;
  }

  if (response.data?.id) {
    selectedAddressId.value = response.data.id;
    applyAddressDraft(response.data);
  } else {
    await loadAddresses();
  }

  toast.add({
    title: wasEditing ? "Address saved" : "Address added",
    description:
      response.message || "Your delivery address is ready for checkout.",
    color: "success",
    icon: "i-lucide-circle-check",
  });
};

const handleDeleteAddress = async () => {
  if (!customerId.value || !selectedAddress.value) {
    return;
  }

  if (import.meta.client) {
    const confirmed = window.confirm(
      "Delete this delivery address from your checkout address book?",
    );

    if (!confirmed) {
      return;
    }
  }

  const response = await customerAddressesStore.deleteAddress(
    customerId.value,
    selectedAddress.value.id,
  );

  if (response.status === "error") {
    addressError.value =
      response.message || "The delivery address could not be deleted.";
    toast.add({
      title: "Delete failed",
      description: addressError.value,
      color: "error",
      icon: "i-lucide-circle-alert",
    });
    return;
  }

  addressError.value = null;
  syncSelectedAddress();

  toast.add({
    title: "Address removed",
    description:
      response.message || "The delivery address was removed successfully.",
    color: "success",
    icon: "i-lucide-circle-check",
  });
};

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
          <CheckoutContactFormCard
            v-model="draft"
            v-model:delivery-address="deliveryAddress"
            :saved-addresses="addresses"
            :selected-address-id="selectedAddressId"
            :is-address-loading="isAddressLoading"
            :is-address-saving="isAddressSaving"
            :is-address-deleting="isAddressDeleting"
            :address-error="addressError"
            @select-address="handleSelectAddress"
            @start-new-address="startNewAddress"
            @save-address="handleSaveAddress"
            @delete-address="handleDeleteAddress"
          />
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
