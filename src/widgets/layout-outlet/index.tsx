import { Outlet } from "react-router";
import "./index.scss";
import { ScrollProvider } from "@/shared/context";
import { useRef } from "react";

const LayoutOutlet = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <ScrollProvider containerRef={containerRef}>
      <div className="LayoutOutlet">
        <div className={"LayoutHeader"}>
          <h1>Layout Outlet</h1>
        </div>
        <div data-scrolled={true} className={"LayoutBody"}>
          <Outlet />
        </div>
      </div>
    </ScrollProvider>
  );
};

export default LayoutOutlet;
