import { setResponseStatus } from "h3";
import type { AuthSession, LoginPayload } from "~/types/auth";
import type { H3Response } from "~/types/h3Response";

export default defineEventHandler(async (event): Promise<H3Response<AuthSession>> => {
  const body = await readBody<LoginPayload>(event);

  try {
    const response = await backendRequestRaw<AuthSession>("/auth/login", {
      method: "POST",
      body,
    });
    const payload = response._data;

    if (response.status >= 400 || !payload || payload.status === "error") {
      return proxyBackendError(
        event,
        response.status,
        payload,
        "Unable to sign in.",
      );
    }

    const publicSession = await setBackendUserSession(event, payload.data);

    if (!publicSession) {
      setResponseStatus(event, 500);
      return buildBackendErrorResponse(
        500,
        "Login succeeded, but the session payload was invalid.",
      );
    }

    return {
      ...payload,
      data: publicSession,
    };
  } catch {
    setResponseStatus(event, 503);
    return buildBackendErrorResponse(503, "Authentication service is unavailable.");
  }
});
