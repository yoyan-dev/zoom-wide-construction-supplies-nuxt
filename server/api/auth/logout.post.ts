import type { H3Response } from "~/types/h3Response";

export default defineEventHandler(async (event): Promise<H3Response<null>> => {
  const currentSession = await getUserSession(event);
  const refreshToken = resolveBackendRefreshToken(currentSession);

  try {
    if (refreshToken) {
      await backendRequestRaw<null>("/auth/logout", {
        method: "POST",
        body: {
          refresh_token: refreshToken,
        },
      });
    }
  } finally {
    await clearUserSession(event);
  }

  return {
    status: "ok",
    statusCode: 200,
    statusMessage: "ok",
    message: "Signed out successfully.",
    data: null,
  };
});
