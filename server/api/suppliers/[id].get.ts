import type { Supplier } from "~/types/supplier";
import type { H3Response } from "~/types/h3Response";

export default defineEventHandler(
  async (event): Promise<H3Response<Supplier>> =>
    proxyAdminBackendRequest<Supplier>(
      event,
      `/suppliers/${getRouterParam(event, "id")}`,
      {
        method: "GET",
        fallbackMessage: "Unable to fetch supplier.",
        serviceUnavailableMessage: "Supplier service is unavailable.",
      },
    ),
);
