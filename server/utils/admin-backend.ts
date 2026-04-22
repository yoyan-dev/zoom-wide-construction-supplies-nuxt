import { setResponseStatus, type H3Event } from "h3";
import type { H3Response } from "~/types/h3Response";

type AdminBackendMethod = "GET" | "POST" | "PATCH" | "DELETE";

type AdminBackendRequestOptions = {
  method?: AdminBackendMethod;
  query?: Record<string, string | number | boolean | null | undefined>;
  body?: BodyInit | Record<string, unknown> | null;
  fallbackMessage?: string;
  serviceUnavailableMessage?: string;
};

const resolveAdminAccessToken = async (event: H3Event) => {
  const session = (await getUserSession(event)) as NuxtAuthSession | null;

  if (!session?.user) {
    setResponseStatus(event, 401);
    return {
      error: buildBackendErrorResponse(401, "Your session has expired."),
      token: null,
    };
  }

  if (session.user.role !== "admin") {
    setResponseStatus(event, 403);
    return {
      error: buildBackendErrorResponse(
        403,
        "Only admins can access this supplier management endpoint.",
      ),
      token: null,
    };
  }

  const accessToken = resolveBackendAccessToken(session);

  if (!accessToken) {
    setResponseStatus(event, 401);
    return {
      error: buildBackendErrorResponse(401, "Your session has expired."),
      token: null,
    };
  }

  return {
    error: null,
    token: accessToken,
  };
};

export const proxyAdminBackendRequest = async <T>(
  event: H3Event,
  path: string,
  options: AdminBackendRequestOptions = {},
): Promise<H3Response<T>> => {
  const access = await resolveAdminAccessToken(event);

  if (access.error || !access.token) {
    return access.error as H3Response<T>;
  }

  try {
    const response = await backendRequestRaw<T>(path, {
      method: options.method,
      query: options.query,
      body: options.body,
      headers: {
        Authorization: `Bearer ${access.token}`,
      },
    });
    const payload = response._data;

    if (response.status >= 400 || !payload || payload.status === "error") {
      return proxyBackendError(
        event,
        response.status,
        payload,
        options.fallbackMessage ?? "Request failed.",
      );
    }

    setResponseStatus(event, response.status);
    return payload;
  } catch {
    setResponseStatus(event, 503);
    return buildBackendErrorResponse(
      503,
      options.serviceUnavailableMessage ?? "The backend service is unavailable.",
    );
  }
};
