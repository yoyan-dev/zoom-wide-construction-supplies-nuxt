<script setup lang="ts">
import type { Supplier } from "~/types/supplier";
import { useModal } from "~/composables/admin/useModal";
import ActionFormModal from "../../../_components/modals/ActionFormModal.vue";
import SupplierViewModal from "../modals/SupplierViewModal.vue";
import SupplierDeleteModal from "../modals/SupplierDeleteModal.vue";
import SupplierOrdersModal from "../modals/SupplierOrdersModal.vue";

type ActionItem = {
  label: string;
  icon: string;
  color?: string;
  to?: string;
  onClick?: () => void | Promise<void>;
};

const props = defineProps<{
  supplier: Supplier;
}>();

const { openModal } = useModal();
const supplierStore = useSupplierStore();

const supplierId = computed(() => props.supplier.id ?? "");

const openForm = (payload: {
  title: string;
  description?: string;
  fields: Array<{
    key: string;
    label: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
    value?: string | number;
  }>;
  confirmLabel?: string;
  confirmColor?: string;
  onSubmit: (values: Record<string, string | number>) => Promise<void> | void;
}) => {
  openModal(ActionFormModal, payload);
};

const openUpdatePaymentTerms = () => {
  openForm({
    title: "Update Payment Terms",
    confirmLabel: "Update",
    fields: [
      {
        key: "payment_terms",
        label: "Payment terms",
        placeholder: "Net 30",
      },
    ],
    onSubmit: async (values) => {
      supplierStore.updateSupplierPaymentTerms(
        supplierId.value,
        String(values.payment_terms ?? ""),
      );
    },
  });
};

const openUpdateContact = () => {
  openForm({
    title: "Update Contact Info",
    confirmLabel: "Update",
    fields: [
      {
        key: "contact_name",
        label: "Contact name",
        placeholder: "Jordan Lee",
        value: props.supplier.contact_name ?? "",
      },
      {
        key: "phone",
        label: "Phone",
        placeholder: "+1 555 000 0000",
        value: props.supplier.phone ?? "",
      },
      {
        key: "email",
        label: "Email",
        placeholder: "supplier@example.com",
        value: props.supplier.email ?? "",
      },
    ],
    onSubmit: async (values) => {
      await supplierStore.updateSupplier(supplierId.value, {
        contact_name: String(values.contact_name ?? ""),
        phone: String(values.phone ?? ""),
        email: String(values.email ?? ""),
      });
    },
  });
};

const viewActions = computed<ActionItem[]>(() => [
  {
    label: "View Supplier",
    icon: "i-lucide-eye",
    to: `/admin/suppliers/${supplierId.value}`,
  },
  {
    label: "View Supplier Details",
    icon: "i-lucide-clipboard",
    onClick: () => openModal(SupplierViewModal, props.supplier),
  },
  {
    label: "View Supplier Orders",
    icon: "i-lucide-shopping-cart",
    onClick: () => openModal(SupplierOrdersModal, props.supplier),
  },
]);

const editActions = computed<ActionItem[]>(() => [
  {
    label: "Edit Supplier",
    icon: "i-lucide-pencil",
    to: `/admin/suppliers/edit/${supplierId.value}`,
  },
  {
    label: "Update Payment Terms",
    icon: "i-lucide-clipboard-check",
    onClick: openUpdatePaymentTerms,
  },
  {
    label: "Update Contact Info",
    icon: "i-lucide-user-circle",
    onClick: openUpdateContact,
  },
]);

const statusActions = computed<ActionItem[]>(() => [
  {
    label: "Mark as Active",
    icon: "i-lucide-check-circle",
    onClick: () => supplierStore.setSupplierStatus(supplierId.value, "active"),
  },
  {
    label: "Mark as Inactive",
    icon: "i-lucide-x-circle",
    onClick: () => supplierStore.setSupplierStatus(supplierId.value, "inactive"),
  },
]);

const adminActions = computed<ActionItem[]>(() => [
  {
    label: "Delete Supplier",
    icon: "i-lucide-trash",
    color: "error",
    onClick: () => openModal(SupplierDeleteModal, props.supplier),
  },
  {
    label: "Duplicate Supplier",
    icon: "i-lucide-copy",
    onClick: () => supplierStore.duplicateSupplier(supplierId.value),
  },
]);

const handleAction = async (action: ActionItem, close: () => void) => {
  if (action.onClick) {
    await action.onClick();
  }
  close();
};
</script>

<template>
  <UPopover :dismissible="false" :ui="{ content: 'p-4' }">
    <UButton
      icon="i-lucide-ellipsis-vertical"
      variant="ghost"
      color="neutral"
      size="sm"
    />

    <template #content="{ close }">
      <div class="flex items-center justify-between gap-4 mb-4 w-full">
        <h2 class="text-highlighted font-semibold">Actions</h2>

        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-x"
          @click="close"
        />
      </div>

      <div class="flex flex-col gap-3 min-w-64">
        <div class="flex flex-col gap-1">
          <p class="px-2 text-xs uppercase tracking-[0.18em] text-slate-500">
            View / Info
          </p>
          <UButton
            v-for="action in viewActions"
            :key="action.label"
            :icon="action.icon"
            :color="action.color ?? 'neutral'"
            variant="ghost"
            size="sm"
            class="w-full justify-start"
            :to="action.to"
            @click="handleAction(action, close)"
          >
            {{ action.label }}
          </UButton>
        </div>

        <UDivider />

        <div class="flex flex-col gap-1">
          <p class="px-2 text-xs uppercase tracking-[0.18em] text-slate-500">
            Edit / Update
          </p>
          <UButton
            v-for="action in editActions"
            :key="action.label"
            :icon="action.icon"
            :color="action.color ?? 'neutral'"
            variant="ghost"
            size="sm"
            class="w-full justify-start"
            :to="action.to"
            @click="handleAction(action, close)"
          >
            {{ action.label }}
          </UButton>
        </div>

        <UDivider />

        <div class="flex flex-col gap-1">
          <p class="px-2 text-xs uppercase tracking-[0.18em] text-slate-500">
            Status / Availability
          </p>
          <UButton
            v-for="action in statusActions"
            :key="action.label"
            :icon="action.icon"
            :color="action.color ?? 'neutral'"
            variant="ghost"
            size="sm"
            class="w-full justify-start"
            :to="action.to"
            @click="handleAction(action, close)"
          >
            {{ action.label }}
          </UButton>
        </div>

        <UDivider />

        <div class="flex flex-col gap-1">
          <p class="px-2 text-xs uppercase tracking-[0.18em] text-slate-500">
            Admin / Delete / Duplicate
          </p>
          <UButton
            v-for="action in adminActions"
            :key="action.label"
            :icon="action.icon"
            :color="action.color ?? 'neutral'"
            variant="ghost"
            size="sm"
            class="w-full justify-start"
            :to="action.to"
            @click="handleAction(action, close)"
          >
            {{ action.label }}
          </UButton>
        </div>
      </div>
    </template>
  </UPopover>
</template>
