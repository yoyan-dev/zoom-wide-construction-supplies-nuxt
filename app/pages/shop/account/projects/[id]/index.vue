<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { Product } from "~/types/product";
import type {
  CreateProjectItemPayload,
  CreateProjectPayload,
  Project,
  ProjectItem,
  UpdateProjectItemPayload,
} from "~/types/project";
import ProjectForm from "../_components/ProjectForm.vue";
import ProjectItemForm from "../_components/ProjectItemForm.vue";
import {
  getProjectProgress,
  getProjectStatusColor,
  getProjectStatusLabel,
} from "../_components/project-options";
import { formatCurrency, formatLongDate, formatNumber } from "~/utils/format";

definePageMeta({
  layout: "shop",
});

const route = useRoute();
const router = useRouter();
const toast = useToast();
const projectStore = useProjectStore();
const productStore = useProductStore();

const projectId = computed(() => String(route.params.id));
const { project, projectItems, isLoading } = storeToRefs(projectStore);
const { products } = storeToRefs(productStore);

const pageError = ref<string | null>(null);
const isRetrying = ref(false);
const isEditOpen = ref(false);
const isDeleteOpen = ref(false);
const isAddItemOpen = ref(false);
const isEditItemOpen = ref(false);
const isDeleteItemOpen = ref(false);
const isSaving = ref(false);
const itemToEdit = ref<ProjectItem | null>(null);
const itemToDelete = ref<ProjectItem | null>(null);

useSeoMeta({
  title: () =>
    `${project.value?.name ?? "Project"} | ZOOM WIDE Construction Supplies`,
  description:
    "Manage a project item list, adjust quantities, and convert it into a pending order.",
});

const loadPage = async () => {
  pageError.value = null;

  const [projectResponse, itemsResponse, productsResponse] = await Promise.all([
    projectStore.fetchProjectById(projectId.value),
    projectStore.fetchProjectItems(projectId.value),
    productStore.fetchProducts({ page: 1, limit: 100 }),
  ]);

  if (projectResponse.status === "error") {
    pageError.value =
      projectResponse.message || "This project could not be loaded.";
    return;
  }

  if (itemsResponse.status === "error") {
    pageError.value =
      itemsResponse.message || "The project item list could not be loaded.";
    return;
  }

  if (productsResponse.status === "error") {
    pageError.value =
      productsResponse.message || "Product options could not be loaded.";
  }
};

await loadPage();

const notify = (title: string, description?: string, color: "success" | "error" = "success") => {
  toast.add({
    title,
    description,
    color,
    icon:
      color === "success"
        ? "i-lucide-circle-check"
        : "i-lucide-circle-alert",
  });
};

const itemSubtotal = computed(() =>
  projectItems.value.reduce((sum, item) => sum + Number(item.total_price ?? 0), 0),
);

const handleRetry = async () => {
  isRetrying.value = true;
  await loadPage();
  isRetrying.value = false;
};

const handleEditProject = async (payload: CreateProjectPayload) => {
  if (!project.value?.id) {
    return;
  }

  isSaving.value = true;
  const response = await projectStore.updateProject(project.value.id, payload);
  isSaving.value = false;

  if (response.status === "error") {
    notify("Project not updated", response.message, "error");
    return;
  }

  notify("Project updated", response.message || "Project saved.");
  isEditOpen.value = false;
};

const handleDeleteProject = async () => {
  if (!project.value?.id) {
    return;
  }

  isSaving.value = true;
  const response = await projectStore.deleteProject(project.value.id);
  isSaving.value = false;

  if (response.status === "error") {
    notify("Project not deleted", response.message, "error");
    return;
  }

  notify("Project deleted", response.message || "Project removed.");
  isDeleteOpen.value = false;
  await router.push("/shop/account/projects");
};

const handleAddItem = async (payload: CreateProjectItemPayload | UpdateProjectItemPayload) => {
  if (!project.value?.id || !("product_id" in payload)) {
    return;
  }

  isSaving.value = true;
  const response = await projectStore.addProjectItem(project.value.id, payload);
  isSaving.value = false;

  if (response.status === "error") {
    notify("Project item not added", response.message, "error");
    return;
  }

  await projectStore.fetchProjectItems(project.value.id);
  notify("Item added", response.message || "Product added to project.");
  isAddItemOpen.value = false;
};

