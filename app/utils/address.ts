import type { Address, AddressPayload } from "~/types/address";

export type AddressDraft = {
  region: string;
  street: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  address_line: string;
};

const normalizeText = (value: unknown) => {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length ? normalized : null;
};

export const createEmptyAddressDraft = (): AddressDraft => ({
  region: "",
  street: "",
  city: "",
  province: "",
  postal_code: "",
  country: "",
  address_line: "",
});

export const isAddressDraftComplete = (value: Partial<AddressDraft> | null) =>
  !!normalizeText(value?.region) &&
  !!normalizeText(value?.street) &&
  !!normalizeText(value?.city) &&
  !!normalizeText(value?.province) &&
  !!normalizeText(value?.address_line);

export const toAddressDraft = (
  value?: Partial<Address> | Partial<AddressPayload> | null,
): AddressDraft => ({
  region: "",
  street: value?.street?.trim?.() ?? "",
  city: value?.city?.trim?.() ?? "",
  province: value?.province?.trim?.() ?? "",
  postal_code: value?.postal_code?.trim?.() ?? "",
  country: value?.country?.trim?.() ?? "",
  address_line: value?.address_line?.trim?.() ?? "",
});

export const toAddressPayload = (
  value: Partial<AddressDraft> | null,
): AddressPayload => ({
  street: normalizeText(value?.street) ?? "",
  city: normalizeText(value?.city) ?? "",
  province: normalizeText(value?.province) ?? "",
  postal_code: normalizeText(value?.postal_code),
  country: normalizeText(value?.country),
  address_line: normalizeText(value?.address_line),
});

export const formatAddress = (
  value?: Partial<Address> | Partial<AddressPayload> | null,
) =>
  [
    normalizeText(value?.address_line),
    normalizeText(value?.street),
    normalizeText(value?.city),
    normalizeText(value?.province),
    normalizeText(value?.postal_code),
    normalizeText(value?.country),
  ]
    .filter(Boolean)
    .join(", ");
