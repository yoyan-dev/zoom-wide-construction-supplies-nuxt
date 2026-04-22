import type { H3Response } from "~/types/h3Response";
import type { Supplier, UpdateSupplierPayload } from "~/types/supplier";

export default defineEventHandler(
  async (event): Promise<H3Response<Supplier>> =>
    proxyAdminBackendRequest<Supplier>(
      event,
      `/suppliers/${getRouterParam(event, "id")}`,
      {
        method: "PATCH",
        body: await readBody<UpdateSupplierPayload>(event),
        fallbackMessage: "Unable to update supplier.",
        serviceUnavailableMessage: "Supplier service is unavailable.",
      },
    ),
);
