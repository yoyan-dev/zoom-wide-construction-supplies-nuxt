<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { Product } from "~/types/product";
import ProductForm from "../../_components/ProductForm.vue";
import { useModal } from "~/composables/admin/useModal";
import ProductDeleteModal from "../../_components/modals/ProductDeleteModal.vue";
import { getInventoryBalance } from "~/utils/inventory-balance";

definePageMeta({
  layout: "admin",
});

const route = useRoute();
const productId = computed(() => String(route.params.id));
const router = useRouter();
const { openModal } = useModal();

const productStore = useProductStore();
const categoryStore = useCategoryStore();
const supplierStore = useSupplierStore();
const warehouseStore = useWarehouseStore();
const inventoryStore = useInventoryStore();
const { isSuccessResponse, showError, showSuccess } =
  useAdminResponseToast();

await Promise.all([
  productStore.fetchProductById(productId.value),
  categoryStore.fetchCategories(),
  supplierStore.fetchSuppliers(),
  warehouseStore.fetchWarehouses(),
  inventoryStore.fetchInventoryLogs(),
]);

const { product } = storeToRefs(productStore);
const { categories } = storeToRefs(categoryStore);
const { suppliers } = storeToRefs(supplierStore);
const { warehouses } = storeToRefs(warehouseStore);
const { logs } = storeToRefs(inventoryStore);

type ProductDraft = Omit<Product, "id" | "created_at" | "updated_at">;

const handleSubmit = async (payload: ProductDraft) => {
  if (!product.value?.id) return;
  const currentStock = getInventoryBalance(
    logs.value,
    product.value.id,
    product.value.stock_quantity ?? 0,
  );
  const nextStock = payload.stock_quantity ?? 0;
  const stockDelta = nextStock - currentStock;
  const response = await productStore.updateProduct(product.value.id, payload);

  if (!isSuccessResponse(response)) {
    showError("Product not updated", response.message ?? "Please try again.");
    return;
  }

  if (stockDelta !== 0) {
    const inventoryResponse = await inventoryStore.createInventoryLog({
      product_id: product.value.id,
      movement_type: "adjustment",
      quantity_change: stockDelta,
      reference_type: "manual",
      reference_id: product.value.id,
      note: `Stock updated from ${currentStock} to ${nextStock} in product edit.`,
      created_by: "admin",
    });

    if (!isSuccessResponse(inventoryResponse)) {
      showError(
        "Product updated, but stock log failed",
        "The catalog changes were saved, but the stock adjustment log could not be recorded.",
      );
      return;
    }
  }

  showSuccess("Product updated", `Saved changes to ${payload.name ?? "the product"}.`);
  router.push("/admin/products");
};
</script>

<template>
  <div class="min-h-screen">
    <div class="space-y-6">
      <section class="bg-white dark:bg-gray-800 p-2">
        <div
          class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Catalog Management
            </p>
            <h1 class="mt-2 text-2xl font-semibold">Edit Product</h1>
            <p class="mt-2 text-sm text-slate-600">
              Update pricing, stock, and catalog visibility for this SKU.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <UButton color="neutral" variant="outline" to="/admin/products">
              Back to Products
            </UButton>
            <UButton
              color="error"
              variant="outline"
              label="Delete Product"
              @click="openModal(ProductDeleteModal, product)"
            />
          </div>
        </div>
      </section>

      <div v-if="product">
        <ProductForm
          :product="product"
          :categories="categories"
          :suppliers="suppliers"
          :warehouses="warehouses"
          submit-label="Save Changes"
          cancel-to="/admin/products"
          @submit="handleSubmit"
        />
      </div>
      <UCard v-else>
        <p class="text-sm text-slate-600">
          Product not found. Check the URL or return to the products list.
        </p>
      </UCard>
    </div>
  </div>
</template>
