import { defineStore } from "pinia";
import { ref } from "vue";
import type {
  Driver,
  DriverPagination,
  FetchDriverParams,
} from "~/types/driver";
import type { H3Response } from "~/types/h3Response";
import { drivers as seedDrivers } from "~/seeds/drivers";

const buildOkResponse = <T>(data: T, total?: number): H3Response<T> => ({
  status: "ok",
  statusCode: 200,
  statusMessage: "ok",
  data,
  total,
});

const buildErrorResponse = <T>(err: unknown): H3Response<T> => ({
  status: "error",
  statusCode: 500,
  statusMessage: "internal server error",
  message: err instanceof Error ? err.message : "Unknown error",
});

export const useDriverStore = defineStore("drivers", () => {
  const error = ref<Error | null>(null);
  const driver = ref<Driver | null>(null);
  const isLoading = ref(false);

  const allDrivers = ref<Driver[]>([...seedDrivers]);
  const drivers = ref<Driver[]>([]);

  const query = ref<FetchDriverParams>({
    q: "",
    page: 1,
  });

  const pagination = ref<DriverPagination>({
    page: 1,
    limit: seedDrivers.length,
    total: 0,
    total_pages: 0,
  });

  const fetchDrivers = async (): Promise<H3Response<Driver[]>> => {
    try {
      isLoading.value = true;

      let filtered = [...allDrivers.value];

      if (query.value.q) {
        const q = query.value.q.toLowerCase();
        filtered = filtered.filter((d) => {
          const phone = d.phone ?? "";
          const email = d.email ?? "";
          const license = d.license_number ?? "";
          const vehicle = d.vehicle_number ?? "";
          return (
            d.name.toLowerCase().includes(q) ||
            phone.toLowerCase().includes(q) ||
            email.toLowerCase().includes(q) ||
            license.toLowerCase().includes(q) ||
            vehicle.toLowerCase().includes(q)
          );
        });
      }

      const start = (query.value.page! - 1) * pagination.value.limit!;
      const end = start + pagination.value.limit!;

      pagination.value.total = filtered.length;
      pagination.value.total_pages = Math.ceil(
        filtered.length / pagination.value.limit!,
      );
      pagination.value.page = query.value.page;

      drivers.value = filtered.slice(start, end);
      return buildOkResponse(drivers.value, pagination.value.total);
    } catch (err: any) {
      error.value = err;
      return buildErrorResponse<Driver[]>(err);
    } finally {
      isLoading.value = false;
    }
  };

  const fetchDriverById = async (
    id: string,
  ): Promise<H3Response<Driver | null>> => {
    try {
      const found = allDrivers.value.find((d) => d.id === id);

      if (!found) {
        driver.value = null;
        return buildOkResponse(null, 0);
      }

      driver.value = found;
      return buildOkResponse(driver.value, 1);
    } catch (err: any) {
      error.value = err;
      return buildErrorResponse<Driver | null>(err);
    }
  };

  const setSearch = async (value: string) => {
    query.value.q = value;
    query.value.page = 1;
    return await fetchDrivers();
  };

  const setFilter = async (filters: Partial<FetchDriverParams>) => {
    query.value = {
      ...query.value,
      ...filters,
      page: 1,
    };

    return await fetchDrivers();
  };

  const setPage = async (page: number) => {
    query.value.page = page;
    return await fetchDrivers();
  };

  return {
    driver,
    drivers,
    query,
    pagination,
    isLoading,
    error,
    fetchDrivers,
    fetchDriverById,
    setSearch,
    setFilter,
    setPage,
  };
});
