import type { H3Response } from "~/types/h3Response";
import {
  getH3ResponseToastDescription,
  getH3ResponseToastTitle,
  isH3ResponseSuccess,
} from "~/utils/api";

type ResponseText<T> = string | ((response: H3Response<T>) => string | undefined);

type NotifyResponseOptions<T> = {
  successTitle?: ResponseText<T>;
  successDescription?: ResponseText<T>;
  errorTitle?: ResponseText<T>;
  errorDescription?: ResponseText<T>;
};

const resolveText = <T>(
  value: ResponseText<T> | undefined,
  response: H3Response<T>,
) => {
  if (!value) return undefined;
  return typeof value === "function" ? value(response) : value;
};

export function useAdminResponseToast() {
  const toast = useToast();

  const isSuccessResponse = isH3ResponseSuccess;

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
    response: H3Response<T>,
    options: NotifyResponseOptions<T> = {},
  ) => {
    if (isSuccessResponse(response)) {
      const title =
        resolveText(options.successTitle, response) ??
        getH3ResponseToastTitle(response, "Request completed");

      showSuccess(
        title,
        resolveText(options.successDescription, response) ??
          getH3ResponseToastDescription(response, title),
      );
      return true;
    }

    const title =
      resolveText(options.errorTitle, response) ??
      getH3ResponseToastTitle(response, "Request failed");

    showError(
      title,
      resolveText(options.errorDescription, response) ??
        getH3ResponseToastDescription(response, title) ??
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
