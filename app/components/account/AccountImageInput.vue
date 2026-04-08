<script setup lang="ts">
const props = defineProps<{
  initialImage?: string | null;
  alt?: string;
}>();

const emit = defineEmits<{
  (e: "change", file: File | null): void;
}>();

const previewImage = ref("");
const objectPreviewUrl = ref("");
const fileInput = ref<HTMLInputElement | null>(null);

const resetPreviewToInitialImage = () => {
  previewImage.value = props.initialImage ?? "";
};

const revokeObjectPreview = () => {
  if (!objectPreviewUrl.value) {
    return;
  }

  URL.revokeObjectURL(objectPreviewUrl.value);
  objectPreviewUrl.value = "";
};

const triggerFile = () => {
  fileInput.value?.click();
};

const handleImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0] ?? null;

  if (!file || !file.type.startsWith("image/")) {
    revokeObjectPreview();
    resetPreviewToInitialImage();
    emit("change", null);
    return;
  }

  revokeObjectPreview();
  objectPreviewUrl.value = URL.createObjectURL(file);
  previewImage.value = objectPreviewUrl.value;
  emit("change", file);
};

watch(
  () => props.initialImage,
  () => {
    if (!objectPreviewUrl.value) {
      resetPreviewToInitialImage();
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  revokeObjectPreview();
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <button
      type="button"
      class="group relative h-48 w-48 overflow-hidden rounded-lg border border-dashed border-slate-300 bg-white text-left transition hover:border-amber-300 hover:bg-amber-50/40 dark:bg-gray-900"
      @click="triggerFile"
    >
      <NuxtImg
        v-if="previewImage"
        :src="previewImage"
        :alt="props.alt || 'Account image preview'"
        class="h-full w-full object-cover"
      />

      <div
        v-else
        class="flex h-full w-full flex-col items-center justify-center text-slate-400"
      >
        <UIcon name="i-lucide-upload" class="h-8 w-8" />
        <span class="mt-2 text-sm font-medium">Upload image</span>
      </div>

      <div
        class="absolute inset-0 flex items-center justify-center bg-slate-950/55 text-sm font-semibold text-white opacity-0 transition group-hover:opacity-100"
      >
        {{ previewImage ? "Change image" : "Choose image" }}
      </div>
    </button>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      name="imageFile"
      class="hidden"
      @change="handleImageUpload"
    />
  </div>
</template>
