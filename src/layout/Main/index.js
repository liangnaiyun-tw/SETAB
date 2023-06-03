import React from "react";
import MainTab from "../Component/MainTab/MainTab"
import "./index.css"

import Typography from '@mui/material/Typography';
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



  const handleBreadCrumbClick = (id, isWorkspace) => {
    if (isWorkspace) {
      dispatch(setCurrentGroup([]));
    } else {
      let index;
      for (let i = 0; i < currentGroup.length; i++) {
        if (currentGroup[i] === id){
          index = i;
          break;
        } 
      }
      dispatch(setCurrentGroup(currentGroup.slice(0, index + 1)));
    }
  }

  return (
    <>
      <div className={cssMain} style={styleMain}>
        <div role="presentation" onClick={handleClick}>
          <Breadcrumbs aria-label="breadcrumb" className="Breadcrumbs">
            {
              <Link onClick={() => { handleBreadCrumbClick(currentWorkspace, true)}} underline="hover" color="inherit" href="/">
                {
                  workspaces.filter(workspace => workspace.id === currentWorkspace)[0].name
                }
              </Link>
            }
            {
              currentGroup.length !== 0 ?
                currentGroup.map((groupId) => groups.filter(group => group.id === groupId)[0])
                .map((group) => 
                    (<Link key={group.id} onClick={() => {handleBreadCrumbClick(group.id, false)}} underline="hover" color="inherit" href="/">
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