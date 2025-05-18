export default function handleSelect(
  e: React.MouseEvent<HTMLDivElement>,
  opts: {
    onSelect: (text: string) => void;
    enableSelection: boolean;
  },
) {
  const { onSelect, enableSelection } = opts;

  if (!enableSelection) return;

  e.preventDefault();
  e.stopPropagation();

  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  const selectedText = range.toString().trim();

  if (selectedText) {
    onSelect(selectedText);
  } else {
    onSelect("");
  }
}
