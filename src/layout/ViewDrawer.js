import React from "react";

const ViewDrawer = ({ cssDrawer, cssHandle }) => {
  return (
    <div className={cssDrawer}>
      <div className={cssHandle}></div>
    </div>
  );
};

export default ViewDrawer;