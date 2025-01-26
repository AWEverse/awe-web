import { Outlet } from "react-router-dom";
import "./index.scss";

const LayoutOutlet = () => {
  return (
    <div className="LayoutOutlet">
      <div className={"LayoutHeader"}>
        <h1>Layout Outlet</h1>
      </div>
      <div className={"LayoutBody"}>
        <Outlet />
      </div>
    </div>
  );
};

export default LayoutOutlet;
