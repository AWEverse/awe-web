import { FC, memo } from "react";
import HomePageLayout from "./HomePageLayout";
import TopSection from "./right/TopSection";
import Square from "@/entities/album-layout/ui/Square";

interface OwnProps {}

interface StateProps {}

const HomePage: FC<OwnProps & StateProps> = () => {
  return (
    <div className="relative overflow-auto">
      <HomePageLayout>
        <Square currentColumn={1}>
          <img
            className="rounded-md"
            src="https://picfiles.alphacoders.com/289/thumb-1920-289142.jpg"
          />
          <img
            className="rounded-md"
            src="https://picfiles.alphacoders.com/289/thumb-1920-289142.jpg"
          />
          <img
            className="rounded-md"
            src="https://picfiles.alphacoders.com/289/thumb-1920-289142.jpg"
          />
          <img
            className="rounded-md"
            src="https://picfiles.alphacoders.com/289/thumb-1920-289142.jpg"
          />{" "}
          <img
            className="rounded-md"
            src="https://picfiles.alphacoders.com/289/thumb-1920-289142.jpg"
          />
          <img
            className="rounded-md"
            src="https://picfiles.alphacoders.com/289/thumb-1920-289142.jpg"
          />
          <img
            className="rounded-md"
            src="https://picfiles.alphacoders.com/289/thumb-1920-289142.jpg"
          />
          <img
            className="rounded-md"
            src="https://picfiles.alphacoders.com/289/thumb-1920-289142.jpg"
          />
        </Square>
        <TopSection />

        <Square currentColumn={2}>
          <img
            className="rounded-md"
            src="https://picfiles.alphacoders.com/289/thumb-1920-289142.jpg"
          />
          <img
            className="rounded-md"
            src="https://picfiles.alphacoders.com/289/thumb-1920-289142.jpg"
          />
          <img
            className="rounded-md"
            src="https://picfiles.alphacoders.com/289/thumb-1920-289142.jpg"
          />
          <img
            className="rounded-md"
            src="https://picfiles.alphacoders.com/289/thumb-1920-289142.jpg"
          />
        </Square>
      </HomePageLayout>
    </div>
  );
};

export default memo(HomePage);
