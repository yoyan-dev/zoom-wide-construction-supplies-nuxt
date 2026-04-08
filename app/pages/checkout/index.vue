<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { Address } from "~/types/address";
import PsgcAddressFields from "~/components/address/PsgcAddressFields.vue";
import {
  createEmptyAddressDraft,
  formatAddress,
  isAddressDraftComplete,
  toAddressPayload,
} from "~/utils/address";
import { formatCurrency } from "~/utils/format";
import CheckoutReviewList from "./_components/CheckoutReviewList.vue";
import CheckoutSummaryCard from "./_components/CheckoutSummaryCard.vue";

definePageMeta({
  layout: "shop",
});

useSeoMeta({
  title: "Checkout | ZOOM WIDE Construction Supplies",
  description:
    "Confirm delivery details, review your cart, and place a ZOOM WIDE construction supply order.",
});

const cartStore = useCartStore();
const authStore = useAuthStore();
const customerAddressesStore = useCustomerAddressesStore();
const toast = useToast();

const pageError = ref<string | null>(null);
const addressError = ref<string | null>(null);
const isRetrying = ref(false);

const freightZoneOptions = [
  { value: "northeast-regional", label: "Northeast Regional (Zone 4)" },
  { value: "midwest-logistics", label: "Midwest Logistics (Zone 2)" },
  { value: "coastal-industrial", label: "Coastal Industrial (Zone 1)" },
] as const;

const checkoutSteps = [
  {
    label: "Cart review",
    description: "Products and quantities are confirmed.",
  },
  {
    label: "Delivery details",
    description: "Address, freight zone, and notes are set.",
  },
  {
    label: "Submit order",
    description: "Totals are checked before placing the order.",
  },
] as const;

const freightZone = ref<(typeof freightZoneOptions)[number]["value"]>(
  "northeast-regional",
);
const deliveryNotes = ref("");
const selectedAddressId = ref("");
const createAddressMode = ref(false);
const addressDraft = reactive(createEmptyAddressDraft());

const { items, subtotal, itemCount, isLoading, isSyncing, isCheckingOut } =
  storeToRefs(cartStore);
const { isAuthenticated, customer } = storeToRefs(authStore);
const { addresses, isLoading: isAddressesLoading, isSaving: isSavingAddress } =
  storeToRefs(customerAddressesStore);

const customerId = computed(() => customer.value?.id ?? null);

const loadPage = async () => {
  const cartResponse = await cartStore.fetchCart();

  pageError.value =
    cartResponse.status === "success"
      ? null
      : cartResponse.message || "Checkout details could not be loaded.";

  addressError.value = null;

  if (!customerId.value) {
    customerAddressesStore.reset();
    return;
  }

  const addressesResponse = await customerAddressesStore.fetchAddresses(
    customerId.value,
    {
      page: 1,
      limit: 6,
    },
  );

  addressError.value =
    addressesResponse.status === "success"
      ? null
      : addressesResponse.message || "Saved delivery addresses could not be loaded.";
};

await loadPage();

watch(
  () => customerId.value,
  async () => {
    await loadPage();
  },
);

watch(
  addresses,
  (nextAddresses) => {
    if (nextAddresses.length) {
      if (!nextAddresses.some((entry) => entry.id === selectedAddressId.value)) {
        selectedAddressId.value = nextAddresses[0].id;
      }

      if (!createAddressMode.value) {
        return;
      }
    } else if (!createAddressMode.value) {
      createAddressMode.value = true;
    }
  },
  { immediate: true },
);

const freightZoneLabel = computed(
  () =>
    freightZoneOptions.find((option) => option.value === freightZone.value)?.label ||
    freightZoneOptions[0].label,
);

const selectedAddress = computed<Address | null>(
  () =>
    addresses.value.find((entry) => entry.id === selectedAddressId.value) || null,
);

const selectedAddressSummary = computed(() =>
  selectedAddress.value ? formatAddress(selectedAddress.value) : null,
);

const fallbackAddressSummary = computed(
  () =>
    customer.value?.shipping_address || customer.value?.billing_address || null,
);

const effectiveAddressSummary = computed(
  () => selectedAddressSummary.value || fallbackAddressSummary.value,
);

const freightAmount = computed(() =>
  subtotal.value > 0 ? Math.max(145, subtotal.value * 0.08) : 0,
);
const taxAmount = computed(() => subtotal.value * 0.08);
const totalAmount = computed(
  () => subtotal.value + freightAmount.value + taxAmount.value,
);

const canSaveAddress = computed(
  () =>
    Boolean(customerId.value) &&
    isAddressDraftComplete(addressDraft) &&
    !isSavingAddress.value,
);

const canSubmit = computed(() => {
  if (!isAuthenticated.value || !items.value.length || pageError.value) {
    return false;
  }

  if (createAddressMode.value) {
    return canSaveAddress.value && !isCheckingOut.value;
  }

  return Boolean(effectiveAddressSummary.value) && !isCheckingOut.value;
});

