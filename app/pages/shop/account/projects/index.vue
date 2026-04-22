<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { CreateProjectPayload, Project } from "~/types/project";
import ProjectForm from "./_components/ProjectForm.vue";
import {
  getProjectProgress,
  getProjectStatusColor,
  getProjectStatusLabel,
} from "./_components/project-options";
import { formatCurrency, formatLongDate, formatNumber } from "~/utils/format";

definePageMeta({
  layout: "shop",
});

useSeoMeta({
  title: "Projects | ZOOM WIDE Construction Supplies",
  description:
    "Manage active jobs, track project budgets, and prepare project-based material checkouts.",
});

const projectStore = useProjectStore();
const toast = useToast();
const router = useRouter();

const { projects, totalProjects, isLoading } = storeToRefs(projectStore);

const pageError = ref<string | null>(null);
const isRetrying = ref(false);
const isCreateOpen = ref(false);
const isEditOpen = ref(false);
const isDeleteOpen = ref(false);
const isSaving = ref(false);
const projectToEdit = ref<Project | null>(null);
const projectToDelete = ref<Project | null>(null);

const loadPage = async () => {
  const response = await projectStore.fetchProjects();
  pageError.value =
    response.status === "error"
      ? response.message || "Your projects could not be loaded."
      : null;
};

await loadPage();

const handleRetry = async () => {
  isRetrying.value = true;
  await loadPage();
  isRetrying.value = false;
};

const openCreate = () => {
  isCreateOpen.value = true;
};

const openEdit = (project: Project) => {
  projectToEdit.value = project;
  isEditOpen.value = true;
};

const openDelete = (project: Project) => {
  projectToDelete.value = project;
  isDeleteOpen.value = true;
};

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

const handleCreate = async (payload: CreateProjectPayload) => {
  isSaving.value = true;
  const response = await projectStore.createProject(payload);
  isSaving.value = false;

  if (response.status === "error") {
    notify("Project not created", response.message, "error");
    return;
  }

  notify("Project created", response.message || `Added ${payload.name}.`);
  isCreateOpen.value = false;
};

const handleEdit = async (payload: CreateProjectPayload) => {
  if (!projectToEdit.value?.id) {
    return;
  }

  isSaving.value = true;
  const response = await projectStore.updateProject(projectToEdit.value.id, payload);
  isSaving.value = false;

  if (response.status === "error") {
    notify("Project not updated", response.message, "error");
    return;
  }

  notify("Project updated", response.message || `Saved ${payload.name}.`);
  isEditOpen.value = false;
  projectToEdit.value = null;
};

const handleDelete = async () => {
  if (!projectToDelete.value?.id) {
    return;
  }

  isSaving.value = true;
  const response = await projectStore.deleteProject(projectToDelete.value.id);
  isSaving.value = false;

  if (response.status === "error") {
    notify("Project not deleted", response.message, "error");
    return;
  }

  notify("Project deleted", response.message || "Project removed.");
  isDeleteOpen.value = false;
  projectToDelete.value = null;
};

const goToDetail = (projectId: string) => {
  void router.push(`/shop/account/projects/${projectId}`);
};
</script>

