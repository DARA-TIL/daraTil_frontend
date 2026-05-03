import type { AssistantLanguage } from "./types";

function getNodeContainer(node: Node | null): Node | null {
  if (!node) return null;
  return node.nodeType === Node.TEXT_NODE ? node.parentNode : node;
}

export function normalizeAssistantLanguage(value: string): AssistantLanguage {
  const normalized = String(value || "").trim().toUpperCase();

  if (normalized === "KK") return "KZ";
  if (normalized === "KZ" || normalized === "RU" || normalized === "EN") {
    return normalized;
  }

  return "EN";
}

export function sanitizeSelectedWord(value: string): string | null {
  const normalized = String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");

  if (!normalized || normalized.length > 80 || /\s/u.test(normalized)) {
    return null;
  }

  return normalized;
}

export function clearBrowserSelection() {
  if (typeof window === "undefined") return;
  window.getSelection()?.removeAllRanges();
}

export function selectionBelongsToRoot(
  selection: Selection,
  root: HTMLElement,
): boolean {
  const anchorNode = getNodeContainer(selection.anchorNode);
  const focusNode = getNodeContainer(selection.focusNode);

  return Boolean(
    anchorNode &&
      focusNode &&
      root.contains(anchorNode) &&
      root.contains(focusNode),
  );
}
