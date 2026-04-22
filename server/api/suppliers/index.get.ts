import type { Supplier } from "~/types/supplier";
import type { H3Response } from "~/types/h3Response";

export default defineEventHandler(
  async (event): Promise<H3Response<Supplier[]>> =>
    proxyAdminBackendRequest<Supplier[]>(event, "/suppliers", {
      method: "GET",
      query: getQuery(event),
      fallbackMessage: "Unable to fetch suppliers.",
      serviceUnavailableMessage: "Supplier service is unavailable.",
    }),
);
