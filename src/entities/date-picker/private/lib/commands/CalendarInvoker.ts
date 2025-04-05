export default class CalendarInvoker {
  private commands: Array<() => void> = [];
  private undoneCommands: Array<() => void> = [];

  addCommand(command: () => void) {
    this.commands.push(command);
    this.undoneCommands.length = 0;
  }

  executeCommands() {
    if (this.commands.length === 0) return;
    const command = this.commands.pop();
    command?.();
  }

  undo() {
    if (this.commands.length === 0) return;

    const command = this.commands.pop();
    this.undoneCommands.push(command!);
  }

  redo() {
    if (this.undoneCommands.length === 0) return;

    const command = this.undoneCommands.pop();
    this.commands.push(command!);
    command?.();
  }
}
