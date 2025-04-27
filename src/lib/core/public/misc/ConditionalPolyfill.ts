import { DEBUG } from "@/lib/config/dev";

type Condition = () => boolean;
type PolyfillModule = () => Promise<unknown>;

const appliedPolyfills = new Set<string>();

export async function conditionalPolyfill(
  id: string,
  condition: Condition | boolean,
  importer: PolyfillModule
): Promise<void> {
  if (appliedPolyfills.has(id)) return;

  const shouldApply = typeof condition === "function" ? !(condition as Condition)() : !condition;
  if (shouldApply) {
    try {
      await importer();
      appliedPolyfills.add(id);
      if (DEBUG) console.info(`[Polyfill] Applied: ${id}`);
    } catch (err) {
      console.error(`[Polyfill] Failed: ${id}`, err);
    }
  }
}

export async function applyPolyfills(
  polyfills: Array<{ id: string; condition: Condition; importer: PolyfillModule }>
): Promise<void> {
  await Promise.all(
    polyfills.map(({ id, condition, importer }) =>
      conditionalPolyfill(id, condition, importer)
    )
  );
}
