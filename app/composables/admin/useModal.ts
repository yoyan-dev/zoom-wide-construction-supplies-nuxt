import { isReactive, isReadonly, toRaw } from "vue";

export function useModal() {
  const overlay = useOverlay();

  const unwrapPayload = <T>(value: T): T => {
    if (Array.isArray(value)) {
      return value.map((item) => unwrapPayload(item)) as T;
    }

    if (!value || typeof value !== "object") {
      return value;
    }

    const rawValue =
      isReactive(value) || isReadonly(value) ? toRaw(value) : value;
    const prototype = Object.getPrototypeOf(rawValue);

    if (prototype !== Object.prototype && prototype !== null) {
      return rawValue;
    }

    return Object.fromEntries(
      Object.entries(rawValue as Record<string, unknown>).map(([key, item]) => [
        key,
        unwrapPayload(item),
      ]),
    ) as T;
  };

  function openModal(component: any, payload?: any) {
    const modal = overlay.create(component);
    return modal.open(
      payload === undefined ? undefined : { payload: unwrapPayload(payload) },
    );
  }

  return { openModal };
}
