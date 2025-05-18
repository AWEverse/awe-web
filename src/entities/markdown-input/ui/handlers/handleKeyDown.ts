import { requestNextMutation } from "@/lib/modules/fastdom";

export default function handleKeyDown(
  e: React.KeyboardEvent<HTMLDivElement>,
  {
    submitKey = "Enter",
    submitOnCtrlEnter = false,
    handleSubmit,
    enableTabCharacter = false,
    tabSize = 2,
  }: {
    submitKey?: string;
    submitOnCtrlEnter?: boolean;
    handleSubmit: () => void;
    enableTabCharacter?: boolean;
    tabSize?: number;
  },
): void {
  if (e.key === submitKey && !e.repeat) {
    const isSubmit = submitOnCtrlEnter
      ? e.ctrlKey || e.metaKey
      : submitKey !== "Enter" || !e.shiftKey;

    if (isSubmit) {
      e.preventDefault();
      handleSubmit();
      return;
    }
  }

  if (e.key === "Tab" && enableTabCharacter) {
    e.preventDefault();
    requestNextMutation(() => {
      const selection = window.getSelection?.();
      if (!selection?.rangeCount) return;

      return () => {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode("\t".repeat(tabSize)));
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    });
  }
}
