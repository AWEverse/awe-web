import { parsePath } from "./pathUtils";

export function makeInterpolator(fromD: string, toD: string): (t: number) => string {
  const fromCmds = parsePath(fromD);
  const toCmds = parsePath(toD);

  if (fromCmds.length !== toCmds.length) {
    throw new Error("Path commands mismatch – lengths differ");
  }
  for (let i = 0; i < fromCmds.length; i++) {
    const from = fromCmds[i];
    const to = toCmds[i];
    if (from.cmd !== to.cmd || from.params.length !== to.params.length) {
      throw new Error(`Command mismatch at index ${i}: ${from.cmd}${from.params.length} vs ${to.cmd}${to.params.length}`);
    }
  }

  const fromParams: number[] = [];
  const toParams: number[] = [];
  const commandInfos: { cmd: string; start: number; count: number }[] = [];
  let offset = 0;

  for (let i = 0; i < fromCmds.length; i++) {
    const from = fromCmds[i];
    const to = toCmds[i];
    const count = from.params.length;
    commandInfos.push({ cmd: from.cmd, start: offset, count });

    for (let j = 0; j < count; j++) {
      fromParams.push(from.params[j]);
      toParams.push(to.params[j]);
    }

    offset += count;
  }

  const deltaParams = new Array(fromParams.length);
  for (let i = 0; i < fromParams.length; i++) {
    deltaParams[i] = toParams[i] - fromParams[i];
  }

  const commandPartInfos: {
    cmd: string;
    partStart: number;
    paramStart: number;
    count: number;
  }[] = [];

  let partIndex = 0;
  for (const info of commandInfos) {
    commandPartInfos.push({
      cmd: info.cmd,
      partStart: partIndex,
      paramStart: info.start,
      count: info.count
    });
    partIndex += 1 + info.count;
  }

  const reusableParts = new Array(partIndex);
  const currentParams = new Array(fromParams.length);

  for (let i = 0; i < fromParams.length; i++) {
    currentParams[i] = fromParams[i];
  }

  return function interpolate(t: number): string {
    const alpha = Math.max(0, Math.min(1, t));

    for (let i = 0; i < fromParams.length; i++) {
      currentParams[i] = fromParams[i] + deltaParams[i] * alpha;
    }

    for (const item of commandPartInfos) {
      const { cmd, partStart, paramStart, count } = item;
      reusableParts[partStart] = cmd;

      for (let j = 0; j < count; j++) {
        reusableParts[partStart + 1 + j] = currentParams[paramStart + j].toString();
      }
    }

    return reusableParts.join(" ");
  };
}
