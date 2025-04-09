import React from "react";

interface ModalCalendarProps {
  date?: string;
}

const ModalLinkPreview: React.FC<ModalCalendarProps> = ({ date }) => (
  <div>
    <h2>Calendar Modal</h2>
    <p>Selected Date: {date || "None"}</p>
  </div>
);

export default ModalLinkPreview;
