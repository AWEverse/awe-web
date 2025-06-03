export type CommandPath = { cmd: string; params: number[] };

export function parsePath(d: string): CommandPath[] {
  const regex = /[MLCQZ]|[+-]?((\.\d+)|(\d+\.?\d*))(?:[eE][+-]?\d+)?/gi;
  const tokens = d.match(regex);
  if (!tokens) return [];

  const CommandPaths: CommandPath[] = [];
  let currentCommandPath: CommandPath | null = null;

  for (const token of tokens) {
    if (/[MLCQZ]/i.test(token)) {
      if (currentCommandPath) {
        CommandPaths.push(currentCommandPath);
      }
      currentCommandPath = { cmd: token, params: [] };
    } else {
      if (currentCommandPath) {
        currentCommandPath.params.push(+token);
      }
    }
  }

  if (currentCommandPath) {
    CommandPaths.push(currentCommandPath);
  }

  return CommandPaths;
}


export function serializePath(cmds: CommandPath[]): string {
  const parts = [];
  for (const { cmd, params } of cmds) {
    parts.push(cmd);
    for (let i = 0; i < params.length; i++) {
      parts.push(String(params[i]));
    }
  }

  return parts.join(" ");
}
