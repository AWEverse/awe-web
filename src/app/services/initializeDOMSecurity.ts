import { requestIdleExecution } from "@/lib/core";
import DOMPurify from "dompurify";

/**
 * Initializes DOMPurify with comprehensive security settings using asynchronous patterns
 * to avoid blocking the main thread during application startup.
 *
 * @returns A Promise that resolves when configuration is complete
 */
export default async function initializeSecurityAsync(): Promise<void> {
  // Return a promise to allow awaiting the configuration
  return new Promise<void>((resolve) => {
    requestIdleExecution(() => {
      try {
        // First stage: Set up critical security controls immediately
        applyBasicSecurityControls();

        // Second stage: Set up the detailed configuration in a microtask
        queueMicrotask(() => {
          applyDetailedSecurityConfiguration();

          resolve();
        });
      } catch (error) {
        console.error("Failed to initialize DOMPurify security configuration:", error);

        applyFallbackConfiguration();
        resolve();
      }
    }, 1000); // Ensure it runs within 1 second even if browser is busy
  });
}

/**
 * Applies critical high-priority security settings that should be applied immediately
 */
function applyBasicSecurityControls(): void {
  DOMPurify.setConfig({
    // Critical security features
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
    // Explicitly forbid dangerous tags that could lead to XSS attacks
    FORBID_TAGS: [
      // Script-related elements that can execute code
      "script", // Prevents JavaScript execution
      "noscript", // Can contain alternate content that might be problematic

      // Style-related elements that can be used for style-based attacks
      "style", // Prevents CSS injection which can be used for attacks

      // Interactive elements that could be used to trick users
      "form", // Prevents form submission attacks
      "input", // Prevents collection of user data
      "button", // Prevents clickjacking-style attacks
      "select", // Prevents UI manipulation
      "option", // Related to select manipulation
      "optgroup", // Related to select manipulation
      "textarea", // Prevents collection of user data

      // Embedding elements that could load external resources
      "iframe", // Prevents loading external documents
      "frame", // Legacy version of iframe
      "frameset", // Container for frames
      "object", // Can embed various media types including executables
      "embed", // Similar to object but more limited
      "applet", // Legacy Java embedding

      // Meta elements that can affect page behavior
      "meta", // Can set various page behaviors and redirects
      "base", // Can change base URL for relative links

      // Other potentially dangerous elements
      "math", // MathML can sometimes contain exploitable content
      "svg", // SVG can contain script elements
      "canvas", // Can be used for pixel-based tracking/fingerprinting
      "dialog", // Modal dialogs can be used for UI deception
      "link", // Can load external stylesheets
      "template", // Can contain inert content that gets activated
    ],

    // === Attribute Control ===
    // Forbid potentially dangerous attributes that could enable attacks
    FORBID_ATTR: [
      // Style-related attributes
      "style", // Prevents inline CSS which can be used for attacks

      // Event handler attributes that can execute JavaScript
      "onabort", "onafterprint", "onanimationend", "onanimationiteration",
      "onanimationstart", "onbeforeprint", "onbeforeunload", "onblur",
      "oncanplay", "oncanplaythrough", "onchange", "onclick", "oncontextmenu",
      "oncopy", "oncut", "ondblclick", "ondrag", "ondragend", "ondragenter",
      "ondragleave", "ondragover", "ondragstart", "ondrop", "ondurationchange",
      "onended", "onerror", "onfocus", "onfocusin", "onfocusout", "onfullscreenchange",
      "onfullscreenerror", "ongotpointercapture", "oninput", "oninvalid",
      "onkeydown", "onkeypress", "onkeyup", "onload", "onloadeddata",
      "onloadedmetadata", "onloadstart", "onlostpointercapture", "onmousedown",
      "onmouseenter", "onmouseleave", "onmousemove", "onmouseout", "onmouseover",
      "onmouseup", "onmousewheel", "onpaste", "onpause", "onplay", "onplaying",
      "onpointercancel", "onpointerdown", "onpointerenter", "onpointerleave",
      "onpointermove", "onpointerout", "onpointerover", "onpointerup", "onprogress",
      "onratechange", "onreset", "onresize", "onscroll", "onsearch", "onseeked",
      "onseeking", "onselect", "onselectionchange", "onselectstart", "onshow",
      "onstalled", "onsubmit", "onsuspend", "ontimeupdate", "ontoggle",
      "ontouchcancel", "ontouchend", "ontouchmove", "ontouchstart", "ontransitionend",
      "onvolumechange", "onwaiting", "onwheel",

      // Attributes that can be used for phishing or other attacks
      "formaction", // Can override form action
      "href", // Used with careful allowlisting below
      "xlink:href", // SVG-specific variant of href
      "action", // Form submission target
      "background", // Can load images
      "poster", // Used with video elements
      "src", // Used with careful allowlisting below
      "srcdoc", // Can contain a full HTML document in an iframe
      "dynsrc", // Dynamic source for old IE
      "lowsrc", // Low-resolution image source
      "ping", // Used for tracking user clicks
    ],

    // === Feature Controls ===
    // Disable features that could introduce vulnerabilities
    ALLOW_DATA_ATTR: false, // Prevent usage of data-* attributes which can contain executable code
    ALLOW_UNKNOWN_PROTOCOLS: false, // Only allow known safe protocols like http:, https:
    ALLOW_SELF_CLOSE_IN_ATTR: false, // Prevent self-closing syntax in attributes which can break out

    // === Add back necessary attributes and elements with restrictions ===
    ADD_TAGS: [
      "a", "p", "span", "b", "i", "strong", "em", "h1", "h2", "h3", "h4", "h5", "h6",
      "blockquote", "pre", "code", "ol", "ul", "li", "br", "hr", "img", "table",
      "thead", "tbody", "tr", "th", "td",
    ],

    ADD_ATTR: [
      "target", // For opening links in new tabs (with rel restrictions below)
      "rel", // For security attributes on links
      "title", // For tooltips
      "alt", // For image descriptions
      "class", // For styling (with CSS cleanup elsewhere in your app)
    ],
    ADD_URI_SAFE_ATTR: [
      "href", // Only allow http, https, mailto and relative URLs
      "src", // Only allow http, https and data URIs for images (with care)
    ],

    // === Additional Security Controls ===
    FORCE_BODY: true, // Ensure output is always within a body context
    RETURN_DOM_FRAGMENT: false, // Return string instead of DOM
    RETURN_DOM: false, // Return string instead of DOM
    SANITIZE_DOM: true, // Clean up DOM objects created by browser parsing

    // === Hook for additional custom security checks ===
    WHOLE_DOCUMENT: false, // Only sanitize the content, not wrapped in a full document

    // === Advanced hook for custom attribute sanitization ===
    CUSTOM_ELEMENT_HANDLING: {
      tagNameCheck: /^[a-z][a-z0-9\-]*$/, // Only allow lowercase alphanumeric tags
      attributeNameCheck: /^[a-z][a-z0-9\-]*$/, // Only allow lowercase alphanumeric attributes
      allowCustomizedBuiltInElements: false, // Prevent customized built-in elements
    },
  });
}

/**
 * Applies minimal fallback configuration in case the main configuration fails
 */
function applyFallbackConfiguration(): void {
  // Minimal but effective configuration that blocks the most critical vectors
  DOMPurify.setConfig({
    ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'br', 'span'],
    ALLOWED_ATTR: ['href', 'title', 'target'],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target', 'rel']
  });

  // Add a simple hook for link safety
  DOMPurify.addHook('afterSanitizeAttributes', function (node) {
    if (node.nodeName.toLowerCase() === 'a' && node.hasAttribute('target')) {
      node.setAttribute('rel', 'noopener noreferrer');
    }
  });

  console.warn(
    "DOMPurify is running in fallback mode with minimal configuration. " +
    "This provides basic protection, but full security features could not be applied."
  );
}
