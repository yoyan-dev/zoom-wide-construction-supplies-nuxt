<script setup lang="ts">
type ActionFormField = {
  key: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  value?: string | number;
};

type ActionFormPayload = {
  title: string;
  description?: string;
  fields: ActionFormField[];
  confirmLabel?: string;
  confirmColor?: string;
  onSubmit?: (
    values: Record<string, string | number>,
  ) => Promise<boolean | void> | boolean | void;
};

const props = defineProps<{
  payload: ActionFormPayload | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();
const isWorking = ref(false);
const form = reactive<Record<string, string>>({});

const initForm = () => {
  if (!props.payload) return;
  for (const field of props.payload.fields) {
    form[field.key] = field.value !== undefined ? String(field.value) : "";
  }
};

watch(
  () => props.payload,
  () => initForm(),
  { immediate: true },
);

const isDisabled = computed(() => {
  if (!props.payload) return true;
  return props.payload.fields.some(
    (field) => field.required && !form[field.key]?.trim(),
  );
});

const handleSubmit = async () => {
  if (!props.payload?.onSubmit) {
    emit("close", false);
    return;
  }

  const values: Record<string, string | number> = {};
  for (const field of props.payload.fields) {
    const raw = form[field.key] ?? "";
    if (field.type === "number") {
      const parsed = Number(raw);
      values[field.key] = Number.isNaN(parsed) ? 0 : parsed;
    } else {
      values[field.key] = raw;
    }
  }

  isWorking.value = true;
  const shouldClose = (await props.payload.onSubmit(values)) !== false;
  isWorking.value = false;

  if (shouldClose) {
    emit("close", false);
  }
};
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }">
    <template #header>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Action Form
        </p>
        <h3 class="mt-2 text-lg font-semibold">
          {{ props.payload?.title ?? "Update" }}
        </h3>
      </div>
    </template>
    <template #body>
      <div class="space-y-4">
        <p v-if="props.payload?.description" class="text-sm text-slate-600">
          {{ props.payload.description }}
        </p>
        <UFormField
          v-for="field in props.payload?.fields ?? []"
          :key="field.key"
          :label="field.label"
        >
          <UInput
            class="w-full"
            v-model="form[field.key]"
            :type="field.type ?? 'text'"
            :placeholder="field.placeholder"
          />
        </UFormField>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton color="neutral" variant="ghost" @click="emit('close', false)">
          Cancel
        </UButton>
        <UButton
          :color="props.payload?.confirmColor ?? 'primary'"
          :disabled="isDisabled"
          :loading="isWorking"
          @click="handleSubmit"
        >
          {{ props.payload?.confirmLabel ?? "Save" }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
