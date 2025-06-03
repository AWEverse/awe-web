import React, { Children, useState } from "react";
import "./ExpandedFolders.scss";

type Tuple<
  T,
  N extends number,
  R extends unknown[] = [],
> = R["length"] extends N ? R : Tuple<T, N, [T, ...R]>;

interface ExpandedFoldersProps {
  color?: string;
  size?: number;
  children?: Tuple<React.ReactNode, 3>;
  className?: string;
}

const darkenColor = (hex: string, percent: number): string => {
  let color = hex.startsWith("#") ? hex.slice(1) : hex;
  if (color.length === 3) {
    color = color
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const num = parseInt(color, 16);
  const adjust = (channel: number) =>
    Math.max(0, Math.min(255, Math.floor(channel * (1 - percent))));
  const r = adjust((num >> 16) & 0xff);
  const g = adjust((num >> 8) & 0xff);
  const b = adjust(num & 0xff);
  return (
    "#" +
    ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
  );
};

const ExpandedFolders: React.FC<ExpandedFoldersProps> = ({
  color = "#00d8ff",
  size = 1,
  children,
  className = "",
}) => {
  const maxItems = 3;
  const _children = children?.slice(0, maxItems);

  const [open, setOpen] = useState(false);
  const [paperOffsets, setPaperOffsets] = useState<{ x: number; y: number }[]>(
    Array.from({ length: maxItems }, () => ({ x: 0, y: 0 })),
  );

  const folderBackColor = darkenColor(color, 0.08);
  const paper1 = darkenColor("#ffffff", 0.1);
  const paper2 = darkenColor("#ffffff", 0.05);
  const paper3 = "#ffffff";

  const handleClick = () => {
    setOpen((prev) => !prev);
    if (open) {
      setPaperOffsets(Array.from({ length: maxItems }, () => ({ x: 0, y: 0 })));
    }
  };

  const folderStyle: React.CSSProperties = {
    "--folder-color": color,
    "--folder-back-color": folderBackColor,
    "--paper-1": paper1,
    "--paper-2": paper2,
    "--paper-3": paper3,
  } as React.CSSProperties;

  return (
    <div style={{ transform: `scale(${size})` }} className={className}>
      <div
        className={`folder ${open ? "open" : ""}`.trim()}
        style={folderStyle}
        onClick={handleClick}
      >
        <div className="folder__back">
          {Children.map(_children, (child, i) => (
            <div
              key={i}
              className={`paper paper-${i + 1}`}
              style={
                open
                  ? ({
                      "--magnet-x": `${paperOffsets[i]?.x || 0}px`,
                      "--magnet-y": `${paperOffsets[i]?.y || 0}px`,
                    } as React.CSSProperties)
                  : undefined
              }
            >
              {child}
            </div>
          ))}
          <div className="folder__front"></div>
          <div className="folder__front right"></div>
        </div>
      </div>
    </div>
  );
};

export default ExpandedFolders;
