export default {
  // @ts-ignore
  get: (key: string): string | undefined => {
    return process.env[key];
  },
  // @ts-ignore
  set: (key: string, value: string): void => {
    process.env[key] = value;
  },
}
