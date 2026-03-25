import type { H3Response } from "~/types/h3Response";
import type { StoreResponse } from "~/types/store-response";
import { formatH3StatusMessage } from "~/utils/api";

type AdminResponse<T> = H3Response<T> | StoreResponse<T>;
type ResponseText<T> = string | ((response: AdminResponse<T>) => string | undefined);

type NotifyResponseOptions<T> = {
  successTitle?: ResponseText<T>;
  successDescription?: ResponseText<T>;
  errorTitle?: ResponseText<T>;
  errorDescription?: ResponseText<T>;
};

const resolveText = <T>(
  value: ResponseText<T> | undefined,
  response: AdminResponse<T>,
) => {
  if (!value) return undefined;
  return typeof value === "function" ? value(response) : value;
};

const isSuccessResponse = <T>(response?: AdminResponse<T> | null) =>
  !!response &&
  response.status !== "error" &&
  (!("statusCode" in response) ||
    response.statusCode === undefined ||
    response.statusCode < 400);

const normalizeResponseText = (value?: string | null) => {
  const text = value?.trim();
  return text ? text : undefined;
};

const getResponseTitle = <T>(
  response?: AdminResponse<T> | null,
  fallback?: string,
) => {
  if (!response) {
    return fallback ?? "Request completed";
  }

  return (
    normalizeResponseText(response.message) ??
    formatH3StatusMessage(response.statusMessage) ??
    fallback ??
    (isSuccessResponse(response) ? "Request completed" : "Request failed")
  );
};

const getResponseDescription = <T>(
  response?: AdminResponse<T> | null,
  title?: string,
) => {
  if (!response) return undefined;

  const message = normalizeResponseText(response.message);
  const statusLabel = formatH3StatusMessage(response.statusMessage);

  if (message && message !== title && statusLabel && statusLabel !== title) {
    return statusLabel;
  }

  if (message && message !== title) {
    return message;
  }

  if (statusLabel && statusLabel !== title) {
    return statusLabel;
  }

  return undefined;
};

export function useAdminResponseToast() {
  const toast = useToast();

  const showSuccess = (title: string, description?: string) => {
    toast.add({
      title,
      description,
      color: "success",
      icon: "i-lucide-circle-check",
    });
  };

  const showError = (title: string, description?: string) => {
    toast.add({
      title,
      description,
      color: "error",
      icon: "i-lucide-circle-alert",
    });
  };

  const notifyResponse = <T>(
    response: AdminResponse<T>,
    options: NotifyResponseOptions<T> = {},
  ) => {
    if (isSuccessResponse(response)) {
      const title =
        resolveText(options.successTitle, response) ??
        getResponseTitle(response, "Request completed");

      showSuccess(
        title,
        resolveText(options.successDescription, response) ??
          getResponseDescription(response, title),
      );
      return true;
    }

    const title =
      resolveText(options.errorTitle, response) ??
      getResponseTitle(response, "Request failed");

    showError(
      title,
      resolveText(options.errorDescription, response) ??
        getResponseDescription(response, title) ??
        "Please try again.",
    );
    return false;
  };

  return {
    toast,
    isSuccessResponse,
    showSuccess,
    showError,
    notifyResponse,
  };
}
