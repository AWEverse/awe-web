import { FC, useState } from "react";

import "./index.scss";
import { useStableCallback } from "@/shared/hooks/base";
import MarkdownInput from "@/entities/markdown-input/ui/MarkdownInput";

interface OwnProps {}

interface StateProps {}

const validate = (v: string) => {
  if (v.length > 1000) {
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

  const handleSubmit = useStableCallback(() => {
    console.log("submit", value);
  });

  return (
    <div className="MiddleInput allow-space-right-column-messages">
      <MarkdownInput
        value={value}
        onChange={handleChange}
        validate={validate}
        onSubmit={handleSubmit}
        maxLength={1000}
        clearOnSubmit={true}
        placeholder="Type your message here..."
        autoFocus={false}
        minHeight={40}
        maxHeight={200}
        containerStyle={{}}
        inputStyle={{}}
        actions={null}
        renderMarkdown
      />
    </div>
  );
};

export default MiddleInput;
