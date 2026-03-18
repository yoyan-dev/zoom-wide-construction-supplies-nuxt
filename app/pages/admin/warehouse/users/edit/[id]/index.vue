<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { User, UserRole } from "~/types/user";
import { useModal } from "~/composables/admin/useModal";
import ActionConfirmModal from "~/pages/admin/_components/modals/ActionConfirmModal.vue";

definePageMeta({
  layout: "admin",
});

const route = useRoute();
const router = useRouter();
const userId = computed(() => String(route.params.id));

const warehouseUsersStore = useWarehouseUsersStore();
const { openModal } = useModal();

await warehouseUsersStore.fetchUsers();

const { users, assignments } = storeToRefs(warehouseUsersStore);

const role = useState<UserRole>("current-role", () => "admin");
const hasAccess = computed(() => role.value === "admin");

const user = computed(() =>
  users.value.find((item) => item.id === userId.value),
);

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

const roleOptions = [
  { label: "Warehouse Manager", value: "warehouse_manager" },
  { label: "Staff", value: "staff" },
  { label: "Admin", value: "admin" },
  { label: "Manager", value: "manager" },
];

const draft = reactive({
  full_name: "",
  email: "",
  phone: "",
  role: "staff",
  status: "active",
  warehouses: "",
});

watch(
  () => user.value,
  (value) => {
    draft.full_name = value?.full_name ?? "";
    draft.email = value?.email ?? "";
    draft.phone = value?.phone ?? "";
    draft.role = value?.role ?? "staff";
    draft.status = value?.is_active ? "active" : "inactive";
    draft.warehouses =
      (assignments.value[value?.id ?? ""] ?? []).join(", ") ?? "";
  },
  { immediate: true },
);

const handleSave = async () => {
  if (!user.value?.id) return;

  await warehouseUsersStore.updateUser(user.value.id, {
    full_name: draft.full_name,
    email: draft.email,
    phone: draft.phone,
    role: draft.role as UserRole,
    is_active: draft.status === "active",
  } as Partial<User>);

  const nextAssignments = draft.warehouses
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  warehouseUsersStore.updateAssignments(user.value.id, nextAssignments);

  router.push("/admin/warehouse/users");
};

const handleDelete = () => {
  if (!user.value?.id) return;
  openModal(ActionConfirmModal, {
    title: "Delete account",
    description: `Delete ${user.value.full_name}? This cannot be undone.`,
    confirmLabel: "Delete",
    confirmColor: "error",
    onConfirm: async () => {
      await warehouseUsersStore.deleteUser(user.value!.id);
      router.push("/admin/warehouse/users");
    },
  });
};
</script>

<template>
  <div class="min-h-screen">
    <div class="space-y-6">
      <section class="bg-white p-2">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Warehouse Users
            </p>
            <h1 class="mt-2 text-2xl font-semibold">Edit User</h1>
            <p class="mt-2 text-sm text-slate-600">
              Update staff profile, role, and warehouse assignments.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <UButton color="neutral" variant="outline" to="/admin/warehouse/users">
              Back to Users
            </UButton>
            <UButton color="error" variant="outline" @click="handleDelete">
              Delete Account
            </UButton>
          </div>
        </div>
      </section>

      <UCard v-if="!hasAccess">
        <p class="text-sm text-slate-600">
          You do not have permission to edit this user.
        </p>
      </UCard>

      <UCard v-else-if="user">
        <div class="grid gap-6 md:grid-cols-2">
          <UFormField label="Full name">
            <UInput class="w-full" v-model="draft.full_name" />
          </UFormField>
          <UFormField label="Role">
            <USelect
              class="w-full"
              valueKey="value"
              labelKey="label"
              v-model="draft.role"
              :items="roleOptions"
            />
          </UFormField>
          <UFormField label="Email">
            <UInput class="w-full" v-model="draft.email" />
          </UFormField>
          <UFormField label="Phone">
            <UInput class="w-full" v-model="draft.phone" />
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
        </div>

        <div class="mt-6">
          <UFormField label="Assigned warehouses">
            <UTextarea
              class="w-full"
              v-model="draft.warehouses"
              placeholder="Central Warehouse, East Storage"
            />
          </UFormField>
        </div>

        <div class="mt-6 flex justify-end gap-2">
          <UButton color="neutral" variant="ghost" to="/admin/warehouse/users">
            Cancel
          </UButton>
          <UButton color="primary" @click="handleSave">Save Changes</UButton>
        </div>
      </UCard>

      <UCard v-else>
        <p class="text-sm text-slate-600">
          User not found. Check the URL or return to the users list.
        </p>
      </UCard>
    </div>
  </div>
</template>