<template>
  <StorefrontPageContainer size="wide" class="py-8 md:py-10">
    <section
      class="rounded-lg border border-slate-200/80 bg-white/95 p-6 shadow-[0_20px_40px_rgba(15,23,42,0.05)] md:p-8"
    >
      <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Shop Account
          </p>
          <h1 class="mt-2 text-3xl font-bold text-brand-950">
            Project workspace
          </h1>
          <p class="mt-2 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
            Track job sites, save project-specific material lists, and convert a
            project basket into a pending order when it is ready.
          </p>
        </div>

        <div class="flex flex-wrap gap-3">
          <UButton color="neutral" variant="outline" to="/shop/account">
            Back to account
          </UButton>
          <UButton color="warning" @click="openCreate">
            New project
          </UButton>
        </div>
      </div>
    </section>

    <StorefrontStateCard
      v-if="pageError"
      class="mt-6"
      eyebrow="Projects"
      title="Your projects are temporarily unavailable"
      :description="pageError"
      tone="error"
    >
      <template #actions>
        <div class="flex flex-wrap gap-3">
          <StorefrontButton tone="danger" :loading="isRetrying" @click="handleRetry">
            Retry
          </StorefrontButton>
          <StorefrontButton tone="secondary" to="/shop/account">
            Back to account
          </StorefrontButton>
        </div>
      </template>
    </StorefrontStateCard>

    <template v-else>
      <div class="mt-6 grid gap-4 md:grid-cols-3">
        <UCard>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Projects</p>
          <p class="mt-3 text-3xl font-bold text-brand-950">
            {{ formatNumber(totalProjects || projects.length) }}
          </p>
        </UCard>
        <UCard>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Active jobs</p>
          <p class="mt-3 text-3xl font-bold text-brand-950">
            {{ formatNumber(projects.filter((project) => project.status === "active").length) }}
          </p>
        </UCard>
        <UCard>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Tracked budget</p>
          <p class="mt-3 text-3xl font-bold text-brand-950">
            {{
              formatCurrency(
                projects.reduce((sum, project) => sum + Number(project.budget ?? 0), 0),
              )
            }}
          </p>
        </UCard>
      </div>

      <div v-if="isLoading && !projects.length" class="mt-6 grid gap-4 lg:grid-cols-2">
        <USkeleton v-for="index in 4" :key="index" class="h-56 w-full rounded-[1.5rem]" />
      </div>

      <div
        v-else-if="projects.length"
        class="mt-6 grid gap-4 lg:grid-cols-2"
      >
        <UCard
          v-for="entry in projects"
          :key="entry.id"
          class="rounded-[1.5rem] border border-slate-200/80"
        >
          <div class="flex flex-col gap-5">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                  {{ entry.location || "No location yet" }}
                </p>
                <h2 class="mt-2 text-xl font-semibold text-brand-950">
                  {{ entry.name }}
                </h2>
              </div>

              <UBadge :color="getProjectStatusColor(entry.status)" variant="subtle">
                {{ getProjectStatusLabel(entry.status) }}
              </UBadge>
            </div>

            <p class="text-sm leading-6 text-slate-600">
              {{ entry.description || "No project description yet." }}
            </p>

            <div class="grid gap-4 md:grid-cols-2">
              <div>
                <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Progress</p>
                <p class="mt-2 text-lg font-semibold text-slate-900">
                  {{ getProjectProgress(entry) }}%
                </p>
                <UProgress class="mt-2" :model-value="getProjectProgress(entry)" color="warning" />
              </div>
              <div>
                <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Budget</p>
                <p class="mt-2 text-lg font-semibold text-slate-900">
                  {{ formatCurrency(Number(entry.budget ?? 0)) }}
                </p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Orders</p>
                <p class="mt-2 text-lg font-semibold text-slate-900">
                  {{ formatNumber(entry.total_orders ?? 0) }}
                </p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Spent</p>
                <p class="mt-2 text-lg font-semibold text-slate-900">
                  {{ formatCurrency(Number(entry.total_spent ?? 0)) }}
                </p>
              </div>
            </div>

            <div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-sm text-slate-500">
              <span>
                Updated {{ formatLongDate(entry.updated_at ?? entry.created_at) }}
              </span>
              <div class="flex flex-wrap gap-2">
                <UButton color="neutral" variant="ghost" @click="openEdit(entry)">
                  Edit
                </UButton>
                <UButton color="error" variant="ghost" @click="openDelete(entry)">
                  Delete
                </UButton>
                <UButton color="warning" @click="goToDetail(entry.id)">
                  Open project
                </UButton>
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <UCard v-else class="mt-6 rounded-[1.5rem]">
        <div class="py-8 text-center">
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Projects</p>
          <h2 class="mt-3 text-2xl font-semibold text-brand-950">No projects yet</h2>
          <p class="mt-2 text-sm text-slate-600">
            Create a project to start grouping materials, tracking procurement,
            and checking out by job instead of from the shared cart.
          </p>
          <div class="mt-6">
            <UButton color="warning" @click="openCreate">
              Create your first project
            </UButton>
          </div>
        </div>
      </UCard>
    </template>

    <UModal v-model:open="isCreateOpen">
      <template #header>
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">New Project</p>
          <h3 class="mt-2 text-lg font-semibold">Create project workspace</h3>
        </div>
      </template>
      <template #body>
        <ProjectForm
          :project="null"
          submit-label="Create Project"
          :is-submitting="isSaving"
          @submit="handleCreate"
          @cancel="isCreateOpen = false"
        />
      </template>
    </UModal>

    <UModal v-model:open="isEditOpen">
      <template #header>
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Edit Project</p>
          <h3 class="mt-2 text-lg font-semibold">Update project details</h3>
        </div>
      </template>
      <template #body>
        <ProjectForm
          :project="projectToEdit"
          submit-label="Save Changes"
          :is-submitting="isSaving"
          @submit="handleEdit"
          @cancel="isEditOpen = false"
        />
      </template>
    </UModal>

    <UModal v-model:open="isDeleteOpen">
      <template #header>
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Delete Project</p>
          <h3 class="mt-2 text-lg font-semibold">
            {{ projectToDelete?.name ?? "Project" }}
          </h3>
        </div>
      </template>
      <template #body>
        <p class="text-sm text-slate-600">
          This removes the project and its saved item list. This action cannot be undone.
        </p>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton color="neutral" variant="ghost" @click="isDeleteOpen = false">
            Cancel
          </UButton>
          <UButton color="error" :loading="isSaving" @click="handleDelete">
            Delete project
          </UButton>
        </div>
      </template>
    </UModal>
  </StorefrontPageContainer>
</template>
