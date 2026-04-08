<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { PsgcBarangay, PsgcCityMunicipality } from "~/stores/use-psgc";
import {
  getPsgcCityMunicipalityLabel,
  getPsgcRegionLabel,
} from "~/stores/use-psgc";
import type { AddressDraft } from "~/utils/address";

const props = withDefaults(
  defineProps<{
    title?: string;
    description?: string;
  }>(),
  {
    title: "Delivery Address",
    description:
      "Use PSGC-backed selections for Philippine delivery locations.",
  },
);

const draft = defineModel<AddressDraft>({
  required: true,
});

const psgcStore = usePsgcStore();
const {
  regions,
  provinces,
  isLoadingRegions,
  isLoadingProvinces,
  loadingCitiesKey,
  loadingBarangaysKey,
} = storeToRefs(psgcStore);

const selectedRegionCode = ref("");
const selectedProvinceCode = ref("");
const selectedCityCode = ref("");
const selectedBarangayCode = ref("");
const psgcError = ref<string | null>(null);
const hasInitialized = ref(false);
const isSyncing = ref(false);

const selectedRegion = computed(
  () =>
    regions.value.find((item) => item.code === selectedRegionCode.value) ??
    null,
);
const provinceItems = computed(() =>
  provinces.value
    .filter((item) => item.regionCode === selectedRegionCode.value)
    .map((item) => ({
      label: item.name,
      value: item.code,
    })),
);
const regionHasProvinceOptions = computed(() => provinceItems.value.length > 0);
const cityOptions = ref<PsgcCityMunicipality[]>([]);
const barangayOptions = ref<PsgcBarangay[]>([]);
const selectedProvince = computed(
  () =>
    provinces.value.find((item) => item.code === selectedProvinceCode.value) ??
    null,
);
const selectedCity = computed(
  () =>
    cityOptions.value.find((item) => item.code === selectedCityCode.value) ??
    null,
);

const regionItems = computed(() =>
  regions.value.map((item) => ({
    label: getPsgcRegionLabel(item),
    value: item.code,
  })),
);
const cityItems = computed(() =>
  cityOptions.value.map((item) => ({
    label: getPsgcCityMunicipalityLabel(item),
    value: item.code,
  })),
);
const barangayItems = computed(() =>
  barangayOptions.value.map((item) => ({
    label: item.name,
    value: item.code,
  })),
);
const isLoadingCities = computed(
  () =>
    loadingCitiesKey.value === `region:${selectedRegionCode.value}` ||
    loadingCitiesKey.value === `province:${selectedProvinceCode.value}`,
);
const isLoadingBarangays = computed(
  () => loadingBarangaysKey.value === selectedCityCode.value,
);

const setSyncing = async (callback: () => Promise<void> | void) => {
  isSyncing.value = true;

  try {
    await callback();
  } finally {
    isSyncing.value = false;
  }
};

const ensureBaseCollections = async () => {
  if (import.meta.server) {
    return;
  }

  try {
    await Promise.all([psgcStore.fetchRegions(), psgcStore.fetchProvinces()]);
    psgcError.value = null;
  } catch (error) {
    console.error("Failed to load PSGC reference data:", error);
    psgcError.value = "PSGC location data could not be loaded right now.";
  }
};

const loadCities = async (options?: {
  preserveCity?: boolean;
  preserveBarangay?: boolean;
}) => {
  if (!selectedRegionCode.value) {
    cityOptions.value = [];
    selectedCityCode.value = "";
    draft.value.city = "";
    barangayOptions.value = [];
    selectedBarangayCode.value = "";
    draft.value.address_line = "";
    return;
  }

  if (regionHasProvinceOptions.value && !selectedProvinceCode.value) {
    cityOptions.value = [];
    selectedCityCode.value = "";
    draft.value.city = "";
    barangayOptions.value = [];
    selectedBarangayCode.value = "";
    draft.value.address_line = "";
    return;
  }

  const preserveCity = options?.preserveCity ?? false;
  const preserveBarangay = options?.preserveBarangay ?? false;

  try {
    cityOptions.value =
      regionHasProvinceOptions.value && selectedProvinceCode.value
        ? await psgcStore.fetchCitiesForProvince(selectedProvinceCode.value)
        : await psgcStore.fetchCitiesForRegion(selectedRegionCode.value);
    psgcError.value = null;
  } catch (error) {
    console.error("Failed to load PSGC cities:", error);
    cityOptions.value = [];
    psgcError.value = "City and municipality options could not be loaded.";
  }

  if (!preserveCity) {
    selectedCityCode.value = "";
    draft.value.city = "";
  }

  if (!preserveBarangay) {
    barangayOptions.value = [];
    selectedBarangayCode.value = "";
    draft.value.address_line = "";
  }
};

