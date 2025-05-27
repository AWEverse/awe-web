import { FC, ReactNode } from "react";
import SubCategoryHeader from "./SubCategoryHeader";

interface OwnProps {
  children: ReactNode;
}

interface StateProps {}

const SubCategory: FC<OwnProps & StateProps> = () => {
  return (
    <div>
      <SubCategoryHeader />
    </div>
  );
};

export default SubCategory;
