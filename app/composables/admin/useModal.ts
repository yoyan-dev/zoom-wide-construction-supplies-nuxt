export function useModal() {
  const overlay = useOverlay();

  function openModal(component: any, payload?: any) {
    const modal = overlay.create(component);
    return modal.open({ payload });
  }

  return { openModal };
}
