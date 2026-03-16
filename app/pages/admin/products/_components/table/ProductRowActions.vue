<script setup lang="ts">
import type { Product } from "~/types/product";
import { useModal } from "~/composables/admin/useModal";
import ActionConfirmModal from "../../../_components/modals/ActionConfirmModal.vue";
import ActionFormModal from "../../../_components/modals/ActionFormModal.vue";
import ProductDeleteModal from "../modals/ProductDeleteModal.vue";
import ProductDetailsModal from "../modals/ProductDetailsModal.vue";
import ProductSalesModal from "../modals/ProductSalesModal.vue";
import ProductStockModal from "../modals/ProductStockModal.vue";

type ActionItem = {
  label: string;
  icon: string;
  color?: string;
  to?: string;
  onClick?: () => void | Promise<void>;
};

const props = defineProps<{
  product: Product;
}>();

const { openModal } = useModal();
const productStore = useProductStore();
const inventoryStore = useInventoryStore();

const productId = computed(() => props.product.id ?? "");

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

const openUpdatePrice = () => {
  openForm({
    title: "Update Price",
    confirmLabel: "Update",
    fields: [
      {
        key: "price",
        label: "New price",
        type: "number",
        placeholder: "0",
        required: true,
        value: props.product.price ?? 0,
      },
    ],
    onSubmit: async (values) => {
      if (!productId.value) return;
      await productStore.updateProduct(productId.value, {
        price: Number(values.price ?? 0),
      });
    },
  });
};

const openUpdateStock = (title: string) => {
  openForm({
    title,
    confirmLabel: "Update",
    fields: [
      {
        key: "stock",
        label: "Stock quantity",
        type: "number",
        placeholder: "0",
        required: true,
        value: props.product.stock_quantity ?? 0,
      },
    ],
    onSubmit: async (values) => {
      if (!productId.value) return;
      await productStore.updateProduct(productId.value, {
        stock_quantity: Number(values.stock ?? 0),
      });
    },
  });
};

const openUpdateSku = () => {
  openForm({
    title: "Update SKU / Code",
    confirmLabel: "Update",
    fields: [
      {
        key: "sku",
        label: "SKU / Code",
        placeholder: "SKU-1001",
        required: true,
        value: props.product.sku ?? "",
      },
    ],
    onSubmit: async (values) => {
      if (!productId.value) return;
      await productStore.updateProduct(productId.value, {
        sku: String(values.sku ?? "").trim(),
      });
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
        placeholder: "Product description",
        required: true,
        value: props.product.description ?? "",
      },
    ],
    onSubmit: async (values) => {
      if (!productId.value) return;
      await productStore.updateProduct(productId.value, {
        description: String(values.description ?? ""),
      });
    },
  });
};

const openUpdateImages = () => {
  openForm({
    title: "Update Images",
    confirmLabel: "Update",
    fields: [
      {
        key: "image_url",
        label: "Image URL",
        placeholder: "https://example.com/product.jpg",
        value: props.product.image_url ?? "",
      },
    ],
    onSubmit: async (values) => {
      if (!productId.value) return;
      await productStore.updateProduct(productId.value, {
        image_url: String(values.image_url ?? ""),
      });
    },
  });
};

const openAddStock = (title: string, movementType: "in" | "out") => {
  openForm({
    title,
    confirmLabel: "Save",
    fields: [
      {
        key: "quantity",
        label: "Quantity",
        type: "number",
        placeholder: "0",
        required: true,
      },
      {
        key: "note",
        label: "Note",
        placeholder: "Reason for adjustment",
      },
    ],
    onSubmit: async (values) => {
      if (!productId.value) return;
      const quantity = Number(values.quantity ?? 0);
      if (!Number.isFinite(quantity) || quantity === 0) return;
      await inventoryStore.createInventoryLog({
        product_id: productId.value,
        movement_type: movementType,
        quantity_change: quantity,
        reference_type: "manual",
        reference_id: `prod-${productId.value}`,
        note: String(values.note ?? "") || null,
        created_by: "admin",
      });
      await productStore.adjustProductStock(
        productId.value,
        movementType === "in" ? quantity : -quantity,
      );
    },
  });
};

