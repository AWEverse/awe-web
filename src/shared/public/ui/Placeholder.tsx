import { FC, useMemo } from "react";
import buildClassName from "../lib/buildClassName";
import { getPlatformInfo } from "@/lib/core";

const obfuscateForSafari = (text: string): string => {
  let result = "";
  const ZERO_WIDTH_SPACE = "\u200B";

  for (let i = 0, len = text.length; i < len; ++i) {
    result += text[i] + ZERO_WIDTH_SPACE;
  }

  return result;
};

const isSafari = getPlatformInfo("isSafari");

interface PlaceholderProps {
  children: string;
  className?: string;
  showText: boolean;
}

const Placeholder: FC<PlaceholderProps> = ({
  children,
  className,
  showText,
}) => {
  const shouldShow = showText && children.length > 0;

  const content = useMemo(
    () => (isSafari ? obfuscateForSafari(children) : children),
    [children],
  );

  return (
    <span
      inert
      role="presentation"
      aria-hidden="true"
      className={buildClassName(className, "placeholder")}
      style={{
        display: shouldShow ? "inline" : "none",
        userSelect: "none",
        pointerEvents: "none",
      }}
    >
      {content}
    </span>
  );
};

export default Placeholder;
