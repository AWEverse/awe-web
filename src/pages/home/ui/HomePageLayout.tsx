import { FC, ReactNode } from "react";

import s from "./HomePageLayout.module.scss";

interface OwnProps {
  children: ReactNode;
}

const HomePageLayout: FC<OwnProps> = ({ children }) => {
  return <div className={s.HomePageLayout}>{children}</div>;
};

export default HomePageLayout;
