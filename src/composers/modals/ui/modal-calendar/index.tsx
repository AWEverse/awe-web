import React from "react";
import { ModalCommonProps } from "../registry";

interface ModalCalendarProps {
  date?: string;
}

const ModalCalendar: React.FC<ModalCalendarProps & ModalCommonProps> = ({
  onClose,
  date,
}) => (
  <div>
    <h2>Calendar Modal</h2>
    <p>Selected Date: {date || "None"}</p>
    <button onClick={onClose}>Close</button>
  </div>
);

export default ModalCalendar;
