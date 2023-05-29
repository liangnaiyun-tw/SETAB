import './index.css';
import React from "react";
import { SystemMemoryUsage } from "./SystemMemoryUsage";

const RightSidebar = ({ cssRightSidebar, styleRightSidebar }) => {
  return (
    <div className={cssRightSidebar} style={styleRightSidebar}>
      <SystemMemoryUsage></SystemMemoryUsage>
    </div>
  );
};

export default RightSidebar;