import React from "react";
import MainTab from "../Component/MainTab/MainTab"
import "./index.css"

import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';


import MainToolbar from "./MainToolbar";
import { connect } from 'react-redux'

function handleClick(event) {
  event.preventDefault();
  console.info('You clicked a breadcrumb.');
}

const Main = ({ cssMain, styleMain, token }) => {
  return (
    <>
    <div className={cssMain} style={styleMain}>
      <div role="presentation" onClick={handleClick}>
        <Breadcrumbs aria-label="breadcrumb" className="Breadcrumbs">
          <Link underline="hover" color="inherit" href="/">
            Workspace
          </Link>
          <Link
            underline="hover"
            color="inherit"
            href="/material-ui/getting-started/installation/"
          >
            Group
          </Link>
          <Typography color="text.primary">SubGroup</Typography>
        </Breadcrumbs>
      </div>
      {/* <MainToolbar /> */}
      <MainTab token={token} />
    </div>
    </>
  );
};

export default Main;