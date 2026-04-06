<script setup lang="ts">
const props = defineProps<{
  initialImage?: string | null;
}>();

const emit = defineEmits<{
  (e: "change", file: File | null): void;
}>();

const previewImage = ref<string>("");
const objectPreviewUrl = ref<string>("");

const fileInput = ref<HTMLInputElement | null>(null);

const resetPreviewToInitialImage = () => {
  previewImage.value = props.initialImage ?? "";
};

const revokeObjectPreview = () => {
  if (objectPreviewUrl.value) {
    URL.revokeObjectURL(objectPreviewUrl.value);
    objectPreviewUrl.value = "";
  }
};

const triggerFile = () => {
  fileInput.value?.click();
};

const handleImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) {
    revokeObjectPreview();
    resetPreviewToInitialImage();
    emit("change", null);
    return;
  }

  if (!file.type.startsWith("image/")) {
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
    <div
      class="relative h-48 w-48 cursor-pointer overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition"
      @click="triggerFile"
    >
      <NuxtImg
        v-if="previewImage"
        :src="previewImage"
        class="h-full w-full object-cover"
        alt="Preview"
      />

      <div
        v-else
        class="flex h-full w-full flex-col items-center justify-center text-gray-400"
      >
        <Icon name="i-lucide-upload" class="h-8 w-8" />
        <span class="text-sm mt-2">Upload Image</span>
      </div>

      <!-- Hover Overlay -->
      <div
        v-if="previewImage"
        class="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-sm opacity-0 hover:opacity-100 transition"
      >
        Change Image
      </div>
    </div>

    <!-- Hidden Input -->
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
