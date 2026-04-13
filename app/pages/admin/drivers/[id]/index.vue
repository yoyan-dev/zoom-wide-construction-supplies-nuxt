<script setup lang="ts">
import DriverDetailView from "../_components/detail/DriverDetailView.vue";

definePageMeta({
  layout: "admin",
});

const authStore = useAuthStore();
const { canManageUsers } = useAdminPermissions();

if (!canManageUsers.value) {
  await navigateTo(authStore.getRoleLandingPath());
}

const route = useRoute();
const driverId = computed(() => String(route.params.id));
</script>

<template>
  <DriverDetailView :driver-id="driverId" />
</template>
