<script setup lang="ts">
import { useAdminResponseToast } from "~/composables/admin/useAdminResponseToast";
import type { Category, CategorySpecHighlight } from "~/types/category";

const props = defineProps<{
  payload: Category | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();

const categoryStore = useCategoryStore();
const { notifyResponse } = useAdminResponseToast();

const categoryId = computed(() => props.payload?.id ?? "");
type CategoryPayload = Omit<Category, "id" | "created_at" | "updated_at">;
type CategoryDraft = {
  name: string;
  description: string;
  overview: string;
  typical_uses: string;
  buying_considerations: string;
  featured_specs: string;
};

const draft = reactive<CategoryDraft>({
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
  () => props.payload,
  (value) => {
    draft.name = value?.name ?? "";
    draft.description = value?.description ?? "";
    draft.overview = value?.overview ?? "";
    draft.typical_uses = toLineBlock(value?.typical_uses);
    draft.buying_considerations = toLineBlock(value?.buying_considerations);
    draft.featured_specs = toSpecBlock(value?.featured_specs);
  },
  { immediate: true },
);

const handleSave = async () => {
  if (!categoryId.value) return;
  const payload = {
    name: draft.name.trim(),
    description: draft.description.trim(),
    overview: draft.overview.trim() || undefined,
    typical_uses: parseLines(draft.typical_uses),
    buying_considerations: parseLines(draft.buying_considerations),
    featured_specs: parseSpecs(draft.featured_specs),
  };

  const response = await categoryStore.updateCategory(
    categoryId.value,
    payload,
  );

  if (
    !notifyResponse(response, {
      successTitle: "Category updated",
      successDescription: `Saved changes to ${payload.name}.`,
      errorTitle: "Category not updated",
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
          Edit Category
        </p>
        <h3 class="mt-2 text-lg font-semibold">Edit category details</h3>
      </div>
    </template>
    <template #body>
      <div class="space-y-6">
        <UFormField class="w-full" label="Category name">
          <UInput
            v-model="draft.name"
            class="w-full"
            placeholder="Concrete & Cement"
          />
        </UFormField>

        <UFormField class="w-full" label="Short description">
          <UTextarea
            v-model="draft.description"
            class="w-full"
            placeholder="A concise label for cards, lists, and quick references."
          />
        </UFormField>

        <UFormField class="w-full" label="Overview">
          <UTextarea
            v-model="draft.overview"
            class="w-full"
            placeholder="Explain what this category covers and how the team should think about it."
          />
        </UFormField>

        <div class="rounded-2xl border border-slate-200/70 p-5">
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
                  v-model="draft.typical_uses"
                  class="w-full"
                  placeholder="Structural slabs and footings&#10;Masonry and block work&#10;Repair and patching"
                />
              </UFormField>
              <UFormField
                class="w-full"
                label="Buying considerations"
                description="One note per line"
              >
                <UTextarea
                  v-model="draft.buying_considerations"
                  class="w-full"
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
                v-model="draft.featured_specs"
                class="w-full"
                placeholder="Strength Focus: 20-30 MPa mixes&#10;Packaging: Ready-mix and 50kg bags&#10;Storage: Keep dry and covered"
              />
            </UFormField>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex items-center justify-end gap-2 w-full">
        <UButton color="neutral" variant="ghost" @click="emit('close', false)">
          Cancel
        </UButton>
        <UButton
          color="primary"
          :disabled="!draft.name.trim()"
          @click="handleSave"
        >
          Save Changes
        </UButton>
      </div>
    </template>
  </UModal>
</template>
