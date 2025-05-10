import initAnimationsStore from "@/store/animations/initAnimationsStore";
import initializeSecurityAsync from "./initializeDOMSecurity";
import initClientFingerprint from "./initClientFingerprint";
import { ready as initLibsodium } from 'libsodium-wrappers';
import { initI18n } from "../providers/i18n-provider";

export default async function () {
  await (async () => { await initLibsodium })();

  await initAnimationsStore();
  await initI18n();
  await initClientFingerprint();
  await initializeSecurityAsync()
};

