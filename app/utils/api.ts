import type { H3Response } from "~/types/h3Response";
import type { AuthSession } from "~/types/auth";

type ApiQueryValue = string | number | boolean | null | undefined;
type ApiQuery = Record<string, ApiQueryValue>;
type ApiBody = BodyInit | Record<string, any> | null;

type ApiRequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  query?: ApiQuery;
  body?: ApiBody;
  headers?: HeadersInit;
};

type NormalizedApiError = {
  message: string;
  status: number | null;
  statusMessage: string | null;
  code: string | null;
  details?: unknown;
};

export class ApiRequestError extends Error {
  readonly status: number | null;
  readonly statusMessage: string | null;
  readonly code: string | null;
  readonly details?: unknown;

  constructor(payload: NormalizedApiError) {
    super(payload.message);
    this.name = "ApiRequestError";
    this.status = payload.status;
    this.statusMessage = payload.statusMessage;
    this.code = payload.code;
    this.details = payload.details;
  }
}

export const DEFAULT_API_PAGE_LIMIT = 10;
export const AUTH_SESSION_COOKIE_KEY = "zoom_auth_session";
export const AUTH_SESSION_STATE_KEY = "zoom_auth_session_state";

const API_BASE_URL = (
  (
    import.meta as ImportMeta & {
      env?: { VITE_API_URL?: string };
    }
  ).env?.VITE_API_URL ?? "/api"
).replace(/\/$/, "");

export const buildOkResponse = <T>(
  data: T,
  total?: number,
  message?: string,
  statusCode: H3Response<T>["statusCode"] = 200,
  statusMessage: H3Response<T>["statusMessage"] = "ok",
): H3Response<T> => ({
  status: "ok",
  statusCode,
  statusMessage,
  message,
  data,
  total,
});

export const buildErrorResponse = <T>(error: unknown): H3Response<T> => {
  const resolvedError = toError(error);

  return {
    status: "error",
    statusCode: 500,
    statusMessage: "internal server error",
    data: null,
    message: resolvedError.message,
    error: {
      code: "internal_error",
      message: resolvedError.message,
    },
  };
};

export const toError = (error: unknown) =>
  error instanceof Error ? error : new Error(String(error ?? "Unknown error"));

export const toErrorMessage = (error: unknown) => toError(error).message;

const normalizeResponseText = (value?: string | null) => {
  const text = value?.trim();
  return text ? text : undefined;
};

export const isH3ResponseSuccess = <T>(response?: H3Response<T> | null) =>
  !!response &&
  response.status !== "error" &&
  (response.statusCode === undefined || response.statusCode < 400);

export const formatH3StatusMessage = (statusMessage?: string) =>
  normalizeResponseText(statusMessage?.replace(/_/g, " "))?.replace(
    /\b\w/g,
    (char) => char.toUpperCase(),
  );

export const getH3ResponseToastTitle = <T>(
  response?: H3Response<T> | null,
  fallback?: string,
) => {
  if (!response) {
    return fallback ?? "Request completed";
  }

  return (
    normalizeResponseText(response.message) ??
    formatH3StatusMessage(response.statusMessage) ??
    fallback ??
    (isH3ResponseSuccess(response) ? "Request completed" : "Request failed")
  );
};

export const getH3ResponseToastDescription = <T>(
  response?: H3Response<T> | null,
  title?: string,
) => {
  if (!response) return undefined;

  const message = normalizeResponseText(response.message);
  const statusLabel = formatH3StatusMessage(response.statusMessage);

  if (message && message !== title && statusLabel && statusLabel !== title) {
    return statusLabel;
  }

  if (message && message !== title) {
    return message;
  }

  if (statusLabel && statusLabel !== title) {
    return statusLabel;
  }

  return undefined;
};

export const getTotalPages = (total: number, limit: number) => {
  if (!limit) return 0;
  return Math.ceil(total / limit);
};

export const cleanQuery = (query?: ApiQuery) =>
  Object.fromEntries(
    Object.entries(query ?? {}).filter(([, value]) => {
      if (value === undefined || value === null) return false;
      if (typeof value === "string") return value.trim().length > 0;
      return true;
    }),
  );

