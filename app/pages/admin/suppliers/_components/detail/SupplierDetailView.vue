<script setup lang="ts">
import { storeToRefs } from "pinia";
import AdminPageStateCard from "../../../_components/AdminPageStateCard.vue";
import SupplierDeleteModal from "../modals/SupplierDeleteModal.vue";
import SupplierEditModal from "../modals/SupplierEditModal.vue";
import SupplierStatusModal from "../modals/SupplierStatusModal.vue";
import {
  getSupplierStatusColor,
  getSupplierStatusLabel,
} from "../supplier-options";
import { useAdminPageLoadState } from "~/composables/admin/useAdminPageLoadState";
import { useModal } from "~/composables/admin/useModal";
import { formatLongDate } from "~/utils/format";

const props = withDefaults(
  defineProps<{
    supplierId: string;
    backTo?: string;
  }>(),
  {
    backTo: "/admin/suppliers",
  },
);

const authStore = useAuthStore();
const supplierStore = useSupplierStore();
const { getLoadErrorMessage, isMissingResourceResponse } =
  useAdminPageLoadState();
const { openModal } = useModal();
const router = useRouter();
const pageError = ref<string | null>(null);
const isMissingSupplier = ref(false);
const isRetrying = ref(false);

const loadPage = async () => {
  const supplierResponse = await supplierStore.fetchSupplierById(
    props.supplierId,
  );

  isMissingSupplier.value = isMissingResourceResponse(supplierResponse);
  pageError.value =
    supplierResponse.status === "error" && !isMissingSupplier.value
      ? getLoadErrorMessage(
          [supplierResponse],
          "The supplier could not be loaded right now.",
        )
      : null;
};

await loadPage();

const { supplier } = storeToRefs(supplierStore);

const goBack = () => {
  void router.push(props.backTo);
};

const editSupplier = () => {
  if (!authStore.hasAnyRole(["admin"])) return;
  if (!supplier.value) return;
  void openModal(SupplierEditModal, supplier.value);
};

const toggleStatus = () => {
  if (!authStore.hasAnyRole(["admin"])) return;
  if (!supplier.value) return;
  void openModal(SupplierStatusModal, supplier.value);
};

const deleteSupplier = () => {
  if (!authStore.hasAnyRole(["admin"])) return;
  if (!supplier.value) return;
  void openModal(SupplierDeleteModal, supplier.value);
};

const retryLoad = async () => {
  isRetrying.value = true;
  await loadPage();
  isRetrying.value = false;
};
</script>

