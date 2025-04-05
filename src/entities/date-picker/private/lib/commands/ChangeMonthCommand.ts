export default class ChangeMonthCommand {
  private increment: number;
  private changeMonth: (increment: number) => void;
  private previousMonth: Date;

  constructor(increment: number, changeMonth: (increment: number) => void, previousMonth: Date) {
    this.increment = increment;
    this.changeMonth = changeMonth;
    this.previousMonth = previousMonth;
  }

  execute() {
    this.changeMonth(this.increment);
  }

  undo() {
    this.changeMonth(this.previousMonth.getMonth() - this.previousMonth.getMonth());
  }
}
