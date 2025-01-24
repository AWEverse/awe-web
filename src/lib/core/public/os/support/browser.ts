import { IS_FIREFOX } from "../platform";

// Поддержка вызовов (не поддерживается в Firefox)
export const ARE_CALLS_SUPPORTED = !IS_FIREFOX;
