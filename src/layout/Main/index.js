import React from "react";
import MainToolbar from "./MainToolbar";
import { connect } from 'react-redux'

const Main = ({ cssMain, styleMain }) => {
  return (
    <>
    <div className={cssMain} style={styleMain}>
      <MainToolbar />
    </div>
    </>
  );
};

export default Main;