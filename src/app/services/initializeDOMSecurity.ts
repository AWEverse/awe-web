import { DEBUG } from "@/lib/config/dev";
import { requestIdleExecution } from "@/lib/core";
import queueMicrotask from "@/lib/core/public/polyfill/queueMicrotasks";
import DOMPurify from "dompurify";

// Flag to prevent multiple initializations
let isInitialized = false;

/**
 * Initializes DOMPurify with comprehensive security settings using asynchronous patterns
 * to avoid blocking the main thread during application startup.
 *
 * @returns A Promise that resolves when configuration is complete
 * @throws Error if called multiple times (to prevent configuration overwrites)
 */
export default async function initializeSecurityAsync(): Promise<void> {
  if (isInitialized) {
    throw new Error(
      "initializeSecurityAsync has already been called. Configuration should only be set once.",
    );
  }

  return new Promise<void>((resolve, reject) => {
    requestIdleExecution(() => {
      try {
        // First stage: Set up critical security controls immediately
        applyBasicSecurityControls();

        // Second stage: Set up detailed configuration in a microtask
        queueMicrotask(() => {
          try {
            applyDetailedSecurityConfiguration();
            isInitialized = true;
            resolve();
            if (DEBUG)
              console.info(
                ">>> APPLICATION INIT: initializeSecurityAsync - success",
              );
          } catch (error) {
            isInitialized = true;
            console.error(
              "Failed to apply detailed DOMPurify security configuration:",
              error,
            );
            applyFallbackConfiguration();
            reject(error);
          }
        });
      } catch (error) {
        isInitialized = true;
        console.error(
          "Failed to initialize DOMPurify security configuration:",
          error,
        );
        applyFallbackConfiguration();
        reject(error);
      }
    }, 1000); // Ensure it runs within 1 second even if browser is busy
  });
}

/**
 * Applies critical high-priority security settings that should be applied immediately
 */
function applyBasicSecurityControls(): void {
  DOMPurify.setConfig({
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Applies the detailed and comprehensive security configuration
 */
function applyDetailedSecurityConfiguration(): void {
  DOMPurify.setConfig({
    // === Tag Control ===
    ALLOWED_TAGS: [
      "a",
      "p",
      "span",
      "b",
      "i",
      "strong",
      "em",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "blockquote",
      "pre",
      "code",
      "ol",
      "ul",
      "li",
      "br",
      "hr",
      "img",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
    ],
    FORBID_TAGS: [
      "script",
      "noscript",
      "style",
      "form",
      "input",
      "button",
      "select",
      "option",
      "optgroup",
      "textarea",
      "iframe",
      "frame",
      "frameset",
      "object",
      "embed",
      "applet",
      "meta",
      "base",
      "math",
      "svg",
      "canvas",
      "dialog",
      "link",
      "template",
    ],

    // === Attribute Control ===
    ALLOWED_ATTR: ["href", "target", "rel", "title", "alt", "class", "src"],
    FORBID_ATTR: [
      "style",
      "onabort",
      "onafterprint",
      "onanimationend",
      "onanimationiteration",
      "onanimationstart",
      "onbeforeprint",
      "onbeforeunload",
      "onblur",
      "oncanplay",
      "oncanplaythrough",
      "onchange",
      "onclick",
      "oncontextmenu",
      "oncopy",
      "oncut",
      "ondblclick",
      "ondrag",
      "ondragend",
      "ondragenter",
      "ondragleave",
      "ondragover",
      "ondragstart",
      "ondrop",
      "ondurationchange",
      "onended",
      "onerror",
      "onfocus",
      "onfocusin",
      "onfocusout",
      "onfullscreenchange",
      "onfullscreenerror",
      "ongotpointercapture",
      "oninput",
      "oninvalid",
      "onkeydown",
      "onkeypress",
      "onkeyup",
      "onload",
      "onloadeddata",
      "onloadedmetadata",
      "onloadstart",
      "onlostpointercapture",
      "onmousedown",
      "onmouseenter",
      "onmouseleave",
      "onmousemove",
      "onmouseout",
      "onmouseover",
      "onmouseup",
      "onmousewheel",
      "onpaste",
      "onpause",
      "onplay",
      "onplaying",
      "onpointercancel",
      "onpointerdown",
      "onpointerenter",
      "onpointerleave",
      "onpointermove",
      "onpointerout",
      "onpointerover",
      "onpointerup",
      "onprogress",
      "onratechange",
      "onreset",
      "onresize",
      "onscroll",
      "onsearch",
      "onseeked",
      "onseeking",
      "onselect",
      "onselectionchange",
      "onselectstart",
      "onshow",
      "onstalled",
      "onsubmit",
      "onsuspend",
      "ontimeupdate",
      "ontoggle",
      "ontouchcancel",
      "ontouchend",
      "ontouchmove",
      "ontouchstart",
      "ontransitionend",
      "onvolumechange",
      "onwaiting",
      "onwheel",
      "formaction",
      "xlink:href",
      "action",
      "background",
      "poster",
      "srcdoc",
      "dynsrc",
      "lowsrc",
      "ping",
    ],

    // === Feature Controls ===
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    ALLOW_SELF_CLOSE_IN_ATTR: false,
    FORCE_BODY: true,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM: false,
    SANITIZE_DOM: true,
    WHOLE_DOCUMENT: false,

    // === Custom Element Handling ===
    CUSTOM_ELEMENT_HANDLING: {
      tagNameCheck: /^[a-z][a-z0-9\-]*$/,
      attributeNameCheck: /^[a-z][a-z0-9\-]*$/,
      allowCustomizedBuiltInElements: false,
    },
  });
}

/**
 * Applies minimal fallback configuration in case the main configuration fails
 */
function applyFallbackConfiguration(): void {
  DOMPurify.setConfig({
    ALLOWED_TAGS: [
      "p",
      "b",
      "i",
      "em",
      "strong",
      "a",
      "ul",
      "ol",
      "li",
      "br",
      "span",
    ],
    ALLOWED_ATTR: ["href", "title", "target", "rel"],
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
    ALLOW_DATA_ATTR: false,
  });

  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (node.nodeName.toLowerCase() === "a" && node.hasAttribute("target")) {
      node.setAttribute("rel", "noopener noreferrer");
    }
  });

  console.warn(
    "DOMPurify is running in fallback mode with minimal configuration. " +
    "Full security features could not be applied. Please investigate the error.",
  );
}
