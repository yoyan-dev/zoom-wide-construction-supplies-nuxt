<script setup lang="ts">
import { storeToRefs } from "pinia";
import { formatLongDate } from "~/utils/format";
import type { UserRole } from "~/types/user";

definePageMeta({
  layout: "admin",
});

const route = useRoute();
const router = useRouter();
const userId = computed(() => String(route.params.id));

const warehouseUsersStore = useWarehouseUsersStore();

await warehouseUsersStore.fetchUsers();

const { users, assignments } = storeToRefs(warehouseUsersStore);

const role = useState<UserRole>("current-role", () => "admin");
const hasAccess = computed(() => role.value === "admin");

const user = computed(() =>
  users.value.find((item) => item.id === userId.value),
);

const assignedWarehouses = computed(
  () => assignments.value[userId.value] ?? [],
);

const goBack = () => router.push("/admin/warehouse/users");
const editUser = () => router.push(`/admin/warehouse/users/edit/${userId.value}`);
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
            <h1 class="mt-2 text-2xl font-semibold">
              {{ user?.full_name ?? "Warehouse User" }}
            </h1>
            <p class="mt-2 text-sm text-slate-600">
              Review staff profile, access, and warehouse assignments.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <UButton color="neutral" variant="outline" @click="goBack">
              Back to Users
            </UButton>
            <UButton v-if="user" color="primary" @click="editUser">
              Edit User
            </UButton>
          </div>
        </div>
      </section>

      <UCard v-if="!hasAccess">
        <p class="text-sm text-slate-600">
          You do not have permission to view this user.
        </p>
      </UCard>

      <template v-else>
        <div v-if="user" class="space-y-6">
          <UCard>
            <div class="grid gap-4 md:grid-cols-3">
              <div>
                <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Status
                </p>
                <p class="mt-2 text-lg font-semibold text-slate-800">
                  {{ user.is_active ? "Active" : "Inactive" }}
                </p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Role
                </p>
                <p class="mt-2 text-lg font-semibold text-slate-800">
                  {{ user.role.replace("_", " ") }}
                </p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                  User ID
                </p>
                <p class="mt-2 text-lg font-semibold text-slate-800">
                  {{ user.id }}
                </p>
              </div>
            </div>
          </UCard>

          <UCard>
            <div class="grid gap-4 md:grid-cols-2">
              <div>
                <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Email
                </p>
                <p class="mt-2 text-sm text-slate-600">
                  {{ user.email }}
                </p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Phone
                </p>
                <p class="mt-2 text-sm text-slate-600">
                  {{ user.phone ?? "No phone" }}
                </p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Assigned Warehouses
                </p>
                <p class="mt-2 text-sm text-slate-600">
                  {{ assignedWarehouses.join(", ") || "Unassigned" }}
                </p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Updated
                </p>
                <p class="mt-2 text-sm text-slate-600">
                  {{ formatLongDate(user.updated_at) }}
                </p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Created
                </p>
                <p class="mt-2 text-sm text-slate-600">
                  {{ formatLongDate(user.created_at) }}
                </p>
              </div>
            </div>
          </UCard>
        </div>

        <UCard v-else>
          <p class="text-sm text-slate-600">
            User not found. Check the URL or return to the users list.
          </p>
        </UCard>
      </template>
    </div>
  </div>
</template>
