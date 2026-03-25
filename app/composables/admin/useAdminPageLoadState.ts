import type { StoreResponse } from "~/types/store-response";

type LoadResponse = StoreResponse | null | undefined;

const normalizeMessage = (value?: string | null) => {
  const text = value?.trim();
  return text ? text : undefined;
};

export function useAdminPageLoadState() {
  const getLoadErrorMessage = (
    responses: LoadResponse[],
    fallback: string,
  ) => {
    const failedResponse = responses.find((response) => response?.status === "error");
    return normalizeMessage(failedResponse?.message) ?? fallback;
  };

  const isMissingResourceResponse = (response?: LoadResponse) => {
    if (!response || response.status !== "error") {
      return false;
    }

    const text = `${response.message ?? ""} ${response.statusMessage ?? ""}`.trim();
    return /not found/i.test(text);
  };

  return {
    getLoadErrorMessage,
    isMissingResourceResponse,
  };
}
