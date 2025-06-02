/**
 * Toolbar component for WYSIWYG editor
 * Provides quick access to markdown formatting options
 */

import React, { memo, useCallback, useMemo } from "react";
import buildClassName from "@/shared/public/lib/buildClassName";
import { MarkdownElementType } from "@/shared/public/markdown/public/MarkdownTypes";
import s from "./WysiwygToolbar.module.scss";

interface ToolbarButton {
  type: MarkdownElementType;
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  group?: string;
}

interface WysiwygToolbarProps {
  onAction: (type: MarkdownElementType) => void;
  disabled?: boolean;
  compact?: boolean;
  showLabels?: boolean;
  className?: string;
  customButtons?: ToolbarButton[];
  excludeButtons?: MarkdownElementType[];
}

// Default toolbar configuration
const DEFAULT_BUTTONS: ToolbarButton[] = [
  {
    type: "bold",
    icon: <strong>B</strong>,
    label: "Bold",
    shortcut: "Ctrl+B",
    group: "formatting",
  },
  {
    type: "italic",
    icon: <em>I</em>,
    label: "Italic",
    shortcut: "Ctrl+I",
    group: "formatting",
  },
  {
    type: "code",
    icon: <code>{`</>`}</code>,
    label: "Code",
    shortcut: "Ctrl+E",
    group: "formatting",
  },
  {
    type: "link",
    icon: "🔗",
    label: "Link",
    shortcut: "Ctrl+K",
    group: "formatting",
  },
  {
    type: "heading1",
    icon: "H1",
    label: "Heading 1",
    shortcut: "Ctrl+1",
    group: "headings",
  },
  {
    type: "heading2",
    icon: "H2",
    label: "Heading 2",
    shortcut: "Ctrl+2",
    group: "headings",
  },
  {
    type: "heading3",
    icon: "H3",
    label: "Heading 3",
    shortcut: "Ctrl+3",
    group: "headings",
  },
  {
    type: "blockquote",
    icon: "❝",
    label: "Quote",
    shortcut: "",
    group: "blocks",
  },
  {
    type: "list",
    icon: "• ",
    label: "List",
    shortcut: "",
    group: "blocks",
  },
  {
    type: "horizontalRule",
    icon: "─",
    label: "Divider",
    shortcut: "",
    group: "blocks",
  },
  {
    type: "image",
    icon: "🖼️",
    label: "Image",
    shortcut: "",
    group: "media",
  },
];

const WysiwygToolbar: React.FC<WysiwygToolbarProps> = ({
  onAction,
  disabled = false,
  compact = false,
  showLabels = false,
  className,
  customButtons,
  excludeButtons = [],
}) => {
  // Filter and merge buttons
  const buttons = useMemo(() => {
    const baseButtons = customButtons || DEFAULT_BUTTONS;
    return baseButtons.filter(
      (button) => !excludeButtons.includes(button.type),
    );
  }, [customButtons, excludeButtons]);

  // Group buttons for better organization
  const groupedButtons = useMemo(() => {
    const groups: Record<string, ToolbarButton[]> = {};

    buttons.forEach((button) => {
      const group = button.group || "misc";
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(button);
    });

    return groups;
  }, [buttons]);

  const handleButtonClick = useCallback(
    (type: MarkdownElementType) => {
      if (!disabled) {
        onAction(type);
      }
    },
    [onAction, disabled],
  );

  const renderButton = useCallback(
    (button: ToolbarButton) => (
      <button
        key={button.type}
        type="button"
        className={buildClassName(
          s.toolbarButton,
          compact && s.compact,
          disabled && s.disabled,
        )}
        onClick={() => handleButtonClick(button.type)}
        disabled={disabled}
        title={`${button.label}${button.shortcut ? ` (${button.shortcut})` : ""}`}
        aria-label={button.label}
      >
        <span className={s.buttonIcon} aria-hidden="true">
          {button.icon}
        </span>
        {showLabels && !compact && (
          <span className={s.buttonLabel}>{button.label}</span>
        )}
      </button>
    ),
    [handleButtonClick, disabled, compact, showLabels],
  );

  const renderGroup = useCallback(
    (groupName: string, groupButtons: ToolbarButton[]) => (
      <div
        key={groupName}
        className={buildClassName(s.buttonGroup, s[`group-${groupName}`])}
        role="group"
        aria-label={`${groupName} tools`}
      >
        {groupButtons.map(renderButton)}
      </div>
    ),
    [renderButton],
  );

  return (
    <div
      className={buildClassName(
        s.toolbar,
        compact && s.compact,
        disabled && s.disabled,
        className,
      )}
      role="toolbar"
      aria-label="Formatting toolbar"
      aria-disabled={disabled}
    >
      {Object.entries(groupedButtons).map(([groupName, groupButtons]) =>
        renderGroup(groupName, groupButtons),
      )}
    </div>
  );
};

export default memo(WysiwygToolbar);
export type { ToolbarButton, WysiwygToolbarProps };