const orderNotesPayload = computed(() => {
  const lines = [`Freight zone: ${freightZoneLabel.value}`];

  if (effectiveAddressSummary.value) {
    lines.push(`Delivery address: ${effectiveAddressSummary.value}`);
  }

  if (deliveryNotes.value.trim()) {
    lines.push(`Delivery instructions: ${deliveryNotes.value.trim()}`);
  }

  return lines.join("\n");
});

const resetAddressDraft = () => {
  Object.assign(addressDraft, createEmptyAddressDraft());
};

const handleSaveAddress = async () => {
  if (!customerId.value) {
    return false;
  }

  if (!isAddressDraftComplete(addressDraft)) {
    toast.add({
      title: "Delivery address incomplete",
      description: "Complete the PSGC-backed delivery address fields first.",
      color: "warning",
      icon: "i-lucide-circle-alert",
    });
    return false;
  }

  const response = await customerAddressesStore.addAddress(
    customerId.value,
    toAddressPayload(addressDraft),
  );

  if (response.status === "error" || !response.data?.id) {
    toast.add({
      title: "Address not saved",
      description: response.message || "The delivery address could not be saved.",
      color: "error",
      icon: "i-lucide-circle-alert",
    });
    return false;
  }

  selectedAddressId.value = response.data.id;
  createAddressMode.value = false;
  resetAddressDraft();

  toast.add({
    title: "Address saved",
    description: "The delivery address is now available for checkout.",
    color: "success",
    icon: "i-lucide-circle-check",
  });

  return true;
};

const handlePlaceOrder = async () => {
  if (!isAuthenticated.value) {
    await navigateTo("/auth/login?redirect=/checkout");
    return;
  }

  if (!items.value.length) {
    return;
  }

  if (createAddressMode.value) {
    const saved = await handleSaveAddress();

    if (!saved) {
      return;
    }
  }

  if (!effectiveAddressSummary.value) {
    toast.add({
      title: "Delivery address required",
      description: "Select a saved delivery address or save a new one first.",
      color: "warning",
      icon: "i-lucide-circle-alert",
    });
    return;
  }

  const response = await cartStore.checkoutCart(orderNotesPayload.value);

  if (response.status === "error") {
    toast.add({
      title: "Checkout failed",
      description: response.message || "The order could not be submitted.",
      color: "error",
      icon: "i-lucide-circle-alert",
    });
    return;
  }

  toast.add({
    title: "Order placed",
    description:
      response.message || "Your order has been submitted successfully.",
    color: "success",
    icon: "i-lucide-circle-check",
  });

  await navigateTo(response.data?.id ? `/orders/${response.data.id}` : "/orders");
};

const handleRetry = async () => {
  isRetrying.value = true;
  await loadPage();
  isRetrying.value = false;
};
</script>

