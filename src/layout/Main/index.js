import React, { useEffect, useState } from "react";
import MainTab from "../Component/MainTab/MainTab"
import "./index.css"

import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import { useSelector, useDispatch } from "react-redux";
import { setCurrentGroup } from "../../features/firebase/firestore/firestoreSlice";



function handleClick(event) {
  event.preventDefault();
  console.info('You clicked a breadcrumb.');
}

const Main = ({ cssMain, styleMain, token }) => {

  const { workspaces, groups, currentWorkspace, currentGroup } = useSelector((store) => store.firestore);
  const dispatch = useDispatch();
  const [workspaceName, setWorkspaceName] = useState("");

  const handleBreadCrumbClick = (id, isWorkspace) => {
    if (isWorkspace) {
      dispatch(setCurrentGroup([]));
    } else {
      let index;
      for (let i = 0; i < currentGroup.length; i++) {
        if (currentGroup[i] === id) {
          index = i;
          break;
        }
      }
      dispatch(setCurrentGroup(currentGroup.slice(0, index + 1)));
    }
  }

  useEffect(() => {
    const workspace = workspaces.filter(workspace => workspace.id === currentWorkspace)[0];
    if (workspace) {
      setWorkspaceName(workspace.name)
    }
    console.log("CURRENT GROUP");
    console.log(currentGroup);
  }, [currentWorkspace, workspaces, currentGroup])

  return (
    <>
      <div className={cssMain} style={styleMain}>
        <div role="presentation" onClick={handleClick}>
          <Breadcrumbs aria-label="breadcrumb" className="Breadcrumbs" style={{ color: "whitesmoke", fontSize: "large", marginBottom: "1rem" }}>
            {

              <Link onClick={() => { handleBreadCrumbClick(currentWorkspace, true) }} underline="hover" color="white" href="/">
                {
                  workspaceName
                }
              </Link>
            }
            {
              currentGroup.length !== 0 ?
                currentGroup.map((groupId) => groups.filter(group => group.id === groupId)[0])
                  .map((group) =>
                  (<Link key={group.id} onClick={() => { handleBreadCrumbClick(group.id, false) }} underline="hover" color="white" href="/">
                    {group.name}
                  </Link>)
                  ) : null
            }
          </Breadcrumbs>
        </div>
        <MainTab token={token} />
      </div>
    </>
  );
};

export default Main;