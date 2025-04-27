import TextArea from "@/shared/ui/TextArea";
import { FC, useState } from "react";

import "./index.scss";
import { useStableCallback } from "@/shared/hooks/base";

interface OwnProps {}

interface StateProps {}

const MiddleInput: FC<OwnProps & StateProps> = () => {
  const [value, setValue] = useState("");

  const handleChange = useStableCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setValue(e.currentTarget.value);
    },
  );

  return (
    <div className="MiddleInput allow-space-right-column-messages">
      <TextArea
        value={value}
        onChange={handleChange}
        id="middle-input"
        placeholder="Type a message"
        maxLines={9}
        tabIndex={0}
      />
    </div>
  );
};

export default MiddleInput;