const handleEditItem = async (payload: CreateProjectItemPayload | UpdateProjectItemPayload) => {
  if (!project.value?.id || !itemToEdit.value?.id || !("quantity" in payload)) {
    return;
  }

  isSaving.value = true;
  const response = await projectStore.updateProjectItem(
    project.value.id,
    itemToEdit.value.id,
    {
      quantity: payload.quantity,
    },
  );
  isSaving.value = false;

  if (response.status === "error") {
    notify("Project item not updated", response.message, "error");
    return;
  }

  await projectStore.fetchProjectItems(project.value.id);
  notify("Item updated", response.message || "Project item quantity updated.");
  isEditItemOpen.value = false;
  itemToEdit.value = null;
};

const handleDeleteItem = async () => {
  if (!project.value?.id || !itemToDelete.value?.id) {
    return;
  }

  isSaving.value = true;
  const response = await projectStore.deleteProjectItem(
    project.value.id,
    itemToDelete.value.id,
  );
  isSaving.value = false;

  if (response.status === "error") {
    notify("Project item not deleted", response.message, "error");
    return;
  }

  notify("Item deleted", response.message || "Project item removed.");
  isDeleteItemOpen.value = false;
  itemToDelete.value = null;
};

const handleCheckout = async () => {
  if (!project.value?.id) {
    return;
  }

  isSaving.value = true;
  const response = await projectStore.checkoutProject(project.value.id);
  isSaving.value = false;

  if (response.status === "error") {
    notify("Checkout failed", response.message, "error");
    return;
  }

  notify("Project checked out", response.message || "Pending order created.");

  if (response.data?.id) {
    await router.push(`/orders/${response.data.id}`);
    return;
  }

  await Promise.all([
    projectStore.fetchProjectById(project.value.id),
    projectStore.fetchProjectItems(project.value.id),
  ]);
};

const openEditItem = (item: ProjectItem) => {
  itemToEdit.value = item;
  isEditItemOpen.value = true;
};

const openDeleteItem = (item: ProjectItem) => {
  itemToDelete.value = item;
  isDeleteItemOpen.value = true;
};

const getItemProductName = (item: ProjectItem) =>
  item.product?.name ??
  products.value.find((product) => product.id === item.product_id)?.name ??
  item.product_id;

const getItemUnit = (item: ProjectItem) =>
  item.product?.unit ??
  products.value.find((product) => product.id === item.product_id)?.unit ??
  "unit";
</script>

