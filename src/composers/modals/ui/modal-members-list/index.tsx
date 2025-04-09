import React from "react";
import { ModalCommonProps } from "../registry";

interface ModalMembersProps {
  date?: string;
}

const ModalMembersList: React.FC<ModalMembersProps & ModalCommonProps> = ({
  onClose,
  date,
}) => (
  <div>
    <h2>Calendar Modal</h2>
    <p>Selected Date: {date || "None"}</p>
    <button onClick={onClose}>Close</button>
  </div>
);

export default ModalMembersList;
