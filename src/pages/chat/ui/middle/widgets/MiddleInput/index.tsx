import { FC, useState } from "react";

import "./index.scss";
import { useStableCallback } from "@/shared/hooks/base";
import MarkdownInput from "@/entities/markdown-input/ui/MarkdownInput";
import IconButton from "@/shared/ui/IconButton";
import { SendRounded } from "@mui/icons-material";
import { MarkdownOutput } from "@/entities/markdown-input";

interface OwnProps {}

interface StateProps {}

const validate = (v: string) => {
  if (v.length > 2000) {
    console.warn("Message is too long", v.length);
    // You can also throw an error or return a specific error object if needed
    // throw new Error("Message is too long");
    // Or return a string to indicate the error
    // return { error: "Message is too long" };
    // Or return a boolean false to indicate validation failure
    // return false;
    // Or return a string message
    //  to indicate the error
    return "Message is too long";
  }
  return true;
};

const MiddleInput: FC<OwnProps & StateProps> = () => {
  const [value, setValue] = useState("");

  const handleChange = useStableCallback((value: string) => {
    console.log("value", value);
    setValue(value);
  });

  const handleSubmit = useStableCallback((value: string | MarkdownOutput) => {
    console.log("submit", value);
  });

  return (
    <div className="MiddleInput allow-space-right-column-messages">
      <section className="MiddleInputPortal">
        <span></span>
      </section>

      <MarkdownInput
        className="MiddleInputInputField"
        value={value}
        onChange={handleChange}
        validate={validate}
        onSubmit={handleSubmit}
        maxLength={4096 + 1000} // 4096 is the max length for messages, plus 1000 for additional characters
        clearOnSubmit={true}
        placeholder="Type your message here..."
        autoFocus={false}
        minHeight={40}
        maxHeight={200}
        containerStyle={{}}
        inputStyle={{}}
        actions={null}
      />

      <section className="MiddleInputActions">
        <IconButton>
          <SendRounded />
        </IconButton>

        <div className="MiddleInputActionsWrapper">
          {/* <IconButton>
            <SendRounded />
          </IconButton>
          <IconButton>
            <SendRounded />
          </IconButton>
          <IconButton>
            <SendRounded />
          </IconButton>
          <IconButton>
            <SendRounded />
          </IconButton>
          <IconButton>
            <SendRounded />
          </IconButton>
          <IconButton>
            <SendRounded />
          </IconButton>
          <IconButton>
            <SendRounded />
          </IconButton>
          <IconButton>
            <SendRounded />
          </IconButton> */}
        </div>
      </section>
    </div>
  );
};

export default MiddleInput;
