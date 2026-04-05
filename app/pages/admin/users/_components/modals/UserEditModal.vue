<script setup lang="ts">
import type { User } from "~/types/user";
import UserForm, { type UserSubmitValue } from "../UserForm.vue";
import { useAdminResponseToast } from "~/composables/admin/useAdminResponseToast";

const props = defineProps<{
  payload: User | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();

const userStore = useUserStore();
const { notifyResponse } = useAdminResponseToast();
const isSaving = ref(false);

const userId = computed(() => props.payload?.id ?? "");

const handleSave = async (payload: UserSubmitValue) => {
  if (!userId.value) {
    return;
  }

  isSaving.value = true;
  const response = await userStore.updateUser(userId.value, {
    email: payload.email,
    password: payload.password ?? null,
    full_name: payload.full_name,
    phone: payload.phone ?? null,
    role: payload.role,
    is_active: payload.is_active,
  });
  isSaving.value = false;

  if (
    !notifyResponse(response, {
      successTitle: "User updated",
      successDescription: `Saved changes to ${payload.full_name}.`,
      errorTitle: "User not updated",
    })
  ) {
    return;
  }

  emit("close", false);
};
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }">
    <template #header>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Edit Internal User
        </p>
        <h3 class="mt-2 text-lg font-semibold">Update user details</h3>
      </div>
    </template>
    <template #body>
      <UserForm
        :user="props.payload"
        submit-label="Save Changes"
        :show-status-field="true"
        :is-submitting="isSaving"
        @submit="handleSave"
        @cancel="emit('close', false)"
      />
    </template>
  </UModal>
</template>
