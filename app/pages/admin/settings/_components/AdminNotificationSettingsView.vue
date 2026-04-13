<script setup lang="ts">
import AdminPageHeader from "../../_components/AdminPageHeader.vue";

const notificationGroups = [
  {
    title: "Operations Alerts",
    description: "Stock, order, and delivery signals used by the admin team.",
    items: ["Low stock warnings", "Delivery failures", "Pending order approvals"],
  },
  {
    title: "Finance Alerts",
    description: "Payment and receipt reminders for finance-facing work.",
    items: ["Payment review reminders", "Receipt verification", "Invoice follow-ups"],
  },
  {
    title: "User Updates",
    description: "Account and access events for operational awareness.",
    items: ["Role changes", "Activity summaries", "Security notices"],
  },
];
</script>

<template>
  <div class="min-h-screen space-y-6">
    <AdminPageHeader
      eyebrow="Admin Settings"
      title="Notification settings"
      description="Review notification categories currently planned for operational visibility."
      :total="notificationGroups.length"
      total-label="groups"
    />

    <UAlert
      color="info"
      variant="soft"
      icon="i-lucide-info"
      title="Display-only settings"
      description="Notification preferences are not connected to a backend preference endpoint yet, so these categories are documented here without save controls."
    />

    <div class="grid gap-4 lg:grid-cols-3">
      <UCard v-for="group in notificationGroups" :key="group.title">
        <div class="space-y-4">
          <div>
            <p class="text-lg font-semibold text-slate-900">
              {{ group.title }}
            </p>
            <p class="mt-1 text-sm text-slate-600">
              {{ group.description }}
            </p>
          </div>

          <div class="space-y-3">
            <div
              v-for="item in group.items"
              :key="item"
              class="flex items-center justify-between gap-4 rounded-sm border border-slate-200/70 bg-white px-4 py-3 text-sm text-slate-700 dark:bg-gray-900"
            >
              <span>{{ item }}</span>
              <UBadge color="neutral" variant="subtle">
                Planned
              </UBadge>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
