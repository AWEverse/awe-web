import { requestNextMutation } from "@/lib/modules/fastdom";

export default function handleMarkdownInputKeyDown(
  e: React.KeyboardEvent<HTMLDivElement>,
  opts: {
    submitKey: string;
    submitOnCtrlEnter: boolean;
    handleSubmit: () => void;
    enableTabCharacter: boolean;
    tabSize: number;
  },
) {
  const { submitKey, submitOnCtrlEnter, handleSubmit, enableTabCharacter, tabSize } = opts;
  const key = e.key;
  const isSubmitKey = key === (submitKey || "Enter");
  let submitCondition = false;

  if (submitOnCtrlEnter) {
    submitCondition = isSubmitKey && (e.ctrlKey || e.metaKey);
  } else {
    if (submitKey && submitKey !== "Enter") {
      submitCondition = isSubmitKey;
    } else {
      submitCondition = isSubmitKey && !e.shiftKey;
    }
  }

  if (submitCondition) {
    e.preventDefault();
    handleSubmit();
  }

  if (e.key === "Tab" && enableTabCharacter) {
    e.preventDefault();
    requestNextMutation(() => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        return () => {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          range.insertNode(document.createTextNode(" ".repeat(tabSize)));
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
        };
      }
    });
  }
}
