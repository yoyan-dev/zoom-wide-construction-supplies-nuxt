import type { CreateSupplierPayload, Supplier } from "~/types/supplier";
import type { H3Response } from "~/types/h3Response";

export default defineEventHandler(
  async (event): Promise<H3Response<Supplier>> =>
    proxyAdminBackendRequest<Supplier>(event, "/suppliers", {
      method: "POST",
      body: await readBody<CreateSupplierPayload>(event),
      fallbackMessage: "Unable to create supplier.",
      serviceUnavailableMessage: "Supplier service is unavailable.",
    }),
);
