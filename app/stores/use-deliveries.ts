import { defineStore } from "pinia";
import { ref } from "vue";
import type {
  Delivery,
  DeliveryPagination,
  FetchDeliveryParams,
} from "~/types/delivery";
import type { H3Response } from "~/types/h3Response";
import { deliveries as seedDeliveries } from "~/seeds/deliveries";
import { downloadText, printText } from "~/utils/documents";
import { useInventoryStore } from "./use-inventory";
import { useOrderStore } from "./use-orders";
import { useProductStore } from "./use-products";

type DeliveryActivity = {
  action: string;
  at: string;
  detail?: string;
};

type DeliveryMeta = {
  warehouse_staff?: string;
  route?: string;
  location?: string;
};

const buildOkResponse = <T>(data: T, total?: number): H3Response<T> => ({
  status: "ok",
  statusCode: 200,
  statusMessage: "ok",
  data,
  total,
});

const buildErrorResponse = <T>(err: unknown): H3Response<T> => ({
  status: "error",
  statusCode: 500,
  statusMessage: "internal server error",
  message: err instanceof Error ? err.message : "Unknown error",
});

export const useDeliveryStore = defineStore("deliveries", () => {
  const error = ref<Error | null>(null);
  const delivery = ref<Delivery | null>(null);
  const isLoading = ref(false);
  const inventoryStore = useInventoryStore();
  const orderStore = useOrderStore();
  const productStore = useProductStore();

  const allDeliveries = ref<Delivery[]>([...seedDeliveries]);
  const deliveries = ref<Delivery[]>([]);
  const deliveryActivity = ref<Record<string, DeliveryActivity[]>>({});
  const deliveryMeta = ref<Record<string, DeliveryMeta>>({});

  const query = ref<FetchDeliveryParams>({
    q: "",
    status: "",
    order_id: "",
    driver_id: "",
    page: 1,
  });

  const pagination = ref<DeliveryPagination>({
    page: 1,
    limit: seedDeliveries.length,
    total: 0,
    total_pages: 0,
  });

  const fetchDeliveries = async (): Promise<H3Response<Delivery[]>> => {
    try {
      isLoading.value = true;

      let filtered = [...allDeliveries.value];

      if (query.value.q) {
        const q = query.value.q.toLowerCase();
        filtered = filtered.filter((d) => {
          const driver = d.driver_id ?? "";
          const vehicle = d.vehicle_number ?? "";
          return (
            d.id.toLowerCase().includes(q) ||
            d.order_id.toLowerCase().includes(q) ||
            driver.toLowerCase().includes(q) ||
            vehicle.toLowerCase().includes(q)
          );
        });
      }

      if (query.value.status) {
        filtered = filtered.filter((d) => d.status === query.value.status);
      }

      if (query.value.order_id) {
        filtered = filtered.filter((d) => d.order_id === query.value.order_id);
      }

      if (query.value.driver_id) {
        filtered = filtered.filter((d) => d.driver_id === query.value.driver_id);
      }

      const start = (query.value.page! - 1) * pagination.value.limit!;
      const end = start + pagination.value.limit!;

      pagination.value.total = filtered.length;
      pagination.value.total_pages = Math.ceil(
        filtered.length / pagination.value.limit!,
      );
      pagination.value.page = query.value.page;

      deliveries.value = filtered.slice(start, end);
      return buildOkResponse(deliveries.value, pagination.value.total);
    } catch (err: any) {
      error.value = err;
      return buildErrorResponse<Delivery[]>(err);
    } finally {
      isLoading.value = false;
    }
  };

  const fetchDeliveryById = async (
    id: string,
  ): Promise<H3Response<Delivery | null>> => {
    try {
      const found = allDeliveries.value.find((d) => d.id === id);

      if (!found) {
        delivery.value = null;
        return buildOkResponse(null, 0);
      }

      delivery.value = found;
      return buildOkResponse(delivery.value, 1);
    } catch (err: any) {
      error.value = err;
      return buildErrorResponse<Delivery | null>(err);
    }
  };

  const logDeliveryActivity = (
    deliveryId: string,
    action: string,
    detail?: string,
  ) => {
    const entry: DeliveryActivity = {
      action,
      detail,
      at: new Date().toISOString(),
    };
    const current = deliveryActivity.value[deliveryId] ?? [];
    deliveryActivity.value = {
      ...deliveryActivity.value,
      [deliveryId]: [entry, ...current],
    };
  };

  const syncInventoryForDeliveryStatus = async (
    current: Delivery,
    nextStatus: Delivery["status"],
  ) => {
    if (current.status === nextStatus) return;

    const deliveryLogs = inventoryStore.getLogsByReference(current.id, "delivery");
    const netMovement = deliveryLogs.reduce(
      (sum, entry) => sum + (entry.quantity_change ?? 0),
      0,
    );

    const shouldDispatch =
      (nextStatus === "in_transit" || nextStatus === "delivered") &&
      netMovement === 0;
    const shouldRestore =
      (nextStatus === "cancelled" || nextStatus === "failed") &&
      netMovement < 0;

    if (!shouldDispatch && !shouldRestore) return;

    const items = orderStore.orderItems.filter(
      (item) => item.order_id === current.order_id,
    );

    for (const item of items) {
      const quantity = Math.abs(item.quantity ?? 0);
      if (!quantity) continue;

      const quantityChange = shouldDispatch ? -quantity : quantity;

      await inventoryStore.createInventoryLog({
        product_id: item.product_id,
        movement_type: shouldDispatch ? "out" : "in",
        quantity_change: quantityChange,
        reference_type: "delivery",
        reference_id: current.id,
        note: shouldDispatch
          ? `Stock released for delivery ${current.id} (${current.order_id}) after status changed from ${current.status} to ${nextStatus}.`
          : `Stock returned from delivery ${current.id} (${current.order_id}) after status changed from ${current.status} to ${nextStatus}.`,
        created_by: "system",
      });

      await productStore.adjustProductStock(item.product_id, quantityChange);
    }

    logDeliveryActivity(
      current.id,
      shouldDispatch ? "Inventory deducted" : "Inventory restored",
      `Order ${current.order_id} ${shouldDispatch ? "deducted" : "restocked"} for ${nextStatus}`,
    );
  };

  const updateDeliveryMeta = (
    deliveryId: string,
    payload: Partial<DeliveryMeta>,
  ) => {
    deliveryMeta.value = {
      ...deliveryMeta.value,
      [deliveryId]: {
        ...(deliveryMeta.value[deliveryId] ?? {}),
        ...payload,
      },
    };
  };

  const createDelivery = async (
    payload: Omit<Delivery, "id" | "created_at" | "updated_at">,
  ): Promise<H3Response<Delivery>> => {
    try {
      isLoading.value = true;
      const now = new Date().toISOString();
      const created: Delivery = {
        id: `del-${Date.now()}`,
        order_id: payload.order_id,
        driver_id: payload.driver_id,
        vehicle_number: payload.vehicle_number,
        status: payload.status,
        scheduled_at: payload.scheduled_at,
        delivered_at: payload.delivered_at,
        created_at: now,
        updated_at: now,
      };

      allDeliveries.value = [created, ...allDeliveries.value];
      logDeliveryActivity(created.id, "Delivery created");
      await fetchDeliveries();

      return buildOkResponse(created, 1);
    } catch (err: any) {
      error.value = err;
      return buildErrorResponse<Delivery>(err);
    } finally {
      isLoading.value = false;
    }
  };

  const updateDelivery = async (
    id: string,
    payload: Partial<Delivery>,
    log?: { action: string; detail?: string },
  ): Promise<H3Response<Delivery | null>> => {
    try {
      isLoading.value = true;
      const index = allDeliveries.value.findIndex((item) => item.id === id);
      if (index === -1) {
        return buildOkResponse(null, 0);
      }

      const current = allDeliveries.value[index];
      if (!current) {
        return buildOkResponse(null, 0);
      }
      const updated: Delivery = {
        ...current,
        ...payload,
        id,
        updated_at: new Date().toISOString(),
      };

      allDeliveries.value.splice(index, 1, updated);

      if (delivery.value?.id === id) {
        delivery.value = updated;
      }

      if (log) {
        logDeliveryActivity(id, log.action, log.detail);
      }

      if (payload.status) {
        await syncInventoryForDeliveryStatus(current, updated.status);
      }

      await fetchDeliveries();

      return buildOkResponse(updated, 1);
    } catch (err: any) {
      error.value = err;
      return buildErrorResponse<Delivery | null>(err);
    } finally {
      isLoading.value = false;
    }
  };

  const deleteDelivery = async (id: string): Promise<H3Response<null>> => {
    try {
      isLoading.value = true;
      allDeliveries.value = allDeliveries.value.filter((item) => item.id !== id);

      if (delivery.value?.id === id) {
        delivery.value = null;
      }

      logDeliveryActivity(id, "Delivery deleted");
      await fetchDeliveries();

      return buildOkResponse(null, 1);
    } catch (err: any) {
      error.value = err;
      return buildErrorResponse<null>(err);
    } finally {
      isLoading.value = false;
    }
  };

  const getDeliveryByOrderId = (orderId: string) =>
    allDeliveries.value.find((item) => item.order_id === orderId) ?? null;

  const ensureDeliveryForOrder = async (orderId: string) => {
    const current = getDeliveryByOrderId(orderId);
    if (current) return current;
    const created = await createDelivery({
      order_id: orderId,
      driver_id: null,
      vehicle_number: null,
      status: "scheduled",
      scheduled_at: new Date().toISOString(),
      delivered_at: null,
    });
    return created.data;
  };

  const assignDriver = async (id: string, driverId: string) => {
    await updateDelivery(
      id,
      { driver_id: driverId },
      { action: "Driver assigned", detail: driverId },
    );
  };

  const assignVehicle = async (id: string, vehicleNumber: string) => {
    await updateDelivery(
      id,
      { vehicle_number: vehicleNumber },
      { action: "Vehicle assigned", detail: vehicleNumber },
    );
  };

  const assignWarehouseStaff = (id: string, staff: string) => {
    updateDeliveryMeta(id, { warehouse_staff: staff });
    logDeliveryActivity(id, "Warehouse staff assigned", staff);
  };

  const scheduleDelivery = async (id: string, scheduledAt: string) => {
    await updateDelivery(
      id,
      { scheduled_at: scheduledAt },
      { action: "Delivery scheduled", detail: scheduledAt },
    );
  };

  const updateDeliveryStatus = async (id: string, status: Delivery["status"]) => {
    await updateDelivery(
      id,
      {
        status,
        delivered_at: status === "delivered" ? new Date().toISOString() : null,
      },
      { action: `Status updated to ${status}` },
    );
  };

  const updateDeliveryLocation = (id: string, location: string) => {
    updateDeliveryMeta(id, { location });
    logDeliveryActivity(id, "Location updated", location);
  };

  const updateDeliveryRoute = (id: string, route: string) => {
    updateDeliveryMeta(id, { route });
    logDeliveryActivity(id, "Route updated", route);
  };

  const updateDeliveryStatusByOrder = async (
    orderId: string,
    status: Delivery["status"],
  ) => {
    const current = await ensureDeliveryForOrder(orderId);
    if (!current) return;
    await updateDeliveryStatus(current.id, status);
  };

  const assignDriverByOrder = async (orderId: string, driverId: string) => {
    const current = await ensureDeliveryForOrder(orderId);
    if (!current) return;
    await assignDriver(current.id, driverId);
  };

  const scheduleDeliveryByOrder = async (
    orderId: string,
    scheduledAt: string,
  ) => {
    const current = await ensureDeliveryForOrder(orderId);
    if (!current) return;
    await scheduleDelivery(current.id, scheduledAt);
  };

  const printDeliveryDocument = (id: string, type: string) => {
    const current = allDeliveries.value.find((item) => item.id === id);
    if (!current) return;
    const content = [
      `Delivery ${current.id}`,
      `Order ${current.order_id}`,
      `Status ${current.status}`,
      `Driver ${current.driver_id ?? "Unassigned"}`,
      `Vehicle ${current.vehicle_number ?? "Unassigned"}`,
      `Scheduled ${current.scheduled_at ?? "TBD"}`,
      `Document ${type}`,
    ].join("\n");
    printText(`Delivery ${id} ${type}`, content);
    logDeliveryActivity(id, `Printed ${type}`);
  };

  const downloadDeliveryDocument = (id: string, type: string) => {
    const current = allDeliveries.value.find((item) => item.id === id);
    if (!current) return;
    const content = [
      `Delivery ${current.id}`,
      `Order ${current.order_id}`,
      `Status ${current.status}`,
      `Driver ${current.driver_id ?? "Unassigned"}`,
      `Vehicle ${current.vehicle_number ?? "Unassigned"}`,
      `Scheduled ${current.scheduled_at ?? "TBD"}`,
      `Document ${type}`,
    ].join("\n");
    downloadText(`delivery-${id}-${type}.txt`, content, "text/plain");
    logDeliveryActivity(id, `Downloaded ${type}`);
  };

  const sendDeliveryCommunication = (id: string, type: string) => {
    logDeliveryActivity(id, "Communication sent", type);
  };

  const exportDelivery = (id: string) => {
    const current = allDeliveries.value.find((item) => item.id === id);
    if (!current) return;
    const payload = JSON.stringify(current, null, 2);
    downloadText(`delivery-${id}.json`, payload, "application/json");
    logDeliveryActivity(id, "Delivery exported");
  };

  const getDeliveryActivity = (id: string) =>
    deliveryActivity.value[id] ?? [];

  const setSearch = async (value: string) => {
    query.value.q = value;
    query.value.page = 1;
    return await fetchDeliveries();
  };

  const setFilter = async (filters: Partial<FetchDeliveryParams>) => {
    query.value = {
      ...query.value,
      ...filters,
      page: 1,
    };

    return await fetchDeliveries();
  };

  const setPage = async (page: number) => {
    query.value.page = page;
    return await fetchDeliveries();
  };

  return {
    delivery,
    deliveries,
    deliveryActivity,
    deliveryMeta,
    query,
    pagination,
    isLoading,
    error,
    fetchDeliveries,
    fetchDeliveryById,
    createDelivery,
    updateDelivery,
    deleteDelivery,
    getDeliveryByOrderId,
    ensureDeliveryForOrder,
    logDeliveryActivity,
    updateDeliveryMeta,
    assignDriver,
    assignVehicle,
    assignWarehouseStaff,
    scheduleDelivery,
    updateDeliveryStatus,
    updateDeliveryStatusByOrder,
    assignDriverByOrder,
    scheduleDeliveryByOrder,
    updateDeliveryLocation,
    updateDeliveryRoute,
    printDeliveryDocument,
    downloadDeliveryDocument,
    sendDeliveryCommunication,
    exportDelivery,
    getDeliveryActivity,
    setSearch,
    setFilter,
    setPage,
  };
});
