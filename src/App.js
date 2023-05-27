import React, { useState } from "react";
import { Provider } from "react-redux";
import { tabStore } from "./store/tabStore";
import "./App.css";

import Draggable from "react-draggable";

import LeftSidebar from "./layout/LeftSidebar";
import Main from "./layout/Main";
import RightSidebar from "./layout/RightSidebar";
import ViewDrawer from "./layout/ViewDrawer";

// Roboto font
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

function App() {
  const [positionFirst, setPositionFirst] = useState({ positionFirstX: 0 });
  const [positionSecond, setPositionSecond] = useState({ positionSecondX: 0 });

  const onDragFirst = (e, data) => {
    setPositionFirst({ positionFirstX: data.x });
  };
  const onDragSecond = (e, data) => {
    setPositionSecond({ positionSecondX: data.x });
  };

  const styleLeftSidebar = {
    backgroundColor: "#202020",
    width: positionFirst.positionFirstX + 500,
  };
  const styleMain = {
    backgroundColor: "beige",
  };
  const styleRightSidebar = {
    backgroundColor: "aquamarine",
    width: 500 - positionSecond.positionSecondX,
  };

  return (
    <Provider store={tabStore}>
      <div className="app">
        <LeftSidebar cssLeftSidebar="leftSidebar" styleLeftSidebar={styleLeftSidebar} />
        <Draggable
          defaultPosition={{ x: 0, y: 0 }}
          position={{ x: positionFirst.positionFirstX }}
          onDrag={onDragFirst}
        >
          <div>
            <ViewDrawer cssDrawer="drawerFirst" cssHandle="handleFirst" />
          </div>
        </Draggable>

        <Main cssMain="main" styleMain={styleMain} />

        <Draggable
          defaultPosition={{ x: 0, y: 0 }}
          position={{ x: positionSecond.positionSecondX }}
          onDrag={onDragSecond}
        >
          <div>
            <ViewDrawer cssDrawer="drawerSecond" cssHandle="handleSecond" />
          </div>
        </Draggable>
        <RightSidebar
          cssRightSidebar="rightSidebar"
          styleRightSidebar={styleRightSidebar}
        />
      </div>
    </Provider>
  );
}

export default App;
