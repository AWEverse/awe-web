import React, { ReactNode } from "react";
import { clamp } from "@/lib/core";
import "./DividerHorizontal.scss";

interface DividerProps {
  children?: ReactNode;
  position?: number;
  className?: string;
}

const DividerHorizontal: React.FC<DividerProps> = ({
  children,
  position = 50,
  className = "",
}) => {
  const clamped = clamp(position, 0, 100);

  return (
    <div className={`divider-container ${className}`}>
      <div className="divider-line" />
      {children && (
        <div
          className="divider-children"
          style={{
            padding: position === 0 ? "0 8px 0 0" : "0 8px",
            transform: `translateX(${clamped}%)`,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default DividerHorizontal;
