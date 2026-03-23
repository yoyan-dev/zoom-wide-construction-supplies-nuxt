<script setup lang="ts">
definePageMeta({
  layout: "admin",
});

const notificationGroups = [
  {
    title: "Operations Alerts",
    items: ["Low stock warnings", "Delivery failures", "Pending order approvals"],
  },
  {
    title: "Finance Alerts",
    items: ["Payment review reminders", "Receipt verification", "Invoice follow-ups"],
  },
  {
    title: "User Updates",
    items: ["Role changes", "Activity summaries", "Security notices"],
  },
];
</script>

<template>
  <div class="min-h-screen space-y-6">
    <section class="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm md:p-8">
      <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
        Admin Settings
      </p>
      <h1 class="mt-2 text-2xl font-semibold md:text-3xl">Notification settings</h1>
      <p class="mt-2 max-w-3xl text-sm text-slate-600 md:text-base">
        Review the notification categories admins may manage for operational visibility.
      </p>
    </section>

    <div class="grid gap-4 lg:grid-cols-3">
      <UCard v-for="group in notificationGroups" :key="group.title">
        <p class="text-lg font-semibold text-slate-900">{{ group.title }}</p>
        <div class="mt-4 space-y-3">
          <div
            v-for="item in group.items"
            :key="item"
            class="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-700"
          >
            {{ item }}
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
