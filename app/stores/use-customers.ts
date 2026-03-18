import { defineStore } from "pinia";
import { ref } from "vue";
import type {
  Customer,
  CustomerPagination,
  FetchCustomerParams,
} from "~/types/customer";
import type { H3Response } from "~/types/h3Response";
import { customers as seedCustomers } from "~/seeds/customers";

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

export const useCustomerStore = defineStore("customers", () => {
  const error = ref<Error | null>(null);
  const customer = ref<Customer | null>(null);
  const isLoading = ref(false);

  const allCustomers = ref<Customer[]>([...seedCustomers]);
  const customers = ref<Customer[]>([]);

  const query = ref<FetchCustomerParams>({
    q: "",
    page: 1,
  });

  const pagination = ref<CustomerPagination>({
    page: 1,
    limit: seedCustomers.length,
    total: 0,
    total_pages: 0,
  });

  const fetchCustomers = async (): Promise<H3Response<Customer[]>> => {
    try {
      isLoading.value = true;

      let filtered = [...allCustomers.value];

      if (query.value.q) {
        const q = query.value.q.toLowerCase();
        filtered = filtered.filter((c) => {
          const phone = c.phone ?? "";
          return (
            c.company_name.toLowerCase().includes(q) ||
            c.contact_name.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q) ||
            phone.toLowerCase().includes(q)
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

      customers.value = filtered.slice(start, end);
      return buildOkResponse(customers.value, pagination.value.total);
    } catch (err: any) {
      error.value = err;
      return buildErrorResponse<Customer[]>(err);
    } finally {
      isLoading.value = false;
    }
  };

  const fetchCustomerById = async (
    id: string,
  ): Promise<H3Response<Customer | null>> => {
    try {
      const found = allCustomers.value.find((c) => c.id === id);

      if (!found) {
        customer.value = null;
        return buildOkResponse(null, 0);
      }

      customer.value = found;
      return buildOkResponse(customer.value, 1);
    } catch (err: any) {
      error.value = err;
      return buildErrorResponse<Customer | null>(err);
    }
  };

  const setSearch = async (value: string) => {
    query.value.q = value;
    query.value.page = 1;
    return await fetchCustomers();
  };

  const setFilter = async (filters: Partial<FetchCustomerParams>) => {
    query.value = {
      ...query.value,
      ...filters,
      page: 1,
    };

    return await fetchCustomers();
  };

  const setPage = async (page: number) => {
    query.value.page = page;
    return await fetchCustomers();
  };

  return {
    customer,
    customers,
    query,
    pagination,
    isLoading,
    error,
    fetchCustomers,
    fetchCustomerById,
    setSearch,
    setFilter,
    setPage,
  };
});
