import { computed, ref } from "vue";
import { defineStore } from "pinia";

type PsgcBaseItem = {
  code: string;
  name: string;
  oldName?: string | null;
  islandGroupCode?: string | null;
};

export type PsgcRegion = PsgcBaseItem & {
  regionName?: string | null;
};

export type PsgcProvince = PsgcBaseItem & {
  regionCode?: string | null;
};

export type PsgcCityMunicipality = PsgcBaseItem & {
  regionCode?: string | null;
  provinceCode?: string | boolean | null;
  districtCode?: string | boolean | null;
  isCity?: boolean;
  isMunicipality?: boolean;
  isCapital?: boolean;
};

export type PsgcBarangay = PsgcBaseItem & {
  regionCode?: string | null;
  provinceCode?: string | null;
  districtCode?: string | boolean | null;
  cityCode?: string | boolean | null;
  municipalityCode?: string | boolean | null;
  subMunicipalityCode?: string | boolean | null;
};

const PSGC_API_BASE_URL = "https://psgc.gitlab.io/api";

const normalizeText = (value: unknown) => {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length ? normalized : null;
};

const normalizeBooleanOrCode = (value: unknown) => {
  if (typeof value === "boolean") {
    return value;
  }

  return normalizeText(value);
};

const normalizeRegion = (value: unknown): PsgcRegion | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as PsgcRegion;
  const code = normalizeText(candidate.code);
  const name = normalizeText(candidate.name);

  if (!code || !name) {
    return null;
  }

  return {
    ...candidate,
    code,
    name,
    regionName: normalizeText(candidate.regionName),
    oldName: normalizeText(candidate.oldName),
    islandGroupCode: normalizeText(candidate.islandGroupCode),
  };
};

const normalizeProvince = (value: unknown): PsgcProvince | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as PsgcProvince;
  const code = normalizeText(candidate.code);
  const name = normalizeText(candidate.name);

  if (!code || !name) {
    return null;
  }

  return {
    ...candidate,
    code,
    name,
    regionCode: normalizeText(candidate.regionCode),
    oldName: normalizeText(candidate.oldName),
    islandGroupCode: normalizeText(candidate.islandGroupCode),
  };
};

const normalizeCityMunicipality = (
  value: unknown,
): PsgcCityMunicipality | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as PsgcCityMunicipality;
  const code = normalizeText(candidate.code);
  const name = normalizeText(candidate.name);

  if (!code || !name) {
    return null;
  }

  return {
    ...candidate,
    code,
    name,
    oldName: normalizeText(candidate.oldName),
    regionCode: normalizeText(candidate.regionCode),
    provinceCode: normalizeBooleanOrCode(candidate.provinceCode),
    districtCode: normalizeBooleanOrCode(candidate.districtCode),
    islandGroupCode: normalizeText(candidate.islandGroupCode),
    isCity: Boolean(candidate.isCity),
    isMunicipality: Boolean(candidate.isMunicipality),
    isCapital: Boolean(candidate.isCapital),
  };
};

const normalizeBarangay = (value: unknown): PsgcBarangay | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as PsgcBarangay;
  const code = normalizeText(candidate.code);
  const name = normalizeText(candidate.name);

  if (!code || !name) {
    return null;
  }

  return {
    ...candidate,
    code,
    name,
    oldName: normalizeText(candidate.oldName),
    regionCode: normalizeText(candidate.regionCode),
    provinceCode: normalizeText(candidate.provinceCode),
    districtCode: normalizeBooleanOrCode(candidate.districtCode),
    cityCode: normalizeBooleanOrCode(candidate.cityCode),
    municipalityCode: normalizeBooleanOrCode(candidate.municipalityCode),
    subMunicipalityCode: normalizeBooleanOrCode(candidate.subMunicipalityCode),
    islandGroupCode: normalizeText(candidate.islandGroupCode),
  };
};

