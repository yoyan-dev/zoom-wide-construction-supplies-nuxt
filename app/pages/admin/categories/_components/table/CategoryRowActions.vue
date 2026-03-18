<script setup lang="ts">
import type { Category } from "~/types/category";
import { useModal } from "~/composables/admin/useModal";
import ActionConfirmModal from "../../../_components/modals/ActionConfirmModal.vue";
import ActionFormModal from "../../../_components/modals/ActionFormModal.vue";
import CategoryViewModal from "../modals/CategoryViewModal.vue";
import CategoryDeleteModal from "../modals/CategoryDeleteModal.vue";
import CategoryStatsModal from "../modals/CategoryStatsModal.vue";

type ActionItem = {
  label: string;
  icon: string;
  color?: string;
  to?: string;
  onClick?: () => void | Promise<void>;
};

const props = defineProps<{
  category: Category;
}>();

const { openModal } = useModal();
const categoryStore = useCategoryStore();

const categoryId = computed(() => props.category.id);

const openConfirm = (payload: {
  title: string;
  description?: string;
  confirmLabel?: string;
  confirmColor?: string;
  onConfirm: () => Promise<void> | void;
}) => {
  openModal(ActionConfirmModal, payload);
};

const openForm = (payload: {
  title: string;
  description?: string;
  fields: Array<{
    key: string;
    label: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
    value?: string | number;
  }>;
  confirmLabel?: string;
  confirmColor?: string;
  onSubmit: (values: Record<string, string | number>) => Promise<void> | void;
}) => {
  openModal(ActionFormModal, payload);
};

const openChangeParent = () => {
  openForm({
    title: "Change Category Parent",
    confirmLabel: "Update",
    fields: [
      {
        key: "parent_id",
        label: "Parent category ID",
        placeholder: "cat-001",
      },
    ],
    onSubmit: async (values) => {
      categoryStore.changeCategoryParent(
        categoryId.value,
        String(values.parent_id ?? "").trim() || null,
      );
    },
  });
};

const openUpdateDescription = () => {
  openForm({
    title: "Update Description",
    confirmLabel: "Update",
    fields: [
      {
        key: "description",
        label: "Description",
        placeholder: "Category description",
        required: true,
        value: props.category.description ?? "",
      },
    ],
    onSubmit: async (values) => {
      await categoryStore.updateCategory(categoryId.value, {
        description: String(values.description ?? ""),
      });
    },
  });
};

const openUpdateImage = () => {
  openForm({
    title: "Update Category Image",
    confirmLabel: "Update",
    fields: [
      {
        key: "image_url",
        label: "Image URL",
        placeholder: "https://example.com/category.jpg",
        value: props.category.image_url ?? "",
      },
    ],
    onSubmit: async (values) => {
      await categoryStore.updateCategory(categoryId.value, {
        image_url: String(values.image_url ?? ""),
      });
    },
  });
};

const viewActions = computed<ActionItem[]>(() => [
  {
    label: "View Category",
    icon: "i-lucide-eye",
    to: `/admin/categories/${categoryId.value}`,
  },
  {
    label: "View Category Details",
    icon: "i-lucide-clipboard",
    onClick: () => openModal(CategoryViewModal, props.category),
  },
  {
    label: "View Category Sales / Product Count",
    icon: "i-lucide-bar-chart",
    onClick: () => openModal(CategoryStatsModal, props.category),
  },
]);

const editActions = computed<ActionItem[]>(() => [
  {
    label: "Edit Category",
    icon: "i-lucide-pencil",
    to: `/admin/categories/edit/${categoryId.value}`,
  },
  {
    label: "Change Category Parent",
    icon: "i-lucide-git-branch",
    onClick: openChangeParent,
  },
  {
    label: "Update Description",
    icon: "i-lucide-align-left",
    onClick: openUpdateDescription,
  },
  {
    label: "Update Category Image",
    icon: "i-lucide-image",
    onClick: openUpdateImage,
  },
]);

