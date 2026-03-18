import { defineStore } from "pinia";
import { ref } from "vue";
import type { WarehouseTransferStatus } from "~/types/warehouse-transfer";

export const useWarehouseTransfersStore = defineStore("warehouseTransfers", () => {
  const transferStatus = ref<Record<string, WarehouseTransferStatus>>({});

  const getStatus = (id: string): WarehouseTransferStatus =>
    transferStatus.value[id] ?? "pending";

  const setStatus = (id: string, status: WarehouseTransferStatus) => {
    transferStatus.value = {
      ...transferStatus.value,
      [id]: status,
    };
  };

  const approveTransfer = (id: string) => setStatus(id, "approved");
  const markInTransit = (id: string) => setStatus(id, "in_transit");
  const markReceived = (id: string) => setStatus(id, "received");
  const cancelTransfer = (id: string) => setStatus(id, "cancelled");

  return {
    transferStatus,
    getStatus,
    setStatus,
    approveTransfer,
    markInTransit,
    markReceived,
    cancelTransfer,
  };
});
