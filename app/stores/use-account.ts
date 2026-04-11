import { ref } from "vue";
import { defineStore } from "pinia";
import type {
  AccountProfile,
  ChangePasswordPayload,
  UpdateAccountPayload,
} from "~/types/account";
import type { AuthenticatedUser } from "~/types/auth";
import type { Customer } from "~/types/customer";
import type { Driver } from "~/types/driver";
import type { StoreResponse } from "~/types/store-response";
import { apiRequest, toErrorMessage } from "~/utils/api";

const normalizeText = (value: unknown) => {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length ? normalized : null;
};

const normalizeUser = (value: unknown): AuthenticatedUser | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<AuthenticatedUser>;
  const id = normalizeText(candidate.id);
  const email = normalizeText(candidate.email);
  const role = normalizeText(candidate.role);

  if (!id || !email || !role) {
    return null;
  }

  return {
    ...candidate,
    id,
    email,
    role: role as AuthenticatedUser["role"],
    full_name: normalizeText(candidate.full_name),
    contact_name: normalizeText(candidate.contact_name),
    phone: normalizeText(candidate.phone),
    image_url: normalizeText(candidate.image_url),
  };
};

const normalizeCustomer = (value: unknown): Customer | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Customer;

  if (
    !normalizeText(candidate.id) ||
    !normalizeText(candidate.company_name) ||
    !normalizeText(candidate.contact_name) ||
    !normalizeText(candidate.email)
  ) {
    return null;
  }

  return {
    ...candidate,
    id: candidate.id.trim(),
    user_id: normalizeText(candidate.user_id),
    company_name: candidate.company_name.trim(),
    contact_name: candidate.contact_name.trim(),
    phone: normalizeText(candidate.phone),
    email: candidate.email.trim(),
    billing_address: normalizeText(candidate.billing_address),
    shipping_address: normalizeText(candidate.shipping_address),
  };
};

const normalizeDriver = (value: unknown): Driver | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Driver;

  if (!normalizeText(candidate.id) || !normalizeText(candidate.name)) {
    return null;
  }

  return {
    ...candidate,
    id: candidate.id.trim(),
    name: candidate.name.trim(),
    phone: normalizeText(candidate.phone),
    email: normalizeText(candidate.email),
    license_number: normalizeText(candidate.license_number),
    vehicle_number: normalizeText(candidate.vehicle_number),
  };
};

const normalizeAccountProfile = (value: unknown): AccountProfile | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as AccountProfile;
  const user = normalizeUser(candidate.user);

  if (!user) {
    return null;
  }

  return {
    ...candidate,
    user,
    customer: normalizeCustomer(candidate.customer),
    driver: normalizeDriver(candidate.driver),
  };
};

export const useAccountStore = defineStore("account", () => {
  const authStore = useAuthStore();
  const account = ref<AccountProfile | null>(null);
  const isLoading = ref(false);
  const isSaving = ref(false);
  const isChangingPassword = ref(false);

  const syncAuthSession = (nextAccount: AccountProfile) => {
    if (!authStore.session) {
      return;
    }

    authStore.setSession({
      ...authStore.session,
      user: nextAccount.user,
      customer:
        nextAccount.customer === undefined
          ? authStore.customer
          : nextAccount.customer,
    });
  };

  const fetchAccount = async (): Promise<StoreResponse<AccountProfile>> => {
    isLoading.value = true;

    try {
      const response = await apiRequest<AccountProfile>("/account");
      const nextAccount = normalizeAccountProfile(response.data);

      if (!nextAccount) {
        throw new Error(
          "Account loaded, but the profile payload was invalid.",
        );
      }

      account.value = nextAccount;
      syncAuthSession(nextAccount);

      return {
        status: "success",
        message: response.message || "Account loaded successfully.",
        statusMessage: response.statusMessage,
        data: nextAccount,
      };
    } catch (error) {
      account.value = null;

      return {
        status: "error",
        message: toErrorMessage(error) || "Your account could not be loaded.",
        statusMessage: "internal server error",
        data: null,
      };
    } finally {
      isLoading.value = false;
    }
  };

  const updateAccount = async (
    payload: UpdateAccountPayload | FormData,
  ): Promise<StoreResponse<AccountProfile>> => {
    isSaving.value = true;

    try {
      const response = await apiRequest<AccountProfile>("/account", {
        method: "PATCH",
        body: payload,
      });
      const nextAccount = normalizeAccountProfile(response.data);

      if (!nextAccount) {
        throw new Error(
          "Account updated, but the profile payload was invalid.",
        );
      }

      account.value = nextAccount;
      syncAuthSession(nextAccount);

      return {
        status: "success",
        message: response.message || "Account updated successfully.",
        statusMessage: response.statusMessage,
        data: nextAccount,
      };
    } catch (error) {
      return {
        status: "error",
        message:
          toErrorMessage(error) || "Your account could not be updated.",
        statusMessage: "unprocessable entity",
        data: null,
      };
    } finally {
      isSaving.value = false;
    }
  };

  const changePassword = async (
    payload: ChangePasswordPayload,
  ): Promise<StoreResponse<null>> => {
    isChangingPassword.value = true;

    try {
      const response = await apiRequest<null>("/account/change-password", {
        method: "POST",
        body: payload,
      });

      return {
        status: "success",
        message: response.message || "Your password has been updated.",
        statusMessage: response.statusMessage,
        data: null,
      };
    } catch (error) {
      return {
        status: "error",
        message:
          toErrorMessage(error) || "Your password could not be updated.",
        statusMessage: "unprocessable entity",
        data: null,
      };
    } finally {
      isChangingPassword.value = false;
    }
  };

  return {
    account,
    isLoading,
    isSaving,
    isChangingPassword,
    fetchAccount,
    updateAccount,
    changePassword,
  };
});
