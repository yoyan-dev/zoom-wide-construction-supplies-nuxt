import { computed, ref } from "vue";
import { defineStore } from "pinia";
import type { StoreResponse } from "~/types/store-response";
import type {
  AuthSession,
  AuthenticatedUser,
  LoginPayload,
  RegisterPayload,
} from "~/types/auth";
import type { Customer } from "~/types/customer";
import type { UserRole } from "~/types/user";
import {
  apiRequest,
  AUTH_SESSION_COOKIE_KEY,
  refreshAuthSession,
  toErrorMessage,
} from "~/utils/api";

const DEFAULT_AUTH_REDIRECT = "/shop";

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
  const role = normalizeText(candidate.role) as UserRole | null;

  if (!id || !email || !role) {
    return null;
  }

  return {
    ...candidate,
    id,
    email,
    role,
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
    !normalizeText(candidate.email) ||
    !normalizeText(candidate.company_name) ||
    !normalizeText(candidate.contact_name)
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

const normalizeSession = (value: unknown): AuthSession | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<AuthSession>;
  const user = normalizeUser(candidate.user);

  if (!user) {
    return null;
  }

  return {
    ...candidate,
    user,
    customer: normalizeCustomer(candidate.customer),
    token: normalizeText(candidate.token),
    access_token: normalizeText(candidate.access_token),
    refresh_token: normalizeText(candidate.refresh_token),
  };
};

const getRoleLandingPath = (role?: UserRole | null) => {
  switch (role) {
    case "admin":
    case "manager":
      return "/admin/dashboard";
    case "staff":
      return "/staff";
    case "customer":
      return "/shop";
    default:
      return DEFAULT_AUTH_REDIRECT;
  }
};

export const useAuthStore = defineStore("auth", () => {
  const sessionCookie = useCookie<AuthSession | null>(AUTH_SESSION_COOKIE_KEY, {
    default: () => null,
    sameSite: "lax",
    watch: true,
  });

  const isLoading = ref(false);
  const session = computed(() => normalizeSession(sessionCookie.value));
  const user = computed(() => session.value?.user ?? null);
  const customer = computed(() => session.value?.customer ?? null);
  const token = computed(
    () => session.value?.access_token ?? session.value?.token ?? null,
  );
  const isAuthenticated = computed(() => Boolean(user.value?.id));
  const role = computed(() => user.value?.role ?? null);
  const displayName = computed(
    () =>
      customer.value?.contact_name ??
      user.value?.full_name ??
      user.value?.contact_name ??
      user.value?.email ??
      "Account",
  );

  const setSession = (value: AuthSession | null) => {
    sessionCookie.value = value ? normalizeSession(value) : null;
  };

  const clearSession = () => {
    sessionCookie.value = null;
  };

  const hasAnyRole = (roles: UserRole[]) =>
    !!role.value && roles.includes(role.value);

  const resolveRedirectPath = (redirect?: string | null) => {
    const fallback = getRoleLandingPath(role.value);

    if (!redirect || !redirect.startsWith("/") || redirect.startsWith("//")) {
      return fallback;
    }

    if (redirect === "/" || redirect.startsWith("/auth")) {
      return fallback;
    }

    return redirect;
  };

  const login = async (
    payload: LoginPayload,
  ): Promise<StoreResponse<AuthSession>> => {
    isLoading.value = true;

    try {
      const response = await apiRequest<AuthSession>("/auth/login", {
        method: "POST",
        body: payload,
      });
      const nextSession = normalizeSession(response.data);

      if (!nextSession) {
        throw new Error(
          "Login succeeded, but the session payload was invalid.",
        );
      }

      setSession(nextSession);

      return {
        status: "success",
        message: response.message || "Signed in successfully.",
        statusMessage: response.statusMessage,
        data: nextSession,
      };
    } catch (error) {
      clearSession();

      return {
        status: "error",
        message: toErrorMessage(error) || "Unable to sign in.",
        statusMessage: "unauthorized",
        data: null,
      };
    } finally {
      isLoading.value = false;
    }
  };

  const register = async (
    payload: RegisterPayload,
  ): Promise<StoreResponse<null>> => {
    isLoading.value = true;

    try {
      const response = await apiRequest<null>("/auth/register", {
        method: "POST",
        body: payload,
      });

      return {
        status: "success",
        message: response.message || "Account created successfully.",
        statusMessage: response.statusMessage,
        data: null,
      };
    } catch (error) {
      return {
        status: "error",
        message: toErrorMessage(error) || "Unable to create your account.",
        statusMessage: "unprocessable entity",
        data: null,
      };
    } finally {
      isLoading.value = false;
    }
  };

  const logout = () => {
    clearSession();
  };

  const refreshSession = async (): Promise<StoreResponse<AuthSession>> => {
    isLoading.value = true;

    try {
      const nextSession = await refreshAuthSession();

      if (!nextSession) {
        clearSession();

        return {
          status: "error",
          message: "Your session could not be refreshed.",
          statusMessage: "unauthorized",
          data: null,
        };
      }

      setSession(nextSession);

      return {
        status: "success",
        message: "Session refreshed successfully.",
        statusMessage: "ok",
        data: nextSession,
      };
    } catch (error) {
      clearSession();

      return {
        status: "error",
        message: toErrorMessage(error) || "Your session could not be refreshed.",
        statusMessage: "unauthorized",
        data: null,
      };
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    session,
    user,
    customer,
    token,
    role,
    isAuthenticated,
    displayName,
    setSession,
    clearSession,
    login,
    register,
    refreshSession,
    logout,
    hasAnyRole,
    getRoleLandingPath: () => getRoleLandingPath(role.value),
    resolveRedirectPath,
  };
});
