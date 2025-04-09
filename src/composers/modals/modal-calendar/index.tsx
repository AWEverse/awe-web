import { DatePicker } from "@/entities/date-picker";
import React from "react";

interface ModalCalendarProps {
  date?: string;
  onClose?: NoneToVoidFunction;
}

const ModalCalendar: React.FC<ModalCalendarProps> = ({ onClose, date }) => (
  <DatePicker />
);

export default ModalCalendar;