<template>
  <div class="min-h-screen">
    <div class="space-y-6">
      <section class="rounded-sm bg-white p-2 dark:bg-gray-900">
        <div
          class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Supplier Management
            </p>
            <h1 class="mt-2 text-2xl font-semibold">
              {{ supplier?.business_name ?? "Supplier not found" }}
            </h1>
            <p class="mt-2 text-sm text-slate-600">
              Review supplier profile details, linked sign-in information, and
              activation state for this supplier account.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <UButton color="neutral" variant="outline" @click="goBack">
              Back to Suppliers
            </UButton>
            <UButton
              v-if="supplier?.id && authStore.hasAnyRole(['admin'])"
              color="primary"
              @click="editSupplier"
            >
              Edit Supplier
            </UButton>
            <UButton
              v-if="supplier?.id && authStore.hasAnyRole(['admin'])"
              :color="supplier?.is_active === false ? 'success' : 'warning'"
              variant="soft"
              @click="toggleStatus"
            >
              {{ supplier?.is_active === false ? "Activate" : "Deactivate" }}
            </UButton>
            <UButton
              v-if="supplier?.id && authStore.hasAnyRole(['admin'])"
              color="error"
              variant="soft"
              @click="deleteSupplier"
            >
              Delete Supplier
            </UButton>
          </div>
        </div>
      </section>

      <AdminPageStateCard
        v-if="pageError"
        eyebrow="Supplier Details"
        title="Supplier unavailable"
        :description="pageError"
        tone="error"
        action-label="Retry"
        :action-loading="isRetrying"
        @action="retryLoad"
      />

      <AdminPageStateCard
        v-else-if="isMissingSupplier || !supplier"
        eyebrow="Supplier Details"
        title="Supplier not found"
        description="Check the URL or return to the suppliers list."
        action-label="Back to Suppliers"
        action-color="neutral"
        action-icon="i-lucide-arrow-left"
        @action="goBack"
      />

      <template v-else>
        <div
          class="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)] xl:items-start"
        >
          <UCard>
            <div class="space-y-6">
              <div class="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Supplier identity
                  </p>
                  <p class="mt-2 text-xl font-semibold text-slate-900">
                    {{ supplier.business_name }}
                  </p>
                  <p class="mt-1 text-sm text-slate-600">
                    {{ supplier.email }}
                  </p>
                </div>

                <UBadge
                  :color="getSupplierStatusColor(supplier.is_active)"
                  variant="subtle"
                >
                  {{ getSupplierStatusLabel(supplier.is_active) }}
                </UBadge>
              </div>

              <div class="grid gap-4 md:grid-cols-2">
                <div class="rounded-sm border border-slate-200/70 bg-white p-4 dark:bg-gray-900">
                  <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Contact Person
                  </p>
                  <p class="mt-2 font-medium text-slate-900">
                    {{ supplier.contact_person }}
                  </p>
                </div>

                <div class="rounded-sm border border-slate-200/70 bg-white p-4 dark:bg-gray-900">
                  <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Phone
                  </p>
                  <p class="mt-2 font-medium text-slate-900">
                    {{ supplier.phone ?? "No phone number" }}
                  </p>
                </div>

                <div class="rounded-sm border border-slate-200/70 bg-white p-4 dark:bg-gray-900 md:col-span-2">
                  <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Address
                  </p>
                  <p class="mt-2 whitespace-pre-line font-medium text-slate-900">
                    {{ supplier.address ?? "No address provided" }}
                  </p>
                </div>

                <div class="rounded-sm border border-slate-200/70 bg-white p-4 dark:bg-gray-900">
                  <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Supplier ID
                  </p>
                  <p class="mt-2 break-all font-medium text-slate-900">
                    {{ supplier.id }}
                  </p>
                </div>

                <div class="rounded-sm border border-slate-200/70 bg-white p-4 dark:bg-gray-900">
                  <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Linked User ID
                  </p>
                  <p class="mt-2 break-all font-medium text-slate-900">
                    {{ supplier.user_id ?? "No linked user id" }}
                  </p>
                </div>
              </div>
            </div>
          </UCard>

          <div class="space-y-6">
            <UCard>
              <div class="space-y-4">
                <div>
                  <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Lifecycle
                  </p>
                  <p class="mt-1 text-lg font-semibold text-slate-900">
                    Account timestamps
                  </p>
                </div>

                <div class="rounded-sm border border-slate-200/70 bg-white p-4 dark:bg-gray-900">
                  <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Created
                  </p>
                  <p class="mt-2 font-medium text-slate-900">
                    {{ formatLongDate(supplier.created_at) }}
                  </p>
                </div>

                <div class="rounded-sm border border-slate-200/70 bg-white p-4 dark:bg-gray-900">
                  <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Updated
                  </p>
                  <p class="mt-2 font-medium text-slate-900">
                    {{ formatLongDate(supplier.updated_at) }}
                  </p>
                </div>
              </div>
            </UCard>

            <UCard>
              <div class="space-y-4">
                <div>
                  <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Module Scope
                  </p>
                  <p class="mt-1 text-lg font-semibold text-slate-900">
                    Supplier-only account
                  </p>
                </div>

                <p class="text-sm leading-6 text-slate-600">
                  Suppliers are managed in a dedicated admin module so their
                  business records stay separate from customers, drivers, and
                  internal users.
                </p>
              </div>
            </UCard>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