<template>
  <StorefrontPageContainer size="wide" class="py-8 md:py-10">
    <section
      class="rounded-lg border border-slate-200/80 bg-white/95 p-6 shadow-[0_20px_40px_rgba(15,23,42,0.05)] md:p-8"
    >
      <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Project Workspace</p>
          <h1 class="mt-2 text-3xl font-bold text-brand-950">
            {{ project?.name ?? "Project details" }}
          </h1>
          <p class="mt-2 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
            Keep product selections tied to this job, then create a pending
            order directly from the saved item list.
          </p>
        </div>

        <div class="flex flex-wrap gap-3">
          <UButton color="neutral" variant="outline" to="/shop/account/projects">
            Back to projects
          </UButton>
          <UButton color="neutral" variant="soft" @click="isEditOpen = true">
            Edit project
          </UButton>
          <UButton color="warning" @click="isAddItemOpen = true">
            Add item
          </UButton>
          <UButton
            color="warning"
            variant="solid"
            :disabled="!projectItems.length"
            :loading="isSaving"
            @click="handleCheckout"
          >
            Checkout project
          </UButton>
        </div>
      </div>
    </section>

    <StorefrontStateCard
      v-if="pageError"
      class="mt-6"
      eyebrow="Project"
      title="This project is temporarily unavailable"
      :description="pageError"
      tone="error"
    >
      <template #actions>
        <div class="flex flex-wrap gap-3">
          <StorefrontButton tone="danger" :loading="isRetrying" @click="handleRetry">
            Retry
          </StorefrontButton>
          <StorefrontButton tone="secondary" to="/shop/account/projects">
            Back to projects
          </StorefrontButton>
        </div>
      </template>
    </StorefrontStateCard>

    <template v-else-if="project">
      <div class="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_360px] xl:items-start">
        <div class="space-y-6">
          <UCard class="rounded-[1.5rem]">
            <div class="flex flex-col gap-6">
              <div class="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                    {{ project.location || "No location yet" }}
                  </p>
                  <h2 class="mt-2 text-2xl font-semibold text-brand-950">
                    {{ project.name }}
                  </h2>
                </div>

                <UBadge :color="getProjectStatusColor(project.status)" variant="subtle">
                  {{ getProjectStatusLabel(project.status) }}
                </UBadge>
              </div>

              <p class="text-sm leading-7 text-slate-600">
                {{ project.description || "No project description yet." }}
              </p>

              <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div class="rounded-[1.25rem] border border-slate-200/70 p-4">
                  <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Progress</p>
                  <p class="mt-2 text-xl font-semibold text-slate-900">
                    {{ getProjectProgress(project) }}%
                  </p>
                </div>
                <div class="rounded-[1.25rem] border border-slate-200/70 p-4">
                  <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Budget</p>
                  <p class="mt-2 text-xl font-semibold text-slate-900">
                    {{ formatCurrency(Number(project.budget ?? 0)) }}
                  </p>
                </div>
                <div class="rounded-[1.25rem] border border-slate-200/70 p-4">
                  <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Orders</p>
                  <p class="mt-2 text-xl font-semibold text-slate-900">
                    {{ formatNumber(project.total_orders ?? 0) }}
                  </p>
                </div>
                <div class="rounded-[1.25rem] border border-slate-200/70 p-4">
                  <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Spent</p>
                  <p class="mt-2 text-xl font-semibold text-slate-900">
                    {{ formatCurrency(Number(project.total_spent ?? 0)) }}
                  </p>
                </div>
              </div>
            </div>
          </UCard>

          <UCard class="rounded-[1.5rem]">
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Project items</p>
                <h2 class="mt-2 text-xl font-semibold text-brand-950">
                  Saved material list
                </h2>
              </div>

              <UButton color="warning" variant="soft" @click="isAddItemOpen = true">
                Add item
              </UButton>
            </div>

            <div v-if="isLoading && !projectItems.length" class="mt-6 space-y-3">
              <USkeleton v-for="index in 4" :key="index" class="h-16 w-full rounded-xl" />
            </div>

            <div v-else-if="projectItems.length" class="mt-6 space-y-3">
              <div
                v-for="item in projectItems"
                :key="item.id"
                class="flex flex-col gap-4 rounded-[1.25rem] border border-slate-200/70 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p class="font-semibold text-slate-900">
                    {{ getItemProductName(item) }}
                  </p>
                  <p class="mt-1 text-sm text-slate-500">
                    {{ formatNumber(item.quantity) }} {{ getItemUnit(item) }} at
                    {{ formatCurrency(Number(item.unit_price ?? 0)) }} each
                  </p>
                </div>

                <div class="flex flex-wrap items-center gap-3">
                  <p class="font-semibold text-brand-950">
                    {{ formatCurrency(Number(item.total_price ?? 0)) }}
                  </p>
                  <UButton color="neutral" variant="ghost" @click="openEditItem(item)">
                    Edit qty
                  </UButton>
                  <UButton color="error" variant="ghost" @click="openDeleteItem(item)">
                    Remove
                  </UButton>
                </div>
              </div>
            </div>

            <div v-else class="mt-6 rounded-[1.25rem] border border-dashed border-slate-200 p-6 text-center">
              <p class="text-sm text-slate-600">
                No items added yet. Save products here before checking out the project.
              </p>
            </div>
          </UCard>
        </div>

        <div class="space-y-6">
          <UCard class="rounded-[1.5rem]">
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Timeline</p>
            <div class="mt-4 space-y-4">
              <div class="rounded-[1.25rem] border border-slate-200/70 p-4">
                <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Start date</p>
                <p class="mt-2 font-medium text-slate-900">
                  {{ project.start_date ? formatLongDate(project.start_date) : "Not set" }}
                </p>
              </div>
              <div class="rounded-[1.25rem] border border-slate-200/70 p-4">
                <p class="text-xs uppercase tracking-[0.18em] text-slate-500">End date</p>
                <p class="mt-2 font-medium text-slate-900">
                  {{ project.end_date ? formatLongDate(project.end_date) : "Not set" }}
                </p>
              </div>
              <div class="rounded-[1.25rem] border border-slate-200/70 p-4">
                <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Last updated</p>
                <p class="mt-2 font-medium text-slate-900">
                  {{ formatLongDate(project.updated_at ?? project.created_at) }}
                </p>
              </div>
            </div>
          </UCard>

          <UCard class="rounded-[1.5rem]">
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Checkout summary</p>
            <div class="mt-4 space-y-4">
              <div class="flex items-center justify-between text-sm text-slate-600">
                <span>Saved items</span>
                <span class="font-semibold text-slate-900">
                  {{ formatNumber(projectItems.length) }}
                </span>
              </div>
              <div class="flex items-center justify-between text-sm text-slate-600">
                <span>Materials subtotal</span>
                <span class="font-semibold text-slate-900">
                  {{ formatCurrency(itemSubtotal) }}
                </span>
              </div>
              <p class="text-sm leading-6 text-slate-600">
                Project checkout creates a pending order from the current saved items
                and lets the backend update the project totals.
              </p>
              <UButton
                color="warning"
                block
                :disabled="!projectItems.length"
                :loading="isSaving"
                @click="handleCheckout"
              >
                Checkout this project
              </UButton>
              <UButton color="error" variant="ghost" block @click="isDeleteOpen = true">
                Delete project
              </UButton>
            </div>
          </UCard>
        </div>
      </div>
    </template>

    <UModal v-model:open="isEditOpen">
      <template #header>
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Edit Project</p>
          <h3 class="mt-2 text-lg font-semibold">Update project details</h3>
        </div>
      </template>
      <template #body>
        <ProjectForm
          :project="project"
          submit-label="Save Changes"
          :is-submitting="isSaving"
          @submit="handleEditProject"
          @cancel="isEditOpen = false"
        />
      </template>
    </UModal>

    <UModal v-model:open="isAddItemOpen">
      <template #header>
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Add Item</p>
          <h3 class="mt-2 text-lg font-semibold">Save product to this project</h3>
        </div>
      </template>
      <template #body>
        <ProjectItemForm
          :products="products as Product[]"
          submit-label="Add Item"
          :is-submitting="isSaving"
          @submit="handleAddItem"
          @cancel="isAddItemOpen = false"
        />
      </template>
    </UModal>

    <UModal v-model:open="isEditItemOpen">
      <template #header>
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Edit Quantity</p>
          <h3 class="mt-2 text-lg font-semibold">
            {{ itemToEdit ? getItemProductName(itemToEdit) : "Project item" }}
          </h3>
        </div>
      </template>
      <template #body>
        <ProjectItemForm
          :item="itemToEdit"
          :products="products as Product[]"
          submit-label="Update Quantity"
          :is-submitting="isSaving"
          :allow-product-change="false"
          @submit="handleEditItem"
          @cancel="isEditItemOpen = false"
        />
      </template>
    </UModal>

    <UModal v-model:open="isDeleteItemOpen">
      <template #header>
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Remove Item</p>
          <h3 class="mt-2 text-lg font-semibold">
            {{ itemToDelete ? getItemProductName(itemToDelete) : "Project item" }}
          </h3>
        </div>
      </template>
      <template #body>
        <p class="text-sm text-slate-600">
          Remove this saved product from the project list?
        </p>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton color="neutral" variant="ghost" @click="isDeleteItemOpen = false">
            Cancel
          </UButton>
          <UButton color="error" :loading="isSaving" @click="handleDeleteItem">
            Remove item
          </UButton>
        </div>
      </template>
    </UModal>

    <UModal v-model:open="isDeleteOpen">
      <template #header>
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Delete Project</p>
          <h3 class="mt-2 text-lg font-semibold">
            {{ project?.name ?? "Project" }}
          </h3>
        </div>
      </template>
      <template #body>
        <p class="text-sm text-slate-600">
          This removes the project and all saved items under it. This action cannot be undone.
        </p>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton color="neutral" variant="ghost" @click="isDeleteOpen = false">
            Cancel
          </UButton>
          <UButton color="error" :loading="isSaving" @click="handleDeleteProject">
            Delete project
          </UButton>
        </div>
      </template>
    </UModal>
  </StorefrontPageContainer>
</template>