const buildApiUrl = (path: string) =>
  `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

const resolveAccessToken = (payload?: AuthSession | null) =>
  normalizeResponseText(payload?.access_token) ??
  normalizeResponseText(payload?.token) ??
  normalizeResponseText(payload?.session?.access_token) ??
  null;

const resolveRefreshToken = (payload?: AuthSession | null) =>
  normalizeResponseText(payload?.refresh_token) ??
  normalizeResponseText(payload?.session?.refresh_token) ??
  null;

const resolveSessionPayload = (value?: AuthSession["session"] | null) =>
  value && typeof value === "object" ? value : {};

const normalizeApiError = <T>(
  response?: H3Response<T> | null,
  fallbackMessage = "Request failed",
): NormalizedApiError => ({
  message:
    normalizeResponseText(response?.message) ??
    normalizeResponseText(response?.error?.message) ??
    formatH3StatusMessage(response?.statusMessage) ??
    fallbackMessage,
  status: typeof response?.statusCode === "number" ? response.statusCode : null,
  statusMessage: normalizeResponseText(response?.statusMessage) ?? null,
  code: normalizeResponseText(response?.error?.code) ?? null,
  details: response?.error?.details,
});

export const useAuthSessionCookie = () =>
  useCookie<AuthSession | null>(AUTH_SESSION_COOKIE_KEY, {
    default: () => null,
    sameSite: "lax",
    watch: true,
  });

export const useAuthSessionState = () =>
  useState<AuthSession | null>(AUTH_SESSION_STATE_KEY, () => null);

export const readAuthSession = () => {
  const sessionCookie = useAuthSessionCookie();
  const sessionState = useAuthSessionState();

  if (!sessionState.value && sessionCookie.value) {
    sessionState.value = sessionCookie.value;
  }

  return sessionState.value ?? sessionCookie.value;
};

export const writeAuthSession = (value: AuthSession | null) => {
  const sessionCookie = useAuthSessionCookie();
  const sessionState = useAuthSessionState();

  sessionState.value = value;
  sessionCookie.value = value;
};

const mergeAuthSession = (
  currentSession: AuthSession,
  nextValue?: Partial<AuthSession> | null,
): AuthSession => {
  const candidate = nextValue && typeof nextValue === "object" ? nextValue : {};
  const currentSessionPayload = resolveSessionPayload(currentSession.session);
  const nextSessionPayload = resolveSessionPayload(candidate.session);
  const nextAccessToken =
    normalizeResponseText(candidate.access_token) ??
    normalizeResponseText(candidate.token) ??
    normalizeResponseText(nextSessionPayload.access_token) ??
    resolveAccessToken(currentSession);
  const nextRefreshToken =
    normalizeResponseText(candidate.refresh_token) ??
    normalizeResponseText(nextSessionPayload.refresh_token) ??
    resolveRefreshToken(currentSession) ??
    null;

  return {
    ...currentSession,
    ...candidate,
    user: candidate.user ?? currentSession.user,
    customer:
      candidate.customer === undefined
        ? currentSession.customer
        : candidate.customer,
    session: {
      ...currentSessionPayload,
      ...nextSessionPayload,
      access_token: nextAccessToken,
      refresh_token: nextRefreshToken,
    },
    token: nextAccessToken,
    access_token: nextAccessToken,
    refresh_token: nextRefreshToken,
  };
};

const resolveRequestHeaders = (
  headers?: HeadersInit,
  accessToken?: string | null,
) => {
  const resolvedHeaders = new Headers(headers ?? {});
  const token = accessToken ?? resolveAccessToken(readAuthSession());

  if (token && !resolvedHeaders.has("Authorization")) {
    resolvedHeaders.set("Authorization", `Bearer ${token}`);
  }

  return resolvedHeaders;
};

const executeRawRequest = <T>(
  path: string,
  options: ApiRequestOptions = {},
  accessToken?: string | null,
) =>
  $fetch.raw<H3Response<T>>(buildApiUrl(path), {
    method: options.method,
    query: cleanQuery(options.query),
    body: options.body,
    headers: resolveRequestHeaders(options.headers, accessToken),
    ignoreResponseError: true,
  });

export async function refreshAuthSession() {
  const currentSession = readAuthSession();
  const refreshToken = resolveRefreshToken(currentSession);

  if (!currentSession) {
    return null;
  }

  if (!refreshToken) {
    return null;
  }

  try {
    const response = await $fetch.raw<H3Response<Partial<AuthSession>>>(
      buildApiUrl("/auth/refresh"),
      {
        method: "POST",
        body: { refresh_token: refreshToken },
        ignoreResponseError: true,
      },
    );

    const payload = response._data;
    if (
      response.status >= 400 ||
      !payload ||
      payload.status === "error" ||
      !payload.data
    ) {
      writeAuthSession(null);
      return null;
    }

    const nextSession = mergeAuthSession(currentSession, payload?.data ?? null);

    if (!resolveAccessToken(nextSession)) {
      writeAuthSession(null);
      return null;
    }

    writeAuthSession(nextSession);
    return nextSession;
  } catch {
    writeAuthSession(null);
    return null;
  }
}

export async function apiRequestRaw<T>(
  path: string,
  options: ApiRequestOptions = {},
) {
  let response;

  try {
    response = await executeRawRequest<T>(path, options);
  } catch (error) {
    throw new ApiRequestError({
      message: toErrorMessage(error) || "Network request failed.",
      status: null,
      statusMessage: null,
      code: "network_error",
    });
  }

  const hasRefreshToken = Boolean(resolveRefreshToken(readAuthSession()));

  const canAttemptRefresh =
    response.status === 401 &&
    !path.startsWith("/auth") &&
    !new Headers(options.headers ?? {}).has("Authorization") &&
    hasRefreshToken;

  if (canAttemptRefresh) {
    const refreshedSession = await refreshAuthSession();
    const refreshedToken = resolveAccessToken(refreshedSession);

    if (refreshedToken) {
      let retriedResponse;

      try {
        retriedResponse = await executeRawRequest<T>(
          path,
          options,
          refreshedToken,
        );
      } catch (error) {
        throw new ApiRequestError({
          message: toErrorMessage(error) || "Network request failed.",
          status: null,
          statusMessage: null,
          code: "network_error",
        });
      }

      return {
        ok: retriedResponse.status >= 200 && retriedResponse.status < 300,
        status: retriedResponse.status,
        data:
          retriedResponse.status === 204
            ? null
            : ((retriedResponse._data ?? null) as H3Response<T> | null),
      };
    }
  }

  return {
    ok: response.status >= 200 && response.status < 300,
    status: response.status,
    data:
      response.status === 204
        ? null
        : ((response._data ?? null) as H3Response<T> | null),
  };
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<H3Response<T>> {
  const response = await apiRequestRaw<T>(path, options);
  const responsePayload = response.data;

  if (
    !response.ok ||
    !responsePayload ||
    responsePayload.status === "error" ||
    (typeof responsePayload.statusCode === "number" &&
      responsePayload.statusCode >= 400)
  ) {
    const normalized = normalizeApiError(responsePayload, "Request failed");

    throw new ApiRequestError({
      ...normalized,
      status: normalized.status ?? response.status,
    });
  }

  return responsePayload;
}