const statusActions = computed<ActionItem[]>(() => [
  {
    label: "Mark as Active",
    icon: "i-lucide-check-circle",
    onClick: () => categoryStore.setCategoryStatus(categoryId.value, "active"),
  },
  {
    label: "Mark as Inactive",
    icon: "i-lucide-x-circle",
    onClick: () => categoryStore.setCategoryStatus(categoryId.value, "inactive"),
  },
  {
    label: "Archive Category",
    icon: "i-lucide-archive",
    onClick: () =>
      openConfirm({
        title: "Archive category",
        description: `Archive ${props.category.name}?`,
        confirmLabel: "Archive",
        confirmColor: "warning",
        onConfirm: () =>
          categoryStore.setCategoryStatus(categoryId.value, "archived"),
      }),
  },
]);

const adminActions = computed<ActionItem[]>(() => [
  {
    label: "Delete Category",
    icon: "i-lucide-trash",
    color: "error",
    onClick: () => openModal(CategoryDeleteModal, props.category),
  },
  {
    label: "Duplicate Category",
    icon: "i-lucide-copy",
    onClick: () => categoryStore.duplicateCategory(categoryId.value),
  },
]);

const handleAction = async (action: ActionItem, close: () => void) => {
  if (action.onClick) {
    await action.onClick();
  }
  close();
};
</script>

<template>
  <UPopover :dismissible="false" :ui="{ content: 'p-4' }">
    <UButton
      icon="i-lucide-ellipsis-vertical"
      variant="ghost"
      color="neutral"
      size="sm"
    />

    <template #content="{ close }">
      <div class="flex items-center justify-between gap-4 mb-4 w-full">
        <h2 class="text-highlighted font-semibold">Actions</h2>

        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-x"
          @click="close"
        />
      </div>

      <div class="flex flex-col gap-3 min-w-64">
        <div class="flex flex-col gap-1">
          <p class="px-2 text-xs uppercase tracking-[0.18em] text-slate-500">
            View / Info
          </p>
          <UButton
            v-for="action in viewActions"
            :key="action.label"
            :icon="action.icon"
            :color="action.color ?? 'neutral'"
            variant="ghost"
            size="sm"
            class="w-full justify-start"
            :to="action.to"
            @click="handleAction(action, close)"
          >
            {{ action.label }}
          </UButton>
        </div>

        <UDivider />

        <div class="flex flex-col gap-1">
          <p class="px-2 text-xs uppercase tracking-[0.18em] text-slate-500">
            Edit / Update
          </p>
          <UButton
            v-for="action in editActions"
            :key="action.label"
            :icon="action.icon"
            :color="action.color ?? 'neutral'"
            variant="ghost"
            size="sm"
            class="w-full justify-start"
            :to="action.to"
            @click="handleAction(action, close)"
          >
            {{ action.label }}
          </UButton>
        </div>

        <UDivider />

        <div class="flex flex-col gap-1">
          <p class="px-2 text-xs uppercase tracking-[0.18em] text-slate-500">
            Status / Availability
          </p>
          <UButton
            v-for="action in statusActions"
            :key="action.label"
            :icon="action.icon"
            :color="action.color ?? 'neutral'"
            variant="ghost"
            size="sm"
            class="w-full justify-start"
            :to="action.to"
            @click="handleAction(action, close)"
          >
            {{ action.label }}
          </UButton>
        </div>

        <UDivider />

        <div class="flex flex-col gap-1">
          <p class="px-2 text-xs uppercase tracking-[0.18em] text-slate-500">
            Admin / Delete / Duplicate
          </p>
          <UButton
            v-for="action in adminActions"
            :key="action.label"
            :icon="action.icon"
            :color="action.color ?? 'neutral'"
            variant="ghost"
            size="sm"
            class="w-full justify-start"
            :to="action.to"
            @click="handleAction(action, close)"
          >
            {{ action.label }}
          </UButton>
        </div>
      </div>
    </template>
  </UPopover>
</template>
