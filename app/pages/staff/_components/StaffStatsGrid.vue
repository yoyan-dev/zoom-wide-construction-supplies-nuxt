<script setup lang="ts">
import type { StaffStat } from "./staff-dashboard.types";
import StaffStatCard from "./StaffStatCard.vue";

defineProps<{
  stats: StaffStat[];
}>();
</script>

<template>
  <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
    <StaffStatCard v-for="stat in stats" :key="stat.id" :stat="stat" />
  </section>
</template>
