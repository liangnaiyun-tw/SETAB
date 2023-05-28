import React from "react";
import MainToolbar from "./MainToolbar";

const Main = ({ cssMain, styleMain }) => {
  return (
    <div className={cssMain} style={styleMain}>
      <MainToolbar />
    </div>
  );
};

export default Main;