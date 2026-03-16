<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { Supplier } from "~/types/supplier";
import { useModal } from "~/composables/admin/useModal";
import ActionConfirmModal from "../../../_components/modals/ActionConfirmModal.vue";

definePageMeta({
  layout: "admin",
});

const route = useRoute();
const router = useRouter();
const supplierId = computed(() => String(route.params.id));

const supplierStore = useSupplierStore();
const { openModal } = useModal();

await supplierStore.fetchSupplierById(supplierId.value);

const { supplier, supplierMeta } = storeToRefs(supplierStore);

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

const draft = reactive({
  name: "",
  contact_name: "",
  phone: "",
  email: "",
  address: "",
  payment_terms: "",
  status: "active",
});

watch(
  () => supplier.value,
  (value) => {
    const meta = supplierMeta.value[supplierId.value] ?? {};
    draft.name = value?.name ?? "";
    draft.contact_name = value?.contact_name ?? "";
    draft.phone = value?.phone ?? "";
    draft.email = value?.email ?? "";
    draft.address = value?.address ?? "";
    draft.payment_terms = meta.payment_terms ?? "";
    draft.status = meta.status ?? "active";
  },
  { immediate: true },
);

const handleSave = async () => {
  if (!supplier.value?.id) return;
  await supplierStore.updateSupplier(supplier.value.id, {
    name: draft.name,
    contact_name: draft.contact_name,
    phone: draft.phone,
    email: draft.email,
    address: draft.address,
  } as Partial<Supplier>);
  supplierStore.updateSupplierPaymentTerms(
    supplier.value.id,
    draft.payment_terms,
  );
  supplierStore.setSupplierStatus(supplier.value.id, draft.status as any);
  router.push("/admin/suppliers");
};

const handleDelete = () => {
  if (!supplier.value?.id) return;
  openModal(ActionConfirmModal, {
    title: "Delete supplier",
    description: `Delete ${supplier.value.name ?? "supplier"}? This cannot be undone.`,
    confirmLabel: "Delete",
    confirmColor: "error",
    onConfirm: async () => {
      await supplierStore.deleteSupplier(supplier.value!.id);
      router.push("/admin/suppliers");
    },
  });
};
</script>

<template>
  <div class="min-h-screen">
    <div class="space-y-6">
      <section class="bg-white p-2">
        <div
          class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Supplier Network
            </p>
            <h1 class="mt-2 text-2xl font-semibold">Edit Supplier</h1>
            <p class="mt-2 text-sm text-slate-600">
              Update contact details, terms, and status.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <UButton color="neutral" variant="outline" to="/admin/suppliers">
              Back to Suppliers
            </UButton>
            <UButton color="error" variant="outline" @click="handleDelete">
              Delete Supplier
            </UButton>
          </div>
        </div>
      </section>

      <UCard v-if="supplier">
        <div class="grid gap-6 md:grid-cols-2">
          <UFormField label="Supplier name">
            <UInput class="w-full" v-model="draft.name" />
          </UFormField>
          <UFormField label="Status">
            <USelect
              class="w-full"
              valueKey="value"
              labelKey="label"
              v-model="draft.status"
              :items="statusOptions"
            />
          </UFormField>
          <UFormField label="Contact name">
            <UInput class="w-full" v-model="draft.contact_name" />
          </UFormField>
          <UFormField label="Phone">
            <UInput class="w-full" v-model="draft.phone" />
          </UFormField>
          <UFormField label="Email">
            <UInput class="w-full" v-model="draft.email" />
          </UFormField>
          <UFormField label="Payment terms">
            <UInput class="w-full" v-model="draft.payment_terms" />
          </UFormField>
        </div>
        <div class="mt-6">
          <UFormField label="Address">
            <UTextarea class="w-full" v-model="draft.address" />
          </UFormField>
        </div>

        <div class="mt-6 flex justify-end gap-2">
          <UButton color="neutral" variant="ghost" to="/admin/suppliers">
            Cancel
          </UButton>
          <UButton color="primary" @click="handleSave">Save Changes</UButton>
        </div>
      </UCard>

      <UCard v-else>
        <p class="text-sm text-slate-600">
          Supplier not found. Check the URL or return to the suppliers list.
        </p>
      </UCard>
    </div>
  </div>
</template>
