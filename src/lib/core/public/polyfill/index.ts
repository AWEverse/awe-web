import { conditionalPolyfill } from "../misc/ConditionalPolyfill";

export { default as queueMicrotask } from "./queueMicrotasks";

(async () => await conditionalPolyfill(
  "closest",
  "closest" in Element.prototype,
  () => import("./closest"),
))();
