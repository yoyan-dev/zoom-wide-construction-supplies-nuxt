export const downloadText = (
  filename: string,
  content: string,
  mime = "text/plain",
) => {
  if (typeof window === "undefined") return;

  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const printText = (title: string, content: string) => {
  if (typeof window === "undefined") return;

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  printWindow.document.write(
    `<html><head><title>${escapeHtml(
      title,
    )}</title></head><body><pre>${escapeHtml(
      content,
    )}</pre></body></html>`,
  );
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
};
