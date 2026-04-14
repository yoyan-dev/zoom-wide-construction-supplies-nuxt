import type { StoreResponse } from "~/types/store-response";
import { useAdminResponseToast } from "~/composables/admin/useAdminResponseToast";
import { formatH3StatusMessage } from "~/utils/api";

type DeleteResponse = StoreResponse<unknown>;

type SingleDeleteOptions = {
  resourceLabel: string;
  subject?: string;
};

type BulkDeleteOptions = {
  ids: string[];
  deleteItem: (id: string) => Promise<DeleteResponse>;
  resourceLabel: string;
  resourceLabelPlural: string;
  onDeleted?: () => void;
};

const normalizeText = (value?: string | null) => {
  const text = value?.trim();
  return text ? text : undefined;
};

const getResponseDetail = (response: DeleteResponse) => {
  const message = normalizeText(response.message);
  const status = normalizeText(formatH3StatusMessage(response.statusMessage));

  if (message && status && message !== status) {
    return `${message} ${status}`;
  }

  return message ?? status;
};

export function useAdminDeleteFeedback() {
  const { isSuccessResponse, notifyResponse, showSuccess } =
    useAdminResponseToast();

  const getSingleDeleteDescription = (resourceLabel: string) =>
    `This action cannot be undone. Are you sure you want to delete this ${resourceLabel.toLowerCase()}?`;

  const getBulkDeleteDescription = (resourceLabelPlural: string) =>
    `This action cannot be undone. Are you sure you want to delete these ${resourceLabelPlural.toLowerCase()}?`;

  const handleSingleDelete = (
    response: DeleteResponse,
    options: SingleDeleteOptions,
  ) =>
    notifyResponse(response, {
      successTitle: `${options.resourceLabel} deleted`,
      successDescription: `Removed ${options.subject ?? `the ${options.resourceLabel.toLowerCase()}`}.`,
      errorTitle: `${options.resourceLabel} not deleted`,
    });

  const handleBulkDelete = async ({
    ids,
    deleteItem,
    resourceLabel,
    resourceLabelPlural,
    onDeleted,
  }: BulkDeleteOptions) => {
    let deleted = 0;

    for (const id of ids) {
      const response = await deleteItem(id);

      if (!isSuccessResponse(response)) {
        notifyResponse(response, {
          errorTitle: `${resourceLabelPlural} not deleted`,
          errorDescription: (failedResponse) => {
            const progress = `Deleted ${deleted} of ${ids.length} ${resourceLabelPlural.toLowerCase()} before the request failed.`;
            const detail = getResponseDetail(failedResponse as any);
            return detail ? `${progress} ${detail}` : progress;
          },
        });
        return false;
      }

      deleted += 1;
    }

    showSuccess(
      `${resourceLabelPlural} deleted`,
      `Deleted ${deleted} selected ${deleted === 1 ? resourceLabel.toLowerCase() : resourceLabelPlural.toLowerCase()}.`,
    );

    onDeleted?.();
    return true;
  };

  return {
    getSingleDeleteDescription,
    getBulkDeleteDescription,
    handleSingleDelete,
    handleBulkDelete,
  };
}