const openMinimumStock = () => {
  openForm({
    title: "Set Minimum Stock Warning",
    confirmLabel: "Save",
    fields: [
      {
        key: "minimum_stock_quantity",
        label: "Minimum stock",
        type: "number",
        placeholder: "0",
        required: true,
        value: props.product.minimum_stock_quantity ?? 0,
      },
    ],
    onSubmit: async (values) => {
      if (!productId.value) return;
      await productStore.updateProduct(productId.value, {
        minimum_stock_quantity: Number(values.minimum_stock_quantity ?? 0),
      });
    },
  });
};

const viewActions = computed<ActionItem[]>(() => [
  {
    label: "View Product",
    icon: "i-lucide-eye",
    to: `/admin/products/${productId.value}`,
  },
  {
    label: "View Product Details",
    icon: "i-lucide-clipboard",
    onClick: () => openModal(ProductDetailsModal, props.product),
  },
  {
    label: "View Sales History",
    icon: "i-lucide-line-chart",
    onClick: () => openModal(ProductSalesModal, props.product),
  },
  {
    label: "View Stock Levels",
    icon: "i-lucide-warehouse",
    onClick: () => openModal(ProductStockModal, props.product),
  },
]);

const editActions = computed<ActionItem[]>(() => [
  {
    label: "Edit Product",
    icon: "i-lucide-pencil",
    to: `/admin/products/edit/${productId.value}`,
  },
  {
    label: "Update Price",
    icon: "i-lucide-dollar-sign",
    onClick: openUpdatePrice,
  },
  {
    label: "Update Quantity / Stock",
    icon: "i-lucide-box",
    onClick: () => openUpdateStock("Update Quantity / Stock"),
  },
  {
    label: "Update SKU / Code",
    icon: "i-lucide-hash",
    onClick: openUpdateSku,
  },
  {
    label: "Update Description",
    icon: "i-lucide-align-left",
    onClick: openUpdateDescription,
  },
  {
    label: "Update Images",
    icon: "i-lucide-image",
    onClick: openUpdateImages,
  },
]);

const stockActions = computed<ActionItem[]>(() => [
  {
    label: "Add Stock",
    icon: "i-lucide-plus-circle",
    onClick: () => openAddStock("Add Stock", "in"),
  },
  {
    label: "Reduce Stock",
    icon: "i-lucide-minus-circle",
    onClick: () => openAddStock("Reduce Stock", "out"),
  },
  {
    label: "Set Minimum Stock Warning",
    icon: "i-lucide-bell",
    onClick: openMinimumStock,
  },
]);

const statusActions = computed<ActionItem[]>(() => [
  {
    label: "Mark as Active / Published",
    icon: "i-lucide-check-circle",
    onClick: () =>
      productStore.updateProduct(productId.value, { is_active: true }),
  },
  {
    label: "Mark as Inactive / Unpublished",
    icon: "i-lucide-x-circle",
    onClick: () =>
      productStore.updateProduct(productId.value, { is_active: false }),
  },
  {
    label: "Archive Product",
    icon: "i-lucide-archive",
    onClick: () =>
      openConfirm({
        title: "Archive product",
        description: `Archive ${props.product.name ?? "product"}?`,
        confirmLabel: "Archive",
        confirmColor: "warning",
        onConfirm: () => {
          if (!productId.value) return;
          productStore.setProductArchived(productId.value, true);
          return productStore.updateProduct(productId.value, { is_active: false });
        },
      }),
  },
]);

const documentActions = computed<ActionItem[]>(() => [
  {
    label: "Print Product Sheet",
    icon: "i-lucide-printer",
    onClick: () => productStore.printProductSheet(productId.value),
  },
  {
    label: "Download Product PDF",
    icon: "i-lucide-download",
    onClick: () => productStore.downloadProductSheet(productId.value),
  },
  {
    label: "Export Product Data",
    icon: "i-lucide-file-export",
    onClick: () => productStore.exportProduct(productId.value),
  },
]);

const adminActions = computed<ActionItem[]>(() => [
  {
    label: "Delete Product",
    icon: "i-lucide-trash",
    color: "error",
    onClick: () => openModal(ProductDeleteModal, props.product),
  },
  {
    label: "Duplicate Product",
    icon: "i-lucide-copy",
    onClick: () => productStore.duplicateProduct(productId.value),
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
            Inventory / Stock
          </p>
          <UButton
            v-for="action in stockActions"
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
            Documents / Export
          </p>
          <UButton
            v-for="action in documentActions"
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
