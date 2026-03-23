import type { H3Response } from "~/types/h3Response";

type ApiQueryValue = string | number | boolean | null | undefined;
type ApiQuery = Record<string, ApiQueryValue>;

type ApiRequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  query?: ApiQuery;
  body?: unknown;
};

export const DEFAULT_API_PAGE_LIMIT = 10;

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
  statusCode = 200,
  statusMessage: H3Response<T>["statusMessage"] = "ok",
): H3Response<T> => ({
  status: "success",
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
    message: resolvedError.message,
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

export const formatH3StatusMessage = (
  statusMessage?: H3Response["statusMessage"],
) =>
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

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<H3Response<T>> {
  const response = await $fetch<H3Response<T>>(
    `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`,
    {
      method: options.method,
      query: cleanQuery(options.query),
      body: options.body,
    },
  );

  if (
    response.status === "error" ||
    (typeof response.statusCode === "number" && response.statusCode >= 400)
  ) {
    throw new Error(
      response.message || response.statusMessage || "Request failed",
    );
  }

  return response;
}
