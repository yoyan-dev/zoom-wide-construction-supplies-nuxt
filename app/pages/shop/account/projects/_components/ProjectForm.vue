<script setup lang="ts">
import type {
  CreateProjectPayload,
  Project,
  ProjectStatus,
} from "~/types/project";
import { PROJECT_STATUS_OPTIONS } from "./project-options";

const props = defineProps<{
  project: Project | null;
  submitLabel: string;
  isSubmitting?: boolean;
}>();

const emit = defineEmits<{
  (e: "submit", value: CreateProjectPayload): void;
  (e: "cancel"): void;
}>();

const draft = reactive({
  name: "",
  location: "",
  description: "",
  start_date: "",
  end_date: "",
  status: "active" as ProjectStatus,
  progress: "0",
  budget: "",
});

const formError = ref<string | null>(null);

const normalizeText = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

const normalizeNumber = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed.length) {
    return null;
  }

  const numeric = Number(trimmed);
  return Number.isFinite(numeric) ? numeric : null;
};

watch(
  () => props.project,
  (value) => {
    draft.name = value?.name ?? "";
    draft.location = value?.location ?? "";
    draft.description = value?.description ?? "";
    draft.start_date = value?.start_date ?? "";
    draft.end_date = value?.end_date ?? "";
    draft.status = value?.status ?? "active";
    draft.progress = String(value?.progress ?? 0);
    draft.budget =
      value?.budget === undefined || value?.budget === null
        ? ""
        : String(value.budget);
    formError.value = null;
  },
  { immediate: true },
);

const canSubmit = computed(() => draft.name.trim().length > 0 && !props.isSubmitting);

const handleSubmit = () => {
  formError.value = null;

  if (!draft.name.trim()) {
    formError.value = "Project name is required.";
    return;
  }

  const progress = normalizeNumber(draft.progress);

  if (progress !== null && (progress < 0 || progress > 100)) {
    formError.value = "Progress must be between 0 and 100.";
    return;
  }

  emit("submit", {
    name: draft.name.trim(),
    location: normalizeText(draft.location),
    description: normalizeText(draft.description),
    start_date: normalizeText(draft.start_date),
    end_date: normalizeText(draft.end_date),
    status: draft.status,
    progress,
    budget: normalizeNumber(draft.budget),
  });
};
</script>

<template>
  <UForm class="space-y-5" @submit.prevent="handleSubmit">
    <UAlert
      v-if="formError"
      color="error"
      variant="soft"
      icon="i-lucide-circle-alert"
      :title="formError"
    />

    <div class="grid gap-5 md:grid-cols-2">
      <UFormField label="Project name" required>
        <UInput
          v-model="draft.name"
          class="w-full"
          placeholder="Residential tower fit-out"
        />
      </UFormField>

      <UFormField label="Status">
        <USelect
          v-model="draft.status"
          class="w-full"
          :items="PROJECT_STATUS_OPTIONS"
          placeholder="Select status"
        />
      </UFormField>
    </div>

    <div class="grid gap-5 md:grid-cols-2">
      <UFormField label="Location">
        <UInput
          v-model="draft.location"
          class="w-full"
          placeholder="Quezon City"
        />
      </UFormField>

      <UFormField label="Progress (%)">
        <UInput
          v-model="draft.progress"
          type="number"
          min="0"
          max="100"
          class="w-full"
          placeholder="0"
        />
      </UFormField>
    </div>

    <div class="grid gap-5 md:grid-cols-2">
      <UFormField label="Start date">
        <UInput v-model="draft.start_date" type="date" class="w-full" />
      </UFormField>

      <UFormField label="End date">
        <UInput v-model="draft.end_date" type="date" class="w-full" />
      </UFormField>
    </div>

    <UFormField label="Budget">
      <UInput
        v-model="draft.budget"
        type="number"
        min="0"
        step="0.01"
        class="w-full"
        placeholder="500000"
      />
    </UFormField>

    <UFormField label="Description">
      <UTextarea
        v-model="draft.description"
        class="w-full"
        :rows="4"
        placeholder="Scope, procurement notes, and key delivery details"
      />
    </UFormField>

    <div class="flex justify-end gap-2">
      <UButton color="neutral" variant="ghost" type="button" @click="emit('cancel')">
        Cancel
      </UButton>
      <UButton
        color="warning"
        type="submit"
        :disabled="!canSubmit"
        :loading="props.isSubmitting"
      >
        {{ props.submitLabel }}
      </UButton>
    </div>
  </UForm>
</template>
