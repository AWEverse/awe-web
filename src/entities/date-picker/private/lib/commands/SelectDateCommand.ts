class SelectDateCommand {
  private newDate: Date;
  private previousDate: Date;
  private applyChanges: (date: Date) => void;

  constructor(newDate: Date, applyChanges: (date: Date) => void, previousDate: Date) {
    this.newDate = newDate;
    this.previousDate = previousDate;
    this.applyChanges = applyChanges;
  }

  execute = () => {
    this.applyChanges(this.newDate);
  };

  undo = () => {
    this.applyChanges(this.previousDate);
  };
}

export default SelectDateCommand;
