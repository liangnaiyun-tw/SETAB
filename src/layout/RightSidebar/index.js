import React from "react";
import { SystemMemoryUsage } from "./SystemMemoryUsage";

const RightSidebar = ({ cssRightSidebar, styleRightSidebar }) => {
  return (
    <div className={cssRightSidebar} style={styleRightSidebar}>
      RightSidebar
      <SystemMemoryUsage></SystemMemoryUsage>
    </div>
  );
};

export default RightSidebar;