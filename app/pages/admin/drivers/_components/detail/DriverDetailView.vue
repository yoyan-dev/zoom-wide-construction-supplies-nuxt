<script setup lang="ts">
import { storeToRefs } from "pinia";
import AdminPageStateCard from "../../../_components/AdminPageStateCard.vue";
import DriverDeleteModal from "../modals/DriverDeleteModal.vue";
import DriverEditModal from "../modals/DriverEditModal.vue";
import DriverStatusModal from "../modals/DriverStatusModal.vue";
import { useAdminPageLoadState } from "~/composables/admin/useAdminPageLoadState";
import { useModal } from "~/composables/admin/useModal";
import { formatLongDate } from "~/utils/format";
import {
  getDriverStatusColor,
  getDriverStatusLabel,
} from "../driver-options";

const props = defineProps<{
  driverId: string;
}>();

const driverStore = useDriverStore();
const { canManageUsers } = useAdminPermissions();
const { getLoadErrorMessage, isMissingResourceResponse } =
  useAdminPageLoadState();
const { openModal } = useModal();
const router = useRouter();
const pageError = ref<string | null>(null);
const isMissingDriver = ref(false);
const isRetrying = ref(false);

const loadPage = async () => {
  const driverResponse = await driverStore.fetchDriverById(props.driverId);

  isMissingDriver.value = isMissingResourceResponse(driverResponse);
  pageError.value =
    driverResponse.status === "error" && !isMissingDriver.value
      ? getLoadErrorMessage(
          [driverResponse],
          "The driver could not be loaded right now.",
        )
      : null;
};

await loadPage();

const { driver } = storeToRefs(driverStore);

const goBack = () => {
  void router.push("/admin/drivers");
};

const editDriver = () => {
  if (!canManageUsers.value) return;
  if (!driver.value) return;
  void openModal(DriverEditModal, driver.value);
};

const toggleStatus = () => {
  if (!canManageUsers.value) return;
  if (!driver.value) return;
  void openModal(DriverStatusModal, driver.value);
};

const deleteDriver = () => {
  if (!canManageUsers.value) return;
  if (!driver.value) return;
  void openModal(DriverDeleteModal, driver.value);
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
              Driver Management
            </p>
            <h1 class="mt-2 text-2xl font-semibold">
              {{ driver?.name ?? "Driver not found" }}
            </h1>
            <p class="mt-2 text-sm text-slate-600">
              Review the delivery account details, contact information, and
              activation state for this driver.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <UButton color="neutral" variant="outline" @click="goBack">
              Back to Drivers
            </UButton>
            <UButton
              v-if="driver?.id && canManageUsers"
              color="primary"
              @click="editDriver"
            >
              Edit Driver
            </UButton>
            <UButton
              v-if="driver?.id && canManageUsers"
              :color="driver?.is_active === false ? 'success' : 'warning'"
              variant="soft"
              @click="toggleStatus"
            >
              {{ driver?.is_active === false ? "Activate" : "Deactivate" }}
            </UButton>
            <UButton
              v-if="driver?.id && canManageUsers"
              color="error"
              variant="soft"
              @click="deleteDriver"
            >
              Delete Driver
            </UButton>
          </div>
        </div>
      </section>

      <AdminPageStateCard
        v-if="pageError"
        eyebrow="Driver Details"
        title="Driver unavailable"
        :description="pageError"
        tone="error"
        action-label="Retry"
        :action-loading="isRetrying"
        @action="retryLoad"
      />

      <AdminPageStateCard
        v-else-if="isMissingDriver || !driver"
        eyebrow="Driver Details"
        title="Driver not found"
        description="Check the URL or return to the drivers list."
        action-label="Back to Drivers"
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
                    Driver identity
                  </p>
                  <p class="mt-2 text-xl font-semibold text-slate-900">
                    {{ driver.name }}
                  </p>
                  <p class="mt-1 text-sm text-slate-600">
                    {{ driver.email ?? "No email assigned" }}
                  </p>
                </div>

                <UBadge
                  :color="getDriverStatusColor(driver.is_active)"
                  variant="subtle"
                >
                  {{ getDriverStatusLabel(driver.is_active) }}
                </UBadge>
              </div>

              <div class="grid gap-4 md:grid-cols-2">
                <div class="rounded-sm border border-slate-200/70 bg-white p-4 dark:bg-gray-900">
                  <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Phone
                  </p>
                  <p class="mt-2 font-medium text-slate-900">
                    {{ driver.phone ?? "No phone number" }}
                  </p>
                </div>

                <div class="rounded-sm border border-slate-200/70 bg-white p-4 dark:bg-gray-900">
                  <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Driver ID
                  </p>
                  <p class="mt-2 break-all font-medium text-slate-900">
                    {{ driver.id }}
                  </p>
                </div>

                <div class="rounded-sm border border-slate-200/70 bg-white p-4 dark:bg-gray-900">
                  <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                    License Number
                  </p>
                  <p class="mt-2 font-medium text-slate-900">
                    {{ driver.license_number ?? "No license number" }}
                  </p>
                </div>

                <div class="rounded-sm border border-slate-200/70 bg-white p-4 dark:bg-gray-900">
                  <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Vehicle Number
                  </p>
                  <p class="mt-2 font-medium text-slate-900">
                    {{ driver.vehicle_number ?? "No vehicle number" }}
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
                    {{ formatLongDate(driver.created_at) }}
                  </p>
                </div>

                <div class="rounded-sm border border-slate-200/70 bg-white p-4 dark:bg-gray-900">
                  <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Updated
                  </p>
                  <p class="mt-2 font-medium text-slate-900">
                    {{ formatLongDate(driver.updated_at) }}
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
                    Driver-only account
                  </p>
                </div>

                <p class="text-sm leading-6 text-slate-600">
                  Drivers are managed in a separate admin module and should stay
                  distinct from internal users and customer accounts.
                </p>
              </div>
            </UCard>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
