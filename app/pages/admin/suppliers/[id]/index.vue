<script setup lang="ts">
import { storeToRefs } from "pinia";
import { formatLongDate } from "~/utils/format";

definePageMeta({
  layout: "admin",
});

const route = useRoute();
const router = useRouter();
const supplierId = computed(() => String(route.params.id));

const supplierStore = useSupplierStore();

await supplierStore.fetchSupplierById(supplierId.value);

const { supplier, supplierMeta } = storeToRefs(supplierStore);
const meta = computed(() => supplierMeta.value[supplierId.value] ?? {});

const goBack = () => router.push("/admin/suppliers");
const editSupplier = () => router.push(`/admin/suppliers/edit/${supplierId.value}`);
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
            <h1 class="mt-2 text-2xl font-semibold">
              Supplier {{ supplier?.name ?? "Not found" }}
            </h1>
            <p class="mt-2 text-sm text-slate-600">
              Review supplier profile, contact, and terms.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <UButton color="neutral" variant="outline" @click="goBack">
              Back to Suppliers
            </UButton>
            <UButton color="primary" @click="editSupplier">
              Edit Supplier
            </UButton>
          </div>
        </div>
      </section>

      <div v-if="supplier">
        <UCard>
          <div class="grid gap-4 md:grid-cols-3">
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Status
              </p>
              <p class="mt-2 text-lg font-semibold text-slate-800">
                {{ meta.status ?? "active" }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Payment terms
              </p>
              <p class="mt-2 text-lg font-semibold text-slate-800">
                {{ meta.payment_terms ?? "Not specified" }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Supplier ID
              </p>
              <p class="mt-2 text-lg font-semibold text-slate-800">
                {{ supplier.id ?? "N/A" }}
              </p>
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Contact name
              </p>
              <p class="mt-2 text-sm text-slate-600">
                {{ supplier.contact_name ?? "No contact" }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Phone
              </p>
              <p class="mt-2 text-sm text-slate-600">
                {{ supplier.phone ?? "No phone" }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Email
              </p>
              <p class="mt-2 text-sm text-slate-600">
                {{ supplier.email ?? "No email" }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Address
              </p>
              <p class="mt-2 text-sm text-slate-600">
                {{ supplier.address ?? "No address" }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Created
              </p>
              <p class="mt-2 text-sm text-slate-600">
                {{
                  supplier.created_at
                    ? formatLongDate(supplier.created_at)
                    : "N/A"
                }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Updated
              </p>
              <p class="mt-2 text-sm text-slate-600">
                {{
                  supplier.updated_at
                    ? formatLongDate(supplier.updated_at)
                    : "N/A"
                }}
              </p>
            </div>
          </div>
        </UCard>
      </div>

      <UCard v-else>
        <p class="text-sm text-slate-600">
          Supplier not found. Check the URL or return to the suppliers list.
        </p>
      </UCard>
    </div>
  </div>
</template>
