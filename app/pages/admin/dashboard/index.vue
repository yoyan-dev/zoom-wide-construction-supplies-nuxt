<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { DashboardResponse } from "~/types/dashboard";
import DashboardDeliveryOverview from "./_components/DashboardDeliveryOverview.vue";
import DashboardHero from "./_components/DashboardHero.vue";
import DashboardKpiGrid from "./_components/DashboardKpiGrid.vue";
import DashboardLowStock from "./_components/DashboardLowStock.vue";
import DashboardOrdersTable from "./_components/DashboardOrdersTable.vue";
import DashboardRevenueChart from "./_components/DashboardRevenueChart.vue";
import DashboardTopProducts from "./_components/DashboardTopProducts.vue";

definePageMeta({
  layout: "admin",
});

const driverStore = useDriverStore();
const { data } = await useFetch<DashboardResponse>("/api/admin/dashboard");
await driverStore.fetchDrivers();

const { drivers } = storeToRefs(driverStore);

const empty: DashboardResponse = {
  range_label: "",
  kpis: [],
  revenue_series: [],
  recent_orders: [],
  top_products: [],
  low_stock_items: [],
  delivery_statuses: [],
  deliveries: [],
  generated_at: new Date().toISOString(),
};

const dashboard = computed(() => data.value ?? empty);
</script>

<template>
  <div class="min-h-screen">
    <div class="space-y-6">
      <DashboardHero
        :range-label="dashboard.range_label"
        :generated-at="dashboard.generated_at"
      />

      <DashboardKpiGrid :kpis="dashboard.kpis" />

      <div class="grid gap-6 xl:grid-cols-3">
        <div class="space-y-6 xl:col-span-2">
          <DashboardRevenueChart :series="dashboard.revenue_series" />
          <DashboardOrdersTable :rows="dashboard.recent_orders" />
          <DashboardTopProducts :rows="dashboard.top_products" />
        </div>

        <div class="space-y-6">
          <DashboardDeliveryOverview
            :statuses="dashboard.delivery_statuses"
            :deliveries="dashboard.deliveries"
            :drivers="drivers"
          />
          <DashboardLowStock :rows="dashboard.low_stock_items" />
        </div>
      </div>
    </div>
  </div>
</template>
