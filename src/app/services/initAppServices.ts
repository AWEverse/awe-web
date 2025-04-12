import initAnimationsStore from "@/store/animations/initAnimationsStore";
import initI18n from "../providers/i18n-provider";
import initializeSecurityAsync from "./initializeDOMSecurity";
import { ready } from 'libsodium-wrappers';
import initClientFingerprint from "./initClientFingerprint";

export default async function () {
  await (async () => ready)();

  await initAnimationsStore();
  await initI18n();
  await initClientFingerprint();
  await initializeSecurityAsync()
};

