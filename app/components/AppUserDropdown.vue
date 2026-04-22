<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    collapsed?: boolean;
    label?: string;
    variant?: "solid" | "outline" | "soft" | "subtle" | "ghost" | "link";
    color?: "primary" | "secondary" | "success" | "info" | "warning" | "error" | "neutral";
    buttonClass?: string;
    showChevron?: boolean;
    responsive?: boolean;
  }>(),
  {
    collapsed: false,
    label: "",
    variant: "ghost",
    color: "neutral",
    buttonClass: "",
    showChevron: true,
    responsive: true,
  },
);

const authStore = useAuthStore();
const router = useRouter();

const roleLabel = computed(() => authStore.role ?? "account");
const displayName = computed(() => authStore.displayName || "Account");
const displayEmail = computed(() => authStore.user?.email ?? "");
const avatarSrc = computed(() => authStore.user?.image_url || undefined);
const accountLabel = computed(() =>
  authStore.role === "customer" ? "My account" : "Dashboard",
);
const accountTarget = computed(() =>
  authStore.role === "customer" ? "/shop/account" : authStore.getRoleLandingPath(),
);
const settingsTarget = computed(() => {
  if (authStore.role === "customer") {
    return "/shop/account/settings";
  }

  if (authStore.role === "admin") {
    return "/admin/settings";
  }

  return null;
});
const securityTarget = computed(() => {
  if (authStore.role === "customer") {
    return "/shop/account/security";
  }

  if (authStore.role === "admin") {
    return "/admin/settings/security";
  }

  return null;
});

const items = computed(() => {
  const accountItems = [
    {
      label: accountLabel.value,
      icon: "i-lucide-layout-dashboard",
      to: accountTarget.value,
    },
    ...(authStore.role === "customer"
      ? [
          {
            label: "Projects",
            icon: "i-lucide-clipboard-list",
            to: "/shop/account/projects",
          },
        ]
      : []),
  ];

  const settingsItems = [
    settingsTarget.value
      ? {
          label: "Account settings",
          icon: "i-lucide-user-round-cog",
          to: settingsTarget.value,
        }
      : null,
    securityTarget.value
      ? {
          label: "Security",
          icon: "i-lucide-shield-check",
          to: securityTarget.value,
        }
      : null,
  ].filter(Boolean);

  return [
    accountItems,
    settingsItems,
    [
      {
        label: "Logout",
        icon: "i-lucide-log-out",
        color: "error",
        onSelect: async () => {
          await authStore.logout();
          await router.push("/auth/login");
        },
      },
    ],
  ].filter((group) => group.length);
});

const labelClass = computed(() => [
  "min-w-0 text-left",
  props.responsive ? "hidden sm:block" : "block",
]);

const chevronClass = computed(() => [
  "ml-auto size-4 shrink-0 opacity-60",
  props.responsive ? "hidden sm:block" : "block",
]);
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'end', sideOffset: 8 }"
    :ui="{ content: 'w-64' }"
  >
    <UButton
      :color="props.color"
      :variant="props.variant"
      :class="[
        'min-w-0 max-w-full justify-start gap-2',
        props.collapsed ? 'size-10 justify-center p-0' : '',
        props.buttonClass,
      ]"
      :aria-label="props.label || displayName"
    >
      <UAvatar
        :src="avatarSrc"
        :alt="displayName"
        size="sm"
        class="shrink-0"
      />

      <span v-if="!props.collapsed" :class="labelClass">
        <span class="block truncate text-sm font-semibold">
          {{ props.label || displayName }}
        </span>
        <span
          v-if="displayEmail || roleLabel"
          class="block truncate text-xs font-normal opacity-70"
        >
          {{ displayEmail || roleLabel }}
        </span>
      </span>

      <UIcon
        v-if="props.showChevron && !props.collapsed"
        name="i-lucide-chevron-down"
        :class="chevronClass"
      />
    </UButton>

    <template #content-top>
      <div class="flex items-center gap-3 px-2 py-2">
        <UAvatar :src="avatarSrc" :alt="displayName" size="md" />
        <div class="min-w-0">
          <p class="truncate text-sm font-semibold text-highlighted">
            {{ displayName }}
          </p>
          <p class="truncate text-xs text-muted">
            {{ displayEmail || roleLabel }}
          </p>
        </div>
      </div>
    </template>
  </UDropdownMenu>
</template>
