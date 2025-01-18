import { FC, memo } from "react";
import HomePageLayout from "./HomePageLayout";
import TopSection from "./right/TopSection";

interface OwnProps {}

interface StateProps {}

const HomePage: FC<OwnProps & StateProps> = () => {
  return (
    <HomePageLayout>
      <div>A</div>
      <TopSection />
      <div>C</div>
    </HomePageLayout>
  );
};

export default memo(HomePage);
