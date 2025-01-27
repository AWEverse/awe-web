import {
  requestNextMutation,
  requestMutation,
} from "@/lib/modules/fastdom/fastdom";

/**
 * Detects if the given text is written in a right-to-left (RTL) script by analyzing
 * its layout in the DOM. This method uses `offsetLeft` to compare the relative positions
 * of identical text spans in the document, which has wider browser support than `getBoundingClientRect`.
 *
 * @param {string} text - The text to be checked for RTL script.
 * @param {(result: boolean) => void} callback - The callback function to return the result asynchronously.
 */
export function isScriptRtl(
  text: string,
  callback: (result: boolean) => void,
): void {
  if (
    typeof document === "undefined" ||
    !("offsetLeft" in document.documentElement)
  ) {
    callback(false);
    return;
  }

  requestMutation(() => {
    const testDiv = document.createElement("div");
    testDiv.style.cssText = `
      position: absolute;
      visibility: hidden;
      width: auto;
      height: auto;
      font-size: 10px;
      font-family: 'Ahuramzda';
    `;

    const span1 = document.createElement("span");
    const span2 = document.createElement("span");

    span1.appendChild(document.createTextNode(text));
    span2.appendChild(document.createTextNode(text));

    testDiv.appendChild(span1);
    testDiv.appendChild(span2);

    document.body.appendChild(testDiv);

    requestForcedReflow(() => {
      const offsetLeft1 = span1.offsetLeft;
      const offsetLeft2 = span2.offsetLeft;

      callback(offsetLeft1 > offsetLeft2);

      return () => {
        document.body.removeChild(testDiv);
      };
    });
  });
}