const loadBarangays = async (options?: { preserveBarangay?: boolean }) => {
  if (!selectedCityCode.value) {
    barangayOptions.value = [];
    selectedBarangayCode.value = "";
    draft.value.address_line = "";
    return;
  }

  const preserveBarangay = options?.preserveBarangay ?? false;

  try {
    barangayOptions.value = await psgcStore.fetchBarangaysForCityMunicipality(
      selectedCityCode.value,
    );
    psgcError.value = null;
  } catch (error) {
    console.error("Failed to load PSGC barangays:", error);
    barangayOptions.value = [];
    psgcError.value = "Barangay options could not be loaded.";
  }

  if (!preserveBarangay) {
    selectedBarangayCode.value = "";
    draft.value.address_line = "";
  }
};

const applyRegionSelection = async (
  regionCode: string,
  options?: {
    preserveProvince?: boolean;
    preserveCity?: boolean;
    preserveBarangay?: boolean;
  },
) => {
  selectedRegionCode.value = regionCode;
  const region = selectedRegion.value;

  if (!region) {
    draft.value.region = "";
    selectedProvinceCode.value = "";
    draft.value.province = "";
    await loadCities();
    return;
  }

  draft.value.region = region.regionName || region.name;

  if (!regionHasProvinceOptions.value) {
    selectedProvinceCode.value = "";
    draft.value.province = region.regionName || region.name;
  } else if (!options?.preserveProvince) {
    selectedProvinceCode.value = "";
    draft.value.province = "";
  }

  await loadCities({
    preserveCity: options?.preserveCity,
    preserveBarangay: options?.preserveBarangay,
  });
};

const applyProvinceSelection = async (
  provinceCode: string,
  options?: { preserveCity?: boolean; preserveBarangay?: boolean },
) => {
  selectedProvinceCode.value = provinceCode;
  const province = selectedProvince.value;
  draft.value.province = province?.name ?? "";

  await loadCities({
    preserveCity: options?.preserveCity,
    preserveBarangay: options?.preserveBarangay,
  });
};

const applyCitySelection = async (
  cityCode: string,
  options?: { preserveBarangay?: boolean },
) => {
  selectedCityCode.value = cityCode;
  const city = selectedCity.value;
  draft.value.city = city?.name ?? "";
  await loadBarangays({
    preserveBarangay: options?.preserveBarangay,
  });
};

const applyBarangaySelection = (barangayCode: string) => {
  selectedBarangayCode.value = barangayCode;
  const barangay =
    barangayOptions.value.find((item) => item.code === barangayCode) ?? null;
  draft.value.address_line = barangay?.name ?? "";
};

const inferRegionFromDraft = async () => {
  if (!draft.value.region.trim() && !draft.value.province.trim()) {
    return null;
  }

  const directRegionMatch =
    regions.value.find(
      (item) =>
        item.code === draft.value.region ||
        item.name === draft.value.region ||
        item.regionName === draft.value.region,
    ) ??
    regions.value.find(
      (item) =>
        item.code === draft.value.province ||
        item.name === draft.value.province ||
        item.regionName === draft.value.province,
    );

  if (directRegionMatch) {
    return directRegionMatch;
  }

  const provinceMatch = provinces.value.find(
    (item) => item.name === draft.value.province,
  );

  if (!provinceMatch?.regionCode) {
    return null;
  }

  return (
    regions.value.find((item) => item.code === provinceMatch.regionCode) ?? null
  );
};

