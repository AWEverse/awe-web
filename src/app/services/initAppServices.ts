import initAnimationsStore from "@/store/animations/initAnimationsStore";
import initI18n from "../providers/i18n-provider";
import { KeyboardManager } from "@/lib/core";

export default async function () {
  await Promise.all([
    initAnimationsStore(),
    initI18n()
  ]);

  await KeyboardManager.initializeKeyboardManager();
};

