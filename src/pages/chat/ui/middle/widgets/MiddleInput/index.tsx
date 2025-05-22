import { motion, AnimatePresence } from "framer-motion";
import React, { FC, useReducer, useMemo, JSX, lazy, Suspense } from "react";
import "./index.scss";
import { useStableCallback } from "@/shared/hooks/base";
import {
  MarkdownInput,
  MarkdownOutput,
  MarkdownElementType,
} from "@/entities/markdown-input";
import IconButton from "@/shared/ui/IconButton";
import ActionButton from "@/shared/ui/ActionButton";
import {
  AlternateEmail,
  Code,
  EmojiEmotions,
  FormatBold,
  FormatItalic,
  FormatQuote,
  HorizontalRule,
  Link,
  List,
  SendRounded,
  Tag,
  TextFields,
  Title,
  Image,
  TableChartOutlined,
  EmojiPeopleRounded,
  AddReaction,
  AddReactionTwoTone,
  SendOutlined,
  MicRounded,
} from "@mui/icons-material";

import "./index.scss";
import Dropdown, { TriggerProps } from "@/shared/ui/dropdown";

import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import EmotionPicker from "./EmotionPickers";
import PinnedMessageButton from "../../common/PinnedMessageButton";

// Validation helper for message length
const validateMessage = (text: string): true | string =>
  text.length <= 2000 || "Message is too long";

// Animation variants for toolbar icons
const toolbarAnimation = {
  initial: { opacity: 0, y: 10, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 10, scale: 0.95 },
  transition: { duration: 0.075, ease: "easeInOut" },
};

// Define mapping for markdown element groups
const markdownIcons: Record<
  string,
  { icon: JSX.Element; elements: MarkdownElementType[] }
> = {
  text: { icon: <TextFields />, elements: ["plain", "paragraph"] },
  heading: { icon: <Title />, elements: ["heading"] },
  formatting: {
    icon: (
      <>
        <FormatBold />
        <FormatItalic />
      </>
    ),
    elements: ["bold", "italic"],
  },
  code: { icon: <Code />, elements: ["code"] },
  quote: { icon: <FormatQuote />, elements: ["blockquote"] },
  link: { icon: <Link />, elements: ["link"] },
  image: { icon: <Image />, elements: ["image"] },
  list: { icon: <List />, elements: ["list", "listItem"] },
  table: {
    icon: <TableChartOutlined />,
    elements: ["table", "tableHeader", "tableRow", "tableCell"],
  },
  hr: { icon: <HorizontalRule />, elements: ["horizontalRule"] },
  mention: { icon: <AlternateEmail />, elements: ["mention"] },
  hashtag: { icon: <Tag />, elements: ["hashtag"] },
  emoji: { icon: <EmojiEmotions />, elements: ["emoji"] },
};

interface State {
  value: string;
  hasSelection: boolean;
  readyToModify: boolean;
}

const initialState: State = {
  value: "",
  hasSelection: false,
  readyToModify: false,
};

const reducer = (state: State, action: Partial<State>): State => ({
  ...state,
  ...action,
});

const MiddleInput: FC = () => {
  const [{ value, hasSelection, readyToModify }, dispatch] = useReducer(
    reducer,
    initialState,
  );

  const hasValue = Boolean(value.trim());

  const onChange = useStableCallback((text: string) => {
    dispatch({ value: text });
  });

  const onSubmit = useStableCallback((data: string | MarkdownOutput) => {
    console.log("Submitted:", data);
    dispatch({ value: "", readyToModify: false, hasSelection: false });
  });

  const onSelect = useStableCallback((selected: string) => {
    const isSel = Boolean(selected);
    dispatch({ hasSelection: isSel });
    // Show toolbar when selection and allow modification toggle
    if (!isSel) dispatch({ readyToModify: false });
  });

  // Memoize toolbar items for performance
  const toolbarItems = useMemo(
    () =>
      Object.entries(markdownIcons).map(([key, { icon }]) => (
        <IconButton key={key} size="small">
          {icon}
        </IconButton>
      )),
    [],
  );

  const handleReadyClick = useStableCallback(() => {
    dispatch({ readyToModify: !readyToModify });
  });

  return (
    <div className="MiddleInput allow-space-right-column-messages">
      <div className="MiddleInputPortal allow-space-right-column-messages">
        <AnimatePresence initial={false} mode={"wait"}>
          {hasSelection && !readyToModify && (
            <motion.div
              key={"selection-actions"}
              className="selection-actions"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={toolbarAnimation}
            >
              <ActionButton
                onClick={handleReadyClick}
                size="sm"
                variant="contained"
              >
                {"Edit Selection"}
              </ActionButton>
            </motion.div>
          )}

          {hasSelection && readyToModify && (
            <motion.div
              key={"toolbar-items"}
              className="MiddleInputPortalWrapper"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={toolbarAnimation}
            >
              <ActionButton
                className="MiddleInputReadyButton"
                onClick={handleReadyClick}
                size="sm"
              >
                <span className="MiddleInputReadyButtonText">{"Done"}</span>
              </ActionButton>

              <div className="MiddleInputToolbarSeparator">&nbsp;</div>

              {toolbarItems}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <section className="MiddleInputComposer">
        <div className="MiddleInputComposerHelper">
          <PinnedMessageButton activeIndex={0} />
        </div>
        <div className="MiddleInputComposerField">
          <EmotionPicker />

          <MarkdownInput
            className="MiddleInputInputField"
            value={value}
            onChange={onChange}
            onSubmit={onSubmit}
            onSelect={onSelect}
            validate={validateMessage}
            placeholder="Type your message..."
            autoFocus
            minHeight={40}
            maxHeight={200}
          />
        </div>
      </section>
      <div className="MiddleInputActions">
        <IconButton
          size="large"
          variant="outlined"
          onClick={() => onSubmit(value)}
        >
          {hasValue ? <SendRounded /> : <MicRounded />}
        </IconButton>
      </div>
    </div>
  );
};

export default React.memo(MiddleInput);
