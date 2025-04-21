import Square from "@/entities/album-layout/ui/Square";
import { FC, ReactNode } from "react";

interface OwnProps {
  children: ReactNode;
}

interface StateProps {}

const MediaSection: FC<OwnProps & StateProps> = () => {
  return (
    <>
      <Square currentColumn={3}>
        {Array.from({ length: 30 }, (_, i) => (
          <img
            key={i}
            alt=""
            src="https://picsum.photos/200"
            style={{
              width: "100%",
              height: "100%",
              padding: "1px",
              borderRadius: "10px",
            }}
          />
        ))}
      </Square>
    </>
  );
};

export default MediaSection;
