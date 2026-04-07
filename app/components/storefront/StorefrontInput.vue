<script setup lang="ts">
const model = defineModel<string | number | null>();

const props = withDefaults(
  defineProps<{
    type?: string;
    placeholder?: string;
    icon?: string;
    size?: "sm" | "md" | "lg" | "xl";
  }>(),
  {
    type: "text",
    placeholder: "",
    icon: "",
    size: "lg",
  },
);

const inputUi = {
  base: "rounded-lg border border-slate-200/80 bg-white px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:ring-0",
  leadingIcon: "text-slate-400",
  trailingIcon: "text-slate-400",
};
</script>

<template>
  <UInput
    v-model="model"
    v-bind="$attrs"
    :type="props.type"
    :placeholder="props.placeholder"
    :icon="props.icon || undefined"
    :size="props.size"
    :ui="inputUi"
    class="w-full"
  />
</template>
