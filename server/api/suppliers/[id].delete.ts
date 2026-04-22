import type { H3Response } from "~/types/h3Response";

export default defineEventHandler(
  async (event): Promise<H3Response<null>> =>
    proxyAdminBackendRequest<null>(
      event,
      `/suppliers/${getRouterParam(event, "id")}`,
      {
        method: "DELETE",
        fallbackMessage: "Unable to delete supplier.",
        serviceUnavailableMessage: "Supplier service is unavailable.",
      },
    ),
);
