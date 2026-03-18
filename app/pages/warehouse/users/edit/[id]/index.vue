<script setup lang="ts">
import type { User, UserRole } from "~/types/user";
import { warehouseUserAssignments, warehouseUsers } from "~/seeds/warehouse-users";
import {
  defaultAssignedWarehouses,
  warehouseOptions,
} from "~/utils/warehouse";

definePageMeta({
  layout: "warehouse",
});

const route = useRoute();
const router = useRouter();
const userId = computed(() => String(route.params.id));

const users = useState<User[]>("warehouse-users", () => [...warehouseUsers]);
const userWarehouses = useState<Record<string, string[]>>(
  "warehouse-user-warehouses",
  () => ({ ...warehouseUserAssignments }),
);

const assignedWarehouses = defaultAssignedWarehouses;

const user = computed(() =>
  users.value.find((entry) => entry.id === userId.value),
);

const hasAccess = computed(() => {
  const warehouses = userWarehouses.value[userId.value] ?? [];
  return warehouses.some((warehouse) =>
    assignedWarehouses.includes(warehouse),
  );
});

const roleOptions: Array<{ label: string; value: UserRole }> = [
  { label: "Warehouse Manager", value: "warehouse_manager" },
  { label: "Staff", value: "staff" },
];

const form = reactive({
  full_name: "",
  email: "",
  phone: "",
  role: "staff" as UserRole,
  is_active: true,
  warehouses: [] as string[],
});

watch(
  () => user.value,
  (value) => {
    form.full_name = value?.full_name ?? "";
    form.email = value?.email ?? "";
    form.phone = value?.phone ?? "";
    form.role = (value?.role ?? "staff") as UserRole;
    form.is_active = value?.is_active ?? true;
    form.warehouses = [...(userWarehouses.value[userId.value] ?? [])];
  },
  { immediate: true },
);

const toggleWarehouse = (warehouse: string, checked: boolean) => {
  if (checked) {
    if (!form.warehouses.includes(warehouse)) {
      form.warehouses.push(warehouse);
    }
  } else {
    form.warehouses = form.warehouses.filter((item) => item !== warehouse);
  }
};

const handleSave = () => {
  if (!user.value?.id || !hasAccess.value) return;
  users.value = users.value.map((entry) =>
    entry.id === user.value!.id
      ? {
          ...entry,
          full_name: form.full_name,
          email: form.email,
          phone: form.phone || null,
          role: form.role,
          is_active: form.is_active,
          updated_at: new Date().toISOString(),
        }
      : entry,
  );

  userWarehouses.value = {
    ...userWarehouses.value,
    [user.value.id]: form.warehouses,
  };

  router.push("/warehouse/users");
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
              Staff Account
            </p>
            <h1 class="mt-2 text-2xl font-semibold">Edit Staff Info</h1>
            <p class="mt-2 text-sm text-slate-600">
              Update staff details and warehouse access.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <UButton color="neutral" variant="outline" to="/warehouse/users">
              Back to Users
            </UButton>
          </div>
        </div>
      </section>

      <UCard v-if="!hasAccess">
        <p class="text-sm text-slate-600">
          This staff account is not assigned to {{ assignedWarehouses.join(", ") }}.
        </p>
      </UCard>

      <UCard v-else-if="user">
        <div class="grid gap-6 md:grid-cols-2">
          <UFormField label="Full name">
            <UInput class="w-full" v-model="form.full_name" />
          </UFormField>
          <UFormField label="Email">
            <UInput class="w-full" v-model="form.email" />
          </UFormField>
          <UFormField label="Phone">
            <UInput class="w-full" v-model="form.phone" />
          </UFormField>
          <UFormField label="Role">
            <USelect
              class="w-full"
              valueKey="value"
              labelKey="label"
              v-model="form.role"
              :items="roleOptions"
            />
          </UFormField>
          <UFormField label="Status">
            <USelect
              class="w-full"
              v-model="form.is_active"
              valueKey="value"
              labelKey="label"
              :items="[
                { label: 'Active', value: true },
                { label: 'Inactive', value: false },
              ]"
            />
          </UFormField>
        </div>

        <div class="mt-6">
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Assigned Warehouses
          </p>
          <div class="mt-3 grid gap-2 md:grid-cols-2">
            <label
              v-for="warehouse in warehouseOptions"
              :key="warehouse"
              class="flex items-center gap-2 rounded-lg border border-slate-200/70 p-3"
            >
              <UCheckbox
                :model-value="form.warehouses.includes(warehouse)"
                @update:model-value="toggleWarehouse(warehouse, $event)"
              />
              <span class="text-sm text-slate-700">{{ warehouse }}</span>
            </label>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-2">
          <UButton color="neutral" variant="ghost" to="/warehouse/users">
            Cancel
          </UButton>
          <UButton color="primary" @click="handleSave">Save Changes</UButton>
        </div>
      </UCard>

      <UCard v-else>
        <p class="text-sm text-slate-600">
          Staff account not found. Check the URL or return to the users list.
        </p>
      </UCard>
    </div>
  </div>
</template>
