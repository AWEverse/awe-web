import React from "react";
import { ModalCommonProps } from "../registered";

interface ModalMembersProps {
  member?: string[];
}

const ModalMembersList: React.FC<ModalMembersProps & ModalCommonProps> = ({
  onClose,
  member,
}) => (
  <div>
    <h2>Calendar Modal</h2>
    <p>Selected Date: {member?.toString() || "None"}</p>
    <button onClick={onClose}>Close</button>
  </div>
);

export default ModalMembersList;