<template>
  <StorefrontPageContainer size="wide" class="py-8 md:py-10">
    <StorefrontPageHeader
      eyebrow="Checkout"
      title="Confirm delivery and submit your order"
      :description="`${itemCount} items ready for checkout with ${formatCurrency(subtotal)} in live merchandise subtotal.`"
    >
      <template #actions>
        <div class="rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-left shadow-sm">
          <p class="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Checkout status
          </p>
          <p class="mt-1 text-sm font-semibold text-slate-900">
            {{ isAuthenticated ? "Authenticated customer flow" : "Sign-in required" }}
          </p>
        </div>
      </template>
    </StorefrontPageHeader>

    <StorefrontCheckoutSteps
      class="mt-6"
      :steps="checkoutSteps"
      :active-index="1"
    />

    <StorefrontStateCard
      v-if="pageError"
      class="mt-6"
      eyebrow="Checkout"
      title="Checkout unavailable"
      :description="pageError"
      tone="error"
    >
      <template #actions>
        <StorefrontButton
          tone="danger"
          :loading="isRetrying"
          @click="handleRetry"
        >
          Retry
        </StorefrontButton>
      </template>
    </StorefrontStateCard>

    <StorefrontStateCard
      v-else-if="!isAuthenticated"
      class="mt-6"
      eyebrow="Checkout"
      title="Sign in to continue checkout"
      description="Your cart is ready, but checkout needs an authenticated customer account so the order can be linked to your record."
    >
      <template #actions>
        <div class="flex flex-wrap gap-3">
          <StorefrontButton tone="primary" to="/auth/login?redirect=/checkout">
            Sign in
          </StorefrontButton>
          <StorefrontButton tone="secondary" to="/cart">
            Back to cart
          </StorefrontButton>
        </div>
      </template>
    </StorefrontStateCard>

    <StorefrontStateCard
      v-else-if="!isLoading && !items.length"
      class="mt-6"
      eyebrow="Checkout"
      title="Your cart is empty"
      description="Add products to the cart before continuing to checkout."
    >
      <template #actions>
        <div class="flex flex-wrap gap-3">
          <StorefrontButton tone="primary" to="/shop/catalog">
            Browse catalog
          </StorefrontButton>
          <StorefrontButton tone="secondary" to="/cart">
            View cart
          </StorefrontButton>
        </div>
      </template>
    </StorefrontStateCard>

    <div
      v-else
      class="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_400px]"
    >
      <div class="space-y-6">
        <StorefrontSectionCard class="bg-white" padding="lg">
          <div class="space-y-6">
            <div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p class="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-amber-700">
                  Delivery details
                </p>
                <h2 class="mt-3 text-3xl font-bold tracking-[-0.04em] text-slate-950">
                  Choose a delivery address and logistics notes.
                </h2>
              </div>
              <StorefrontButton tone="secondary" to="/cart">
                Edit cart
              </StorefrontButton>
            </div>

            <UAlert
              v-if="addressError"
              color="warning"
              variant="soft"
              icon="i-lucide-circle-alert"
              :title="addressError"
            />

            <div v-if="addresses.length" class="grid gap-3 md:grid-cols-2">
              <button
                v-for="(address, index) in addresses"
                :key="address.id"
                type="button"
                class="rounded-xl border px-4 py-4 text-left transition"
                :class="
                  address.id === selectedAddressId && !createAddressMode
                    ? 'border-amber-300 bg-amber-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                "
                @click="
                  selectedAddressId = address.id;
                  createAddressMode = false;
                "
              >
                <p class="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Delivery address {{ index + 1 }}
                </p>
                <p class="mt-2 text-sm leading-7 text-slate-700">
                  {{ formatAddress(address) }}
                </p>
              </button>
            </div>

            <div
              v-else-if="fallbackAddressSummary && !createAddressMode"
              class="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <p class="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Customer address on file
              </p>
              <p class="mt-2 text-sm leading-7 text-slate-700">
                {{ fallbackAddressSummary }}
              </p>
            </div>

            <div class="flex flex-wrap gap-3">
              <StorefrontButton
                tone="secondary"
                size="sm"
                @click="createAddressMode = !createAddressMode"
              >
                {{ createAddressMode ? "Hide new address form" : "Add delivery address" }}
              </StorefrontButton>
            </div>

            <div
              v-if="createAddressMode"
              class="rounded-xl border border-slate-200 bg-slate-50/80 p-5"
            >
              <PsgcAddressFields
                v-model="addressDraft"
                title="New delivery address"
                description="Save an address here if the customer needs a dedicated checkout destination."
              />

              <div class="mt-5 flex flex-wrap gap-3">
                <StorefrontButton
                  tone="primary"
                  :loading="isSavingAddress"
                  :disabled="!canSaveAddress"
                  @click="handleSaveAddress"
                >
                  Save address
                </StorefrontButton>
                <StorefrontButton
                  tone="ghost"
                  @click="
                    createAddressMode = false;
                    resetAddressDraft();
                  "
                >
                  Cancel
                </StorefrontButton>
              </div>
            </div>

            <div class="grid gap-5 md:grid-cols-[260px_minmax(0,1fr)]">
              <div>
                <label
                  for="freight-zone"
                  class="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500"
                >
                  Freight zone
                </label>
                <select
                  id="freight-zone"
                  v-model="freightZone"
                  class="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-slate-300"
                >
                  <option
                    v-for="option in freightZoneOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </div>

              <div>
                <label
                  for="delivery-notes"
                  class="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500"
                >
                  Delivery instructions
                </label>
                <textarea
                  id="delivery-notes"
                  v-model="deliveryNotes"
                  rows="4"
                  class="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-900 outline-none transition focus:border-slate-300"
                  placeholder="Gate access, unloading notes, preferred contact person, or job-site timing."
                />
              </div>
            </div>
          </div>
        </StorefrontSectionCard>

        <div>
          <div class="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p class="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-amber-700">
                Order review
              </p>
              <h2 class="mt-3 text-3xl font-bold tracking-[-0.04em] text-slate-950">
                Final item check before submission.
              </h2>
            </div>
            <p class="text-sm leading-7 text-slate-600">
              Quantities are shown as read-only here to keep checkout focused.
            </p>
          </div>

          <CheckoutReviewList :items="items" />
        </div>
      </div>

      <CheckoutSummaryCard
        :item-count="itemCount"
        :subtotal="subtotal"
        :freight-amount="freightAmount"
        :tax-amount="taxAmount"
        :total-amount="totalAmount"
        :freight-zone-label="freightZoneLabel"
        :address-summary="effectiveAddressSummary"
        :delivery-notes="deliveryNotes"
        :can-submit="canSubmit"
        :is-submitting="isCheckingOut || isSyncing || isSavingAddress"
        @submit="handlePlaceOrder"
      />
    </div>
  </StorefrontPageContainer>
</template>
