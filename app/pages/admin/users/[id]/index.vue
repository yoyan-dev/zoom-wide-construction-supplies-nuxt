<script setup lang="ts">
import UserDetailView from "../_components/detail/UserDetailView.vue";

definePageMeta({
  layout: "admin",
});

const authStore = useAuthStore();

if (!authStore.hasAnyRole(["admin"])) {
  await navigateTo(authStore.getRoleLandingPath());
}

const route = useRoute();
const userId = computed(() => String(route.params.id));
</script>

<template>
  <UserDetailView :user-id="userId" />
</template>
