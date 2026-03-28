<script setup lang="ts">
import UserForm, { type UserSubmitValue } from "../UserForm.vue";
import { useAdminResponseToast } from "~/composables/admin/useAdminResponseToast";

const emit = defineEmits<{ close: [boolean] }>();

const userStore = useUserStore();
const { notifyResponse } = useAdminResponseToast();
const isSaving = ref(false);

const handleSave = async (payload: UserSubmitValue) => {
  isSaving.value = true;
  const response = await userStore.addUser({
    email: payload.email,
    password: payload.password ?? "",
    full_name: payload.full_name,
    phone: payload.phone ?? null,
    role: payload.role,
  });
  isSaving.value = false;

  if (
    !notifyResponse(response, {
      successTitle: "User created",
      successDescription: `Added ${payload.full_name}.`,
      errorTitle: "User not created",
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
          New Internal User
        </p>
        <h3 class="mt-2 text-lg font-semibold">Create internal account</h3>
      </div>
    </template>
    <template #body>
      <UserForm
        :user="null"
        submit-label="Create User"
        :require-password="true"
        :is-submitting="isSaving"
        @submit="handleSave"
        @cancel="emit('close', false)"
      />
    </template>
  </UModal>
</template>
