import { motion, AnimatePresence } from "framer-motion";
import React, { FC, useReducer, useMemo, JSX, useCallback } from "react";
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
  FormatItalic,
  FormatQuote,
  HorizontalRule,
  Link,
  List,
  SendRounded,
  Tag,
  Title,
  Image,
  TableChartOutlined,
  MicRounded,
  ViewHeadline,
} from "@mui/icons-material";
import EmotionPicker from "./EmotionPickers";
import PinnedMessageButton from "../../common/PinnedMessageButton";
import { parseMarkdownToOutput } from "@/entities/markdown-input/lib/engine/parser/parseMarkdownToOutput";

const validateMessage = (text: string): true | string =>
  text.length <= 2000 || "Message is too long";

const toolbarAnimation = {
  initial: { opacity: 0, y: 10, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 10, scale: 0.95 },
  transition: { duration: 0.075, ease: "easeInOut" },
};

const markdownIcons: Record<
  string,
  { icon: JSX.Element; elements: MarkdownElementType[] }
> = {
  text: { icon: <ViewHeadline />, elements: ["plain", "paragraph"] },
  heading: { icon: <Title />, elements: ["heading"] },
  formatting: {
    icon: <FormatItalic />,
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
    if (!isSel) dispatch({ readyToModify: false });
  });

  const [injector, setInjector] = React.useState<
    ((type: MarkdownElementType) => void) | null
  >(null);

  const toolbarItems = useMemo(
    () =>
      Object.entries(markdownIcons).map(([key, { icon, elements }]) => (
        <IconButton
          key={key}
          size="small"
          onClick={() => {
            if (injector && elements && elements.length > 0) {
              injector(elements[0]);
            }
          }}
        >
          {icon}
        </IconButton>
      )),
    [injector],
  );

  const handleReadyClick = useStableCallback(() => {
    dispatch({ readyToModify: !readyToModify });
  });

  const handleSubmit = useCallback(async () => {
    if (!value.trim()) return;
    const parsed = await parseMarkdownToOutput(value);
    onSubmit(parsed);
  }, [value, onSubmit]);

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
              initial="initial"
              animate="animate"
              exit="exit"
              variants={toolbarAnimation}
            >
              <div className="MiddleInputPortalWrapper">
                <ActionButton
                  className="MiddleInputReadyButton"
                  onClick={handleReadyClick}
                  size="sm"
                >
                  <span className="MiddleInputReadyButtonText">{"Done"}</span>
                </ActionButton>

                <div className="MiddleInputToolbarSeparator"> </div>

                {toolbarItems}
              </div>
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
        <IconButton size="large" variant="outlined" onClick={handleSubmit}>
          {hasValue ? <SendRounded /> : <MicRounded />}
        </IconButton>
      </div>
    </div>
  );
};

export default React.memo(MiddleInput);
