import React, { useEffect, useState } from "react";
import "./App.css";

// firebase
import app from "./shared/Firebase";

import Draggable from "react-draggable";

import LeftSidebar from "./layout/LeftSidebar";
import Main from "./layout/Main";
import RightSidebar from "./layout/RightSidebar";
import ViewDrawer from "./layout/ViewDrawer";
import styled from "@xstyled/styled-components";

// Roboto font
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

// redux
import { useDispatch, useSelector } from "react-redux";
import { initLogin } from "./features/firebase/auth/authSlice";
import { loadStructureByUser } from "./features/firebase/firestore/firestoreSlice";


app();

function App() {



  const { user } = useSelector((store) => store.auth);
  const [positionFirst, setPositionFirst] = useState({ positionFirstX: 0 });
  const [positionSecond, setPositionSecond] = useState({ positionSecondX: 0 });

  const onDragFirst = (e, data) => {
    setPositionFirst({ positionFirstX: data.x });
  };
  const onDragSecond = (e, data) => {
    setPositionSecond({ positionSecondX: data.x });
  };

  const Container = styled.div`
    overflow-x: auto;
    display: grid;
    width: 100%;
  `;

  const styleLeftSidebar = {
    backgroundColor: "#202020",
    // width: positionFirst.positionFirstX + 500,
    width: 500
  };
  const styleMain = {
    backgroundColor: "#202020",
    color: "white"
  };
  const styleRightSidebar = {
    backgroundColor: 'rgba(108, 101, 133, 1)',
    // width: 500 - positionSecond.positionSecondX,
    width: 500,
    overflowY: "hidden"
  };
  const styleFooter = {
    height: "5vh",
    backgroundColor: "#7E1717",
    textAlign: "center",
    lineHeight: "5vh",
    color: "white"
  };

  const dispatch = useDispatch();

  useEffect(() => {
    if (!user) {
      dispatch(initLogin());
    }
  }, [dispatch, user])

  useEffect(() => {
    dispatch(loadStructureByUser());
  }, [dispatch, user])


  return (
    <>
      <div className="app">
        <LeftSidebar cssLeftSidebar="leftSidebar" styleLeftSidebar={styleLeftSidebar} />
        {/* <Draggable
          defaultPosition={{ x: 0, y: 0 }}
          position={{ x: positionFirst.positionFirstX }}
          onDrag={onDragFirst}
        >
          <div>
            <ViewDrawer cssDrawer="drawerFirst" cssHandle="handleFirst" />
          </div>
        </Draggable> */}
        <Container>
          <Main cssMain="main" styleMain={styleMain} />
        </Container>
        {/* <Draggable
          defaultPosition={{ x: 0, y: 0 }}
          position={{ x: positionSecond.positionSecondX }}
          onDrag={onDragSecond}
        >
          <div>
            <ViewDrawer cssDrawer="drawerSecond" cssHandle="handleSecond" />
          </div>
        </Draggable> */}
        <RightSidebar
          cssRightSidebar="rightSidebar"
          styleRightSidebar={styleRightSidebar}
        />
      </div>
      <div style={styleFooter}>
        Copyright © 2023 SETab Team.
      </div>
    </>
  );
}

export default App;