const buildPsgcUrl = (path: string) =>
  `${PSGC_API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

export const getPsgcRegionLabel = (region: PsgcRegion) =>
  region.regionName || region.name;

export const getPsgcCityMunicipalityLabel = (item: PsgcCityMunicipality) => {
  if (item.isCity) {
    return item.name;
  }

  if (item.isMunicipality) {
    return item.name;
  }

  return item.name;
};

export const usePsgcStore = defineStore("psgc", () => {
  const regions = ref<PsgcRegion[]>([]);
  const provinces = ref<PsgcProvince[]>([]);
  const citiesByRegion = ref<Record<string, PsgcCityMunicipality[]>>({});
  const citiesByProvince = ref<Record<string, PsgcCityMunicipality[]>>({});
  const barangaysByCityMunicipality = ref<Record<string, PsgcBarangay[]>>({});
  const isLoadingRegions = ref(false);
  const isLoadingProvinces = ref(false);
  const loadingCitiesKey = ref<string | null>(null);
  const loadingBarangaysKey = ref<string | null>(null);

  const getCitiesForRegion = computed(
    () => (regionCode: string) => citiesByRegion.value[regionCode] ?? [],
  );
  const getCitiesForProvince = computed(
    () => (provinceCode: string) => citiesByProvince.value[provinceCode] ?? [],
  );
  const getBarangaysForCityMunicipality = computed(
    () => (code: string) => barangaysByCityMunicipality.value[code] ?? [],
  );

  const fetchJson = async <T>(
    path: string,
    normalizer: (value: unknown) => T | null,
  ) => {
    const response = await $fetch<unknown[]>(buildPsgcUrl(path));

    if (!Array.isArray(response)) {
      return [] as T[];
    }

    return response
      .map((item) => normalizer(item))
      .filter((item): item is T => Boolean(item));
  };

  const fetchRegions = async (force = false) => {
    if (regions.value.length && !force) {
      return regions.value;
    }

    isLoadingRegions.value = true;

    try {
      regions.value = await fetchJson("/regions.json", normalizeRegion);
      return regions.value;
    } finally {
      isLoadingRegions.value = false;
    }
  };

  const fetchProvinces = async (force = false) => {
    if (provinces.value.length && !force) {
      return provinces.value;
    }

    isLoadingProvinces.value = true;

    try {
      provinces.value = await fetchJson("/provinces.json", normalizeProvince);
      return provinces.value;
    } finally {
      isLoadingProvinces.value = false;
    }
  };

  const fetchCitiesForRegion = async (regionCode: string, force = false) => {
    if (!regionCode) {
      return [] as PsgcCityMunicipality[];
    }

    if (citiesByRegion.value[regionCode] && !force) {
      return citiesByRegion.value[regionCode];
    }

    loadingCitiesKey.value = `region:${regionCode}`;

    try {
      const items = await fetchJson(
        `/regions/${encodeURIComponent(regionCode)}/cities-municipalities.json`,
        normalizeCityMunicipality,
      );

      citiesByRegion.value = {
        ...citiesByRegion.value,
        [regionCode]: items,
      };

      return items;
    } finally {
      loadingCitiesKey.value = null;
    }
  };

  const fetchCitiesForProvince = async (provinceCode: string, force = false) => {
    if (!provinceCode) {
      return [] as PsgcCityMunicipality[];
    }

    if (citiesByProvince.value[provinceCode] && !force) {
      return citiesByProvince.value[provinceCode];
    }

    loadingCitiesKey.value = `province:${provinceCode}`;

    try {
      const items = await fetchJson(
        `/provinces/${encodeURIComponent(provinceCode)}/cities-municipalities.json`,
        normalizeCityMunicipality,
      );

      citiesByProvince.value = {
        ...citiesByProvince.value,
        [provinceCode]: items,
      };

      return items;
    } finally {
      loadingCitiesKey.value = null;
    }
  };

  const fetchBarangaysForCityMunicipality = async (
    cityMunicipalityCode: string,
    force = false,
  ) => {
    if (!cityMunicipalityCode) {
      return [] as PsgcBarangay[];
    }

    if (barangaysByCityMunicipality.value[cityMunicipalityCode] && !force) {
      return barangaysByCityMunicipality.value[cityMunicipalityCode];
    }

    loadingBarangaysKey.value = cityMunicipalityCode;

    try {
      const items = await fetchJson(
        `/cities-municipalities/${encodeURIComponent(cityMunicipalityCode)}/barangays.json`,
        normalizeBarangay,
      );

      barangaysByCityMunicipality.value = {
        ...barangaysByCityMunicipality.value,
        [cityMunicipalityCode]: items,
      };

      return items;
    } finally {
      loadingBarangaysKey.value = null;
    }
  };

  return {
    regions,
    provinces,
    citiesByRegion,
    citiesByProvince,
    barangaysByCityMunicipality,
    isLoadingRegions,
    isLoadingProvinces,
    loadingCitiesKey,
    loadingBarangaysKey,
    getCitiesForRegion,
    getCitiesForProvince,
    getBarangaysForCityMunicipality,
    fetchRegions,
    fetchProvinces,
    fetchCitiesForRegion,
    fetchCitiesForProvince,
    fetchBarangaysForCityMunicipality,
  };
});
