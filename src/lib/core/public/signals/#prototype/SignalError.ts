export default class SignalError extends Error {
  constructor(message: string, public signalId: string) {
    super(`[Signal: ${signalId}] ${message}`);
    this.name = 'SignalError';
  }
}
