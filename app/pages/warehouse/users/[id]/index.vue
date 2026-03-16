<script setup lang="ts">
import type { User } from "~/types/user";
import { warehouseUserAssignments, warehouseUsers } from "~/seeds/warehouse-users";
import { defaultAssignedWarehouses } from "~/utils/warehouse";

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

const warehouses = computed(() => userWarehouses.value[userId.value] ?? []);

const hasAccess = computed(() =>
  warehouses.value.some((warehouse) =>
    assignedWarehouses.includes(warehouse),
  ),
);

const goBack = () => router.push("/warehouse/users");
const editUser = () => router.push(`/warehouse/users/edit/${userId.value}`);
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
            <h1 class="mt-2 text-2xl font-semibold">
              {{ user?.full_name ?? "Staff Member" }}
            </h1>
            <p class="mt-2 text-sm text-slate-600">
              View staff profile and warehouse assignments.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <UButton color="neutral" variant="outline" @click="goBack">
              Back to Users
            </UButton>
            <UButton color="primary" :disabled="!hasAccess" @click="editUser">
              Edit Account
            </UButton>
          </div>
        </div>
      </section>

      <UCard v-if="!hasAccess">
        <p class="text-sm text-slate-600">
          This staff account is not assigned to {{ assignedWarehouses.join(", ") }}.
        </p>
      </UCard>

      <div v-else-if="user">
        <UCard>
          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Email
              </p>
              <p class="mt-2 text-sm text-slate-600">{{ user.email }}</p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Phone
              </p>
              <p class="mt-2 text-sm text-slate-600">
                {{ user.phone ?? "N/A" }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Role
              </p>
              <p class="mt-2 text-sm text-slate-600">
                {{ user.role.replace("_", " ") }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Status
              </p>
              <p class="mt-2 text-sm text-slate-600">
                {{ user.is_active ? "Active" : "Inactive" }}
              </p>
            </div>
          </div>
        </UCard>

        <UCard>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Assigned Warehouses
          </p>
          <div class="mt-2 flex flex-wrap gap-2">
            <UBadge v-for="warehouse in warehouses" :key="warehouse" variant="subtle">
              {{ warehouse }}
            </UBadge>
          </div>
        </UCard>

        <UCard>
          <div class="grid gap-4 md:grid-cols-2 text-sm text-slate-600">
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Created
              </p>
              <p class="mt-2">{{ user.created_at }}</p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Updated
              </p>
              <p class="mt-2">{{ user.updated_at }}</p>
            </div>
          </div>
        </UCard>
      </div>

      <UCard v-else>
        <p class="text-sm text-slate-600">
          Staff account not found. Check the URL or return to the users list.
        </p>
      </UCard>
    </div>
  </div>
</template>
