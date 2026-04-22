import type { H3Event } from "h3";
import { setResponseStatus } from "h3";
import type { AuthSession } from "~/types/auth";
import type { H3Response, StatusMessage } from "~/types/h3Response";

type BackendMethod = "GET" | "POST" | "PATCH" | "DELETE";

type BackendRequestOptions = {
  method?: BackendMethod;
  query?: Record<string, string | number | boolean | null | undefined>;
  body?: BodyInit | Record<string, unknown> | null;
  headers?: HeadersInit;
};

export type NuxtAuthSession = AuthSession & {
  secure?: {
    refresh_token?: string | null;
    [key: string]: unknown;
  };
};

const AUTH_SESSION_MAX_AGE = 60 * 60 * 24 * 30;
const API_BASE_URL = (process.env.VITE_API_URL ?? "/api").replace(/\/$/, "");

const buildBackendApiUrl = (path: string) =>
  `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

const normalizeText = (value: unknown) => {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length ? normalized : null;
};

export const resolveBackendAccessToken = (payload?: AuthSession | null) =>
  normalizeText(payload?.access_token) ??
  normalizeText(payload?.token) ??
  normalizeText(payload?.session?.access_token) ??
  null;

export const resolveBackendRefreshToken = (
  payload?: NuxtAuthSession | null,
) =>
  normalizeText(payload?.refresh_token) ??
  normalizeText(payload?.session?.refresh_token) ??
  normalizeText(payload?.secure?.refresh_token) ??
  null;

const resolveSessionPayload = (value?: AuthSession["session"] | null) =>
  value && typeof value === "object" ? value : {};

export const mergeBackendAuthSession = (
  currentSession: AuthSession,
  nextValue?: Partial<AuthSession> | null,
): AuthSession => {
  const candidate = nextValue && typeof nextValue === "object" ? nextValue : {};
  const currentSessionPayload = resolveSessionPayload(currentSession.session);
  const nextSessionPayload = resolveSessionPayload(candidate.session);
  const nextAccessToken =
    normalizeText(candidate.access_token) ??
    normalizeText(candidate.token) ??
    normalizeText(nextSessionPayload.access_token) ??
    resolveBackendAccessToken(currentSession);
  const nextRefreshToken =
    normalizeText(candidate.refresh_token) ??
    normalizeText(nextSessionPayload.refresh_token) ??
    resolveBackendRefreshToken(currentSession as NuxtAuthSession) ??
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
    },
    token: nextAccessToken,
    access_token: nextAccessToken,
    refresh_token: nextRefreshToken,
  };
};

export const toPublicAuthSession = (
  value?: NuxtAuthSession | null,
): AuthSession | null => {
  if (!value?.user) {
    return null;
  }

  const { secure: _secure, ...publicValue } = value;
  const accessToken = resolveBackendAccessToken(value);

  return {
    ...publicValue,
    token: accessToken,
    access_token: accessToken,
    refresh_token: null,
    session: value.session
      ? {
          ...value.session,
          access_token: accessToken,
          refresh_token: null,
        }
      : undefined,
  };
};

export const setBackendUserSession = async (
  event: H3Event,
  session: AuthSession,
) => {
  const publicSession = toPublicAuthSession(session);
  const refreshToken = resolveBackendRefreshToken(session as NuxtAuthSession);

  if (!publicSession) {
    return null;
  }

  await setUserSession(
    event,
    {
      ...publicSession,
      secure: {
        refresh_token: refreshToken,
      },
    },
    {
      maxAge: AUTH_SESSION_MAX_AGE,
    },
  );

  return publicSession;
};

const fallbackStatusMessage = (status: number): StatusMessage => {
  switch (status) {
    case 400:
      return "bad request";
    case 401:
      return "unauthorized";
    case 403:
      return "forbidden";
    case 404:
      return "not found";
    case 422:
      return "unprocessable entity";
    case 503:
      return "service unavailable";
    default:
      return status >= 500 ? "internal server error" : "ok";
  }
};

const toSupportedStatusCode = (
  statusCode: number,
): H3Response<unknown>["statusCode"] =>
  (
    [200, 201, 204, 400, 401, 403, 404, 405, 409, 422, 500, 501, 503] as const
  ).includes(statusCode as H3Response<unknown>["statusCode"])
    ? (statusCode as H3Response<unknown>["statusCode"])
    : 500;

export const buildBackendErrorResponse = <T>(
  statusCode: H3Response<T>["statusCode"],
  message: string,
): H3Response<T> => ({
  status: "error",
  statusCode,
  statusMessage: fallbackStatusMessage(statusCode),
  data: null,
  message,
  error: {
    code: fallbackStatusMessage(statusCode).replace(/\s/g, "_"),
    message,
  },
});

export const backendRequestRaw = <T>(
  path: string,
  options: BackendRequestOptions = {},
) =>
  $fetch.raw<H3Response<T>>(buildBackendApiUrl(path), {
    method: options.method,
    query: Object.fromEntries(
      Object.entries(options.query ?? {}).filter(([, value]) => {
        if (value === undefined || value === null) return false;
        if (typeof value === "string") return value.trim().length > 0;
        return true;
      }),
    ),
    body: options.body,
    headers: options.headers,
    ignoreResponseError: true,
  });

export const proxyBackendError = <T>(
  event: H3Event,
  statusCode: number,
  payload?: H3Response<T> | null,
  fallbackMessage = "Request failed",
): H3Response<T> => {
  setResponseStatus(event, statusCode);

  if (payload) {
    return payload;
  }

  return buildBackendErrorResponse(
    toSupportedStatusCode(statusCode) as H3Response<T>["statusCode"],
    fallbackMessage,
  );
};
