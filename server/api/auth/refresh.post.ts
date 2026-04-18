import { setResponseStatus } from "h3";
import type { AuthSession } from "~/types/auth";
import type { H3Response } from "~/types/h3Response";

export default defineEventHandler(async (event): Promise<H3Response<AuthSession>> => {
  const currentSession = await getUserSession(event);
  const publicCurrentSession = toPublicAuthSession(currentSession as AuthSession);
  const refreshToken = resolveBackendRefreshToken(currentSession as AuthSession);

  if (!publicCurrentSession || !refreshToken) {
    await clearUserSession(event);
    setResponseStatus(event, 401);
    return buildBackendErrorResponse(401, "Your session has expired.");
  }

  try {
    const response = await backendRequestRaw<Partial<AuthSession>>(
      "/auth/refresh",
      {
        method: "POST",
        body: {
          refresh_token: refreshToken,
        },
      },
    );
    const payload = response._data;

    if (
      response.status >= 400 ||
      !payload ||
      payload.status === "error" ||
      !payload.data
    ) {
      if (response.status === 401 || response.status === 403) {
        await clearUserSession(event);
      }

      return proxyBackendError(
        event,
        response.status,
        payload,
        "Your session could not be refreshed.",
      );
    }

    const nextSession = mergeBackendAuthSession(
      publicCurrentSession,
      payload.data,
    );
    const publicSession = await setBackendUserSession(event, nextSession);

    if (!publicSession || !resolveBackendAccessToken(publicSession)) {
      setResponseStatus(event, 500);
      return buildBackendErrorResponse(
        500,
        "Your session could not be refreshed.",
      );
    }

    return {
      status: "ok",
      statusCode: 200,
      statusMessage: "ok",
      message: payload.message || "Session refreshed successfully.",
      data: publicSession,
    };
  } catch {
    setResponseStatus(event, 503);
    return buildBackendErrorResponse(
      503,
      "Authentication service is unavailable.",
    );
  }
});
