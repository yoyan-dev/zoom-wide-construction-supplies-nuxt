import { ref } from "vue";
import { defineStore } from "pinia";
import type {
  Address,
  AddressPayload,
  FetchAddressParams,
} from "~/types/address";
import type { PaginationMeta } from "~/types/pagination";
import type { StoreResponse } from "~/types/store-response";
import { apiRequest, apiRequestRaw, toErrorMessage } from "~/utils/api";

const normalizeText = (value: unknown) => {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length ? normalized : null;
};

const normalizeAddress = (value: unknown): Address | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Address;

  if (
    !normalizeText(candidate.id) ||
    !normalizeText(candidate.customer_id) ||
    !normalizeText(candidate.street) ||
    !normalizeText(candidate.city) ||
    !normalizeText(candidate.province)
  ) {
    return null;
  }

  return {
    ...candidate,
    id: candidate.id.trim(),
    customer_id: candidate.customer_id.trim(),
    street: candidate.street.trim(),
    city: candidate.city.trim(),
    province: candidate.province.trim(),
    postal_code: normalizeText(candidate.postal_code),
    country: normalizeText(candidate.country),
    address_line: normalizeText(candidate.address_line),
    created_at:
      typeof candidate.created_at === "string" ? candidate.created_at : "",
    updated_at:
      typeof candidate.updated_at === "string" ? candidate.updated_at : "",
  };
};

const upsertAddress = (list: Address[], nextAddress: Address) => {
  const existingIndex = list.findIndex((item) => item.id === nextAddress.id);

  if (existingIndex === -1) {
    return [nextAddress, ...list];
  }

  return list.map((item) => (item.id === nextAddress.id ? nextAddress : item));
};

export const useCustomerAddressesStore = defineStore(
  "customer-addresses",
  () => {
    const addresses = ref<Address[]>([]);
    const pagination = ref<PaginationMeta>({
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    });
    const query = ref<FetchAddressParams>({
      q: "",
      page: 1,
      limit: 10,
    });
    const isLoading = ref(false);
    const isSaving = ref(false);
    const isDeleting = ref(false);

    const reset = () => {
      addresses.value = [];
      pagination.value = {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      };
    };

    const fetchAddresses = async (
      customerId: string,
      params?: FetchAddressParams,
    ): Promise<StoreResponse<Address[]>> => {
      isLoading.value = true;

      try {
        if (params) {
          query.value = {
            ...query.value,
            ...params,
          };
        }

        const result = await apiRequest<Address[]>(
          `/customers/${customerId}/addresses`,
          {
            query: query.value,
          },
        );

        const nextAddresses = Array.isArray(result.data)
          ? result.data
              .map((entry) => normalizeAddress(entry))
              .filter((entry): entry is Address => Boolean(entry))
          : [];

        const meta = (result.meta ?? {}) as Record<string, number | undefined>;

        addresses.value = nextAddresses;
        pagination.value = {
          page: meta.page ?? 1,
          limit: meta.limit ?? 10,
          total: meta.total ?? result.total ?? nextAddresses.length,
          totalPages: meta.totalPages ?? meta.total_pages ?? 0,
        };
        console.log(result);
        return {
          status: "success",
          message: result.message || "Customer addresses fetched successfully",
          statusMessage: result.statusMessage || "ok",
          data: nextAddresses,
        };
      } catch (error) {
        addresses.value = [];

        return {
          status: "error",
          message:
            toErrorMessage(error) || "Failed to fetch customer addresses",
          statusMessage: "internal server error",
          data: null,
        };
      } finally {
        isLoading.value = false;
      }
    };

    const addAddress = async (
      customerId: string,
      payload: AddressPayload,
    ): Promise<StoreResponse<Address>> => {
      isSaving.value = true;

      try {
        const result = await apiRequest<Address>(
          `/customers/${customerId}/addresses`,
          {
            method: "POST",
            body: payload,
          },
        );

        const nextAddress = normalizeAddress(result.data);

        if (nextAddress) {
          addresses.value = upsertAddress(addresses.value, nextAddress);
        }

        return {
          status: "success",
          message: result.message || "Delivery address created successfully",
          statusMessage: result.statusMessage || "created",
          data: nextAddress,
        };
      } catch (error) {
        return {
          status: "error",
          message: toErrorMessage(error) || "Failed to create delivery address",
          statusMessage: "internal server error",
          data: null,
        };
      } finally {
        isSaving.value = false;
      }
    };

    const updateAddress = async (
      customerId: string,
      addressId: string,
      payload: AddressPayload,
    ): Promise<StoreResponse<Address>> => {
      isSaving.value = true;

      try {
        const result = await apiRequest<Address>(
          `/customers/${customerId}/addresses/${addressId}`,
          {
            method: "PATCH",
            body: payload,
          },
        );

        const nextAddress = normalizeAddress(result.data);

        if (nextAddress) {
          addresses.value = upsertAddress(addresses.value, nextAddress);
        }

        return {
          status: "success",
          message: result.message || "Delivery address updated successfully",
          statusMessage: result.statusMessage || "accepted",
          data: nextAddress,
        };
      } catch (error) {
        return {
          status: "error",
          message: toErrorMessage(error) || "Failed to update delivery address",
          statusMessage: "internal server error",
          data: null,
        };
      } finally {
        isSaving.value = false;
      }
    };

    const deleteAddress = async (
      customerId: string,
      addressId: string,
    ): Promise<StoreResponse<null>> => {
      isDeleting.value = true;

      try {
        const { data, ok } = await apiRequestRaw<null>(
          `/customers/${customerId}/addresses/${addressId}`,
          {
            method: "DELETE",
          },
        );

        if (!ok || (data && data.status === "error")) {
          throw new Error(data?.message || "Failed to delete delivery address");
        }

        addresses.value = addresses.value.filter(
          (item) => item.id !== addressId,
        );

        return {
          status: "success",
          message: data?.message || "Delivery address deleted successfully",
          statusMessage: data?.statusMessage || "no content",
          data: null,
        };
      } catch (error) {
        return {
          status: "error",
          message: toErrorMessage(error) || "Failed to delete delivery address",
          statusMessage: "internal server error",
          data: null,
        };
      } finally {
        isDeleting.value = false;
      }
    };

    return {
      addresses,
      pagination,
      query,
      isLoading,
      isSaving,
      isDeleting,
      reset,
      fetchAddresses,
      addAddress,
      updateAddress,
      deleteAddress,
    };
  },
);