const syncFromDraft = async () => {
  await ensureBaseCollections();

  if (psgcError.value) {
    return;
  }

  await setSyncing(async () => {
    const regionMatch = await inferRegionFromDraft();

    if (!regionMatch) {
      selectedRegionCode.value = "";
      selectedProvinceCode.value = "";
      selectedCityCode.value = "";
      selectedBarangayCode.value = "";
      cityOptions.value = [];
      barangayOptions.value = [];
      return;
    }

    await applyRegionSelection(regionMatch.code, {
      preserveProvince: true,
      preserveCity: true,
      preserveBarangay: true,
    });

    if (regionHasProvinceOptions.value) {
      const provinceMatch =
        provinces.value.find(
          (item) =>
            item.regionCode === regionMatch.code &&
            item.name === draft.value.province,
        ) ?? null;

      if (provinceMatch) {
        await applyProvinceSelection(provinceMatch.code, {
          preserveCity: true,
          preserveBarangay: true,
        });
      }
    }

    const cityMatch =
      cityOptions.value.find((item) => item.name === draft.value.city) ?? null;

    if (cityMatch) {
      await applyCitySelection(cityMatch.code, {
        preserveBarangay: true,
      });
    }

    const barangayMatch =
      barangayOptions.value.find(
        (item) => item.name === draft.value.address_line,
      ) ?? null;

    if (barangayMatch) {
      selectedBarangayCode.value = barangayMatch.code;
    }
  });
};

watch(
  () => [
    draft.value.region,
    draft.value.province,
    draft.value.city,
    draft.value.address_line,
  ],
  async () => {
    if (isSyncing.value || !hasInitialized.value) {
      return;
    }

    await syncFromDraft();
  },
);

onMounted(async () => {
  if (!draft.value.country.trim()) {
    draft.value.country = "Philippines";
  }

  await ensureBaseCollections();
  hasInitialized.value = true;
  await syncFromDraft();
});
</script>

<template>
  <div class="space-y-4">
    <div>
      <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
        {{ props.title }}
      </p>
      <p class="mt-2 text-sm leading-6 text-slate-600">
        {{ props.description }}
      </p>
    </div>

    <UAlert
      v-if="psgcError"
      color="warning"
      variant="soft"
      icon="i-lucide-circle-alert"
      :title="psgcError"
    />

    <div class="grid gap-4 md:grid-cols-2">
      <UFormField label="Street / house number" required>
        <UInput
          v-model="draft.street"
          class="w-full"
          placeholder="123 Rizal Avenue"
        />
      </UFormField>

      <UFormField
        label="Region"
        required
        :description="isLoadingRegions ? 'Loading PSGC regions...' : undefined"
      >
        <USelect
          :model-value="selectedRegionCode"
          class="w-full"
          :items="regionItems"
          placeholder="Select region"
          @update:model-value="applyRegionSelection(String($event || ''))"
        />
      </UFormField>
    </div>

    <div class="grid gap-4 md:grid-cols-2 items-end">
      <UFormField
        label="Province"
        required
        :description="
          !selectedRegionCode
            ? 'Select a region first.'
            : !regionHasProvinceOptions
              ? 'This region uses direct city selections.'
              : isLoadingProvinces
                ? 'Loading PSGC provinces...'
                : undefined
        "
      >
        <USelect
          :model-value="selectedProvinceCode"
          class="w-full"
          :items="provinceItems"
          :placeholder="
            regionHasProvinceOptions
              ? 'Select province'
              : 'No province selection needed'
          "
          :disabled="!selectedRegionCode || !regionHasProvinceOptions"
          @update:model-value="applyProvinceSelection(String($event || ''))"
        />
      </UFormField>

      <UFormField
        label="City / Municipality"
        required
        :description="
          isLoadingCities
            ? 'Loading PSGC cities and municipalities...'
            : undefined
        "
      >
        <USelect
          :model-value="selectedCityCode"
          class="w-full"
          :items="cityItems"
          placeholder="Select city or municipality"
          :disabled="
            !selectedRegionCode ||
            (regionHasProvinceOptions && !selectedProvinceCode)
          "
          @update:model-value="applyCitySelection(String($event || ''))"
        />
      </UFormField>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <UFormField
        label="Barangay"
        required
        :description="
          isLoadingBarangays ? 'Loading PSGC barangays...' : undefined
        "
      >
        <USelect
          :model-value="selectedBarangayCode"
          class="w-full"
          :items="barangayItems"
          placeholder="Select barangay"
          :disabled="!selectedCityCode"
          @update:model-value="applyBarangaySelection(String($event || ''))"
        />
      </UFormField>

      <UFormField label="Postal code">
        <UInput v-model="draft.postal_code" class="w-full" placeholder="1100" />
      </UFormField>

      <UFormField label="Country">
        <UInput
          v-model="draft.country"
          class="w-full"
          placeholder="Philippines"
        />
      </UFormField>
    </div>
  </div>
</template>
