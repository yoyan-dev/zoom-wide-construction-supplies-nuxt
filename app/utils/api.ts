import type { H3Response } from "~/types/h3Response";

type ApiQueryValue = string | number | boolean | null | undefined;
type ApiQuery = Record<string, ApiQueryValue>;
type ApiBody = BodyInit | Record<string, any> | null;

type ApiRequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  query?: ApiQuery;
  body?: ApiBody;
  headers?: HeadersInit;
};

export const DEFAULT_API_PAGE_LIMIT = 10;
export const AUTH_SESSION_COOKIE_KEY = "zoom_auth_session";

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

const resolveRequestHeaders = (headers?: HeadersInit) => {
  const resolvedHeaders = new Headers(headers ?? {});
  const authSession = useCookie<{
    session: {
      access_token?: string | null;
    };
  } | null>(AUTH_SESSION_COOKIE_KEY);
  const token = authSession.value?.session.access_token;

  if (token && !resolvedHeaders.has("Authorization")) {
    resolvedHeaders.set("Authorization", `Bearer ${token}`);
  }

  return resolvedHeaders;
};

export async function apiRequestRaw<T>(
  path: string,
  options: ApiRequestOptions = {},
) {
  const response = await $fetch.raw<H3Response<T>>(buildApiUrl(path), {
    method: options.method,
    query: cleanQuery(options.query),
    body: options.body,
    headers: resolveRequestHeaders(options.headers),
    ignoreResponseError: true,
  });

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
    throw new Error(
      responsePayload?.message ||
        responsePayload?.statusMessage ||
        "Request failed",
    );
  }

  return responsePayload;
}
