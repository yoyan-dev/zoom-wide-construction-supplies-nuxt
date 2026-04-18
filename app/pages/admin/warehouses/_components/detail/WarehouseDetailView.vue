<script setup lang="ts">
import { storeToRefs } from "pinia";
import AdminPermissionNotice from "../../../_components/AdminPermissionNotice.vue";
import AdminPageStateCard from "../../../_components/AdminPageStateCard.vue";
import WarehouseDeleteModal from "../modals/WarehouseDeleteModal.vue";
import WarehouseEditModal from "../modals/WarehouseEditModal.vue";
import WarehouseStatusModal from "../modals/WarehouseStatusModal.vue";
import { useAdminPageLoadState } from "~/composables/admin/useAdminPageLoadState";
import { useModal } from "~/composables/admin/useModal";
import { formatLongDate } from "~/utils/format";
import {
  getWarehouseStatusColor,
  getWarehouseStatusLabel,
} from "../warehouse-options";

const props = defineProps<{
  warehouseId: string;
}>();

const authStore = useAuthStore();
const warehouseStore = useWarehouseStore();
const { getLoadErrorMessage, isMissingResourceResponse } =
  useAdminPageLoadState();
const { openModal } = useModal();
const router = useRouter();
const pageError = ref<string | null>(null);
const isMissingWarehouse = ref(false);
const isRetrying = ref(false);

const loadPage = async () => {
  const warehouseResponse = await warehouseStore.fetchWarehouseById(
    props.warehouseId,
  );

  isMissingWarehouse.value = isMissingResourceResponse(warehouseResponse);
  pageError.value =
    warehouseResponse.status === "error" && !isMissingWarehouse.value
      ? getLoadErrorMessage(
          [warehouseResponse],
          "The warehouse could not be loaded right now.",
        )
      : null;
};

await loadPage();

const { warehouse } = storeToRefs(warehouseStore);

const goBack = () => {
  void router.push("/admin/warehouses");
};

const editWarehouse = () => {
  if (!authStore.hasAnyRole(["admin", "warehouse_manager"])) return;
  if (!warehouse.value) return;
  void openModal(WarehouseEditModal, warehouse.value);
};

const toggleStatus = () => {
  if (!authStore.hasAnyRole(["admin", "warehouse_manager"])) return;
  if (!warehouse.value) return;
  void openModal(WarehouseStatusModal, warehouse.value);
};

const deleteWarehouse = () => {
  if (!authStore.hasAnyRole(["admin", "warehouse_manager"])) return;
  if (!warehouse.value) return;
  void openModal(WarehouseDeleteModal, warehouse.value);
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
              Warehouse Management
            </p>
            <h1 class="mt-2 text-2xl font-semibold">
              {{ warehouse?.name ?? "Warehouse not found" }}
            </h1>
            <p class="mt-2 text-sm text-slate-600">
              Review the stock location, operational capacity, manager link,
              and current warehouse status.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <UButton color="neutral" variant="outline" @click="goBack">
              Back to Warehouses
            </UButton>
            <UButton
              v-if="
                warehouse?.id &&
                authStore.hasAnyRole(['admin', 'warehouse_manager'])
              "
              color="primary"
              @click="editWarehouse"
            >
              Edit Warehouse
            </UButton>
            <UButton
              v-if="
                warehouse?.id &&
                authStore.hasAnyRole(['admin', 'warehouse_manager'])
              "
              :color="warehouse?.status === 'active' ? 'warning' : 'success'"
              variant="soft"
              @click="toggleStatus"
            >
              {{ warehouse?.status === "active" ? "Deactivate" : "Activate" }}
            </UButton>
            <UButton
              v-if="
                warehouse?.id &&
                authStore.hasAnyRole(['admin', 'warehouse_manager'])
              "
              color="error"
              variant="soft"
              @click="deleteWarehouse"
            >
              Delete Warehouse
            </UButton>
          </div>
        </div>
      </section>

      <AdminPageStateCard
        v-if="pageError"
        eyebrow="Warehouse Details"
        title="Warehouse unavailable"
        :description="pageError"
        tone="error"
        action-label="Retry"
        :action-loading="isRetrying"
        @action="retryLoad"
      />

      <AdminPageStateCard
        v-else-if="isMissingWarehouse || !warehouse"
        eyebrow="Warehouse Details"
        title="Warehouse not found"
        description="Check the URL or return to the warehouses list."
        action-label="Back to Warehouses"
        action-color="neutral"
        action-icon="i-lucide-arrow-left"
        @action="goBack"
      />

      <template v-else>
        <AdminPermissionNotice
          v-if="!authStore.hasAnyRole(['admin', 'warehouse_manager'])"
          description="Your role can review this warehouse, but warehouse update, status, and delete actions are restricted to warehouse-authorized accounts."
        />

        <div
          class="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)] xl:items-start"
        >
          <UCard>
            <div class="space-y-6">
              <div class="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Warehouse identity
                  </p>
                  <p class="mt-2 text-xl font-semibold text-slate-900">
                    {{ warehouse.name }}
                  </p>
                  <p class="mt-1 text-sm text-slate-600">
                    {{ warehouse.address }}
                  </p>
                </div>

                <UBadge
                  :color="getWarehouseStatusColor(warehouse.status)"
                  variant="subtle"
                >
                  {{ getWarehouseStatusLabel(warehouse.status) }}
                </UBadge>
              </div>

              <div class="grid gap-4 md:grid-cols-2">
                <div class="rounded-sm border border-slate-200/70 bg-white p-4 dark:bg-gray-900">
                  <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Capacity
                  </p>
                  <p class="mt-2 font-medium text-slate-900">
                    {{ Number(warehouse.capacity ?? 0).toLocaleString() }}
                  </p>
                </div>

                <div class="rounded-sm border border-slate-200/70 bg-white p-4 dark:bg-gray-900">
                  <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Manager ID
                  </p>
                  <p class="mt-2 break-all font-medium text-slate-900">
                    {{ warehouse.manager_id ?? "No manager assigned" }}
                  </p>
                </div>

                <div class="rounded-sm border border-slate-200/70 bg-white p-4 dark:bg-gray-900 md:col-span-2">
                  <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Warehouse ID
                  </p>
                  <p class="mt-2 break-all font-medium text-slate-900">
                    {{ warehouse.id }}
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
                    Warehouse timestamps
                  </p>
                </div>

                <div class="rounded-sm border border-slate-200/70 bg-white p-4 dark:bg-gray-900">
                  <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Created
                  </p>
                  <p class="mt-2 font-medium text-slate-900">
                    {{ formatLongDate(warehouse.created_at) }}
                  </p>
                </div>

                <div class="rounded-sm border border-slate-200/70 bg-white p-4 dark:bg-gray-900">
                  <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Updated
                  </p>
                  <p class="mt-2 font-medium text-slate-900">
                    {{ formatLongDate(warehouse.updated_at) }}
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
                    Admin warehouse record
                  </p>
                </div>

                <p class="text-sm leading-6 text-slate-600">
                  Warehouses define stock locations used by product assignment
                  and inventory visibility across the admin workspace.
                </p>
              </div>
            </UCard>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
