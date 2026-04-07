<script setup lang="ts">
import type { Category, CategorySpecHighlight } from "~/types/category";

type CategorySubmitValue = Omit<Category, "id" | "created_at" | "updated_at">;

type CategoryDraft = {
  name: string;
  description: string;
  overview: string;
  typical_uses: string;
  buying_considerations: string;
  featured_specs: string;
};

const props = defineProps<{
  category: Category | null;
  submitLabel: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
}>();

const emit = defineEmits<{
  (e: "submit", value: CategorySubmitValue): void;
  (e: "cancel"): void;
}>();

const draft = ref<CategoryDraft>({
  name: "",
  description: "",
  overview: "",
  typical_uses: "",
  buying_considerations: "",
  featured_specs: "",
});

const toLineBlock = (items?: string[]) => (items ?? []).join("\n");

const toSpecBlock = (items?: CategorySpecHighlight[]) =>
  (items ?? []).map((item) => `${item.label}: ${item.value}`).join("\n");

const parseLines = (value: string) =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

const parseSpecs = (value: string): CategorySpecHighlight[] =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const separatorIndex = item.indexOf(":");
      if (separatorIndex === -1) {
        return { label: item, value: "" };
      }

      return {
        label: item.slice(0, separatorIndex).trim(),
        value: item.slice(separatorIndex + 1).trim(),
      };
    })
    .filter((item) => item.label);

watch(
  () => props.category,
  (value) => {
    draft.value = {
      name: value?.name ?? "",
      description: value?.description ?? "",
      overview: value?.overview ?? "",
      typical_uses: toLineBlock(value?.typical_uses),
      buying_considerations: toLineBlock(value?.buying_considerations),
      featured_specs: toSpecBlock(value?.featured_specs),
    };
  },
  { immediate: true },
);

const handleSubmit = () => {
  if (!draft.value.name.trim()) return;

  emit("submit", {
    name: draft.value.name.trim(),
    description: draft.value.description.trim(),
    image_url: props.category?.image_url ?? "",
    overview: draft.value.overview.trim() || undefined,
    typical_uses: parseLines(draft.value.typical_uses),
    buying_considerations: parseLines(draft.value.buying_considerations),
    featured_specs: parseSpecs(draft.value.featured_specs),
  });
};
</script>

<template>
  <UForm @submit.prevent="handleSubmit">
    <div class="space-y-6">
      <UFormField class="w-full" label="Category name">
        <UInput
          class="w-full"
          v-model="draft.name"
          placeholder="Concrete & Cement"
        />
      </UFormField>

      <UFormField class="w-full" label="Short description">
        <UTextarea
          class="w-full"
          v-model="draft.description"
          placeholder="A concise label for cards, lists, and quick references."
        />
      </UFormField>

      <UFormField class="w-full" label="Overview">
        <UTextarea
          class="w-full"
          v-model="draft.overview"
          placeholder="Explain what this category covers and how the team should think about it."
        />
      </UFormField>

      <div class="rounded-lg border border-slate-200/70 p-5">
        <div class="mb-4">
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Handbook Content
          </p>
          <h3 class="mt-2 text-lg font-semibold text-slate-900">
            Buying and Usage Guidance
          </h3>
          <p class="mt-1 text-sm text-slate-600">
            Capture the notes that should guide product setup and category
            review.
          </p>
        </div>

        <div class="grid gap-6">
          <div class="grid gap-6 lg:grid-cols-2">
            <UFormField
              class="w-full"
              label="Typical uses"
              description="One use case per line"
            >
              <UTextarea
                class="w-full"
                v-model="draft.typical_uses"
                placeholder="Structural slabs and footings&#10;Masonry and block work&#10;Repair and patching"
              />
            </UFormField>
            <UFormField
              class="w-full"
              label="Buying considerations"
              description="One note per line"
            >
              <UTextarea
                class="w-full"
                v-model="draft.buying_considerations"
                placeholder="Match compressive strength to structural need&#10;Confirm delivery window&#10;Check storage conditions"
              />
            </UFormField>
          </div>

          <UFormField
            class="w-full"
            label="Featured specifications"
            description="Use the format Label: Value, one per line"
          >
            <UTextarea
              class="w-full"
              v-model="draft.featured_specs"
              placeholder="Strength Focus: 20-30 MPa mixes&#10;Packaging: Ready-mix and 50kg bags&#10;Storage: Keep dry and covered"
            />
          </UFormField>
        </div>
      </div>
    </div>

    <div class="mt-6 flex items-center justify-end gap-2">
      <UButton
        color="neutral"
        variant="ghost"
        type="button"
        @click="emit('cancel')"
      >
        {{ cancelLabel ?? "Cancel" }}
      </UButton>
      <UButton
        color="primary"
        type="submit"
        :disabled="!draft.name.trim()"
        :loading="props.isSubmitting"
      >
        {{ submitLabel }}
      </UButton>
    </div>
  </UForm>
</template>
