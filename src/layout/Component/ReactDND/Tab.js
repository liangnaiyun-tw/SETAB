import React from 'react';
import "./Tab.css"
import { useDrag, useDrop } from 'react-dnd';
import { ItemTypes } from './ItemType';
import { setStructure } from "../../../features/dnd/DndSlice";
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardContent, CardActions, IconButton } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PauseOutlinedIcon from '@mui/icons-material/PauseOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import WindowIcon from '@mui/icons-material/Window';
import { closeChromeTab, createChromeTab, freezeChromeTab, reloadChromeTab } from '../../../features/chromeTabs/chromeTabSlice';
import { createTab } from '../../../features/firebase/firestore/firestoreSlice';


const Tab = ({ tab }) => {

  const { structure } = useSelector(store => store.dnd);
  const firestore = useSelector(store => store.firestore);

  const index = tab.index;
  const id = tab.id;

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.Tab,
    item: () => ({ ...tab }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging
    })
  })

  const dispatch = useDispatch();

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: [ItemTypes.Tab, ItemTypes.Group],
    drop: (item, monitor) => {
      let newStructure = JSON.parse(JSON.stringify(structure));
      let droppedTab = newStructure[tab.id];
      let currentGroup = newStructure[tab.group];

      if (monitor.isOver({ shallow: true })) {
        if (item.type === 'group') {
          let originGroup = newStructure[item.parent];
          let draggedGroup = newStructure[item.id];


          if (currentGroup.id === originGroup.id) {
            currentGroup.childs.splice(draggedGroup.index, 0);
            for (let i = 0; i < currentGroup.childs.length; i++) {
              newStructure[currentGroup.childs[i]].index = i
            }
            currentGroup.childs.splice(droppedTab.index, 0, draggedGroup);
            for (let i = 0; i < currentGroup.childs.length; i++) {
              newStructure[currentGroup.childs[i]].index = i
            }

          } else {
            originGroup.childs = originGroup.childs.filter(child => child !== item.id);
            originGroup.groups = originGroup.groups.filter(group => group !== item.id);

            draggedGroup.parent = currentGroup.id;
            currentGroup.childs = [...currentGroup.childs.slice(0, index), draggedGroup.id, ...currentGroup.childs.slice(index)];

            for (let i = 0; i < originGroup.childs.length; i++) {
              newStructure[originGroup.childs[i]].index = i;
            }
            for (let i = 0; i < currentGroup.childs.length; i++) {
              newStructure[currentGroup.childs[i]].index = i;
            }

            // await dispatch(updateGroupToGroup())
          }

        } else {

          let originGroup = newStructure[item.group];
          let draggedTab = newStructure[item.id];

          if (currentGroup.id === originGroup.id) {
            if (currentGroup.childs.length !== 1) {
              currentGroup.childs.splice(draggedTab.index, 0);
              for (let i = 0; i < currentGroup.childs.length; i++) {
                newStructure[currentGroup.childs[i]].index = i
              }
              currentGroup.childs.splice(droppedTab.index, 0, draggedTab);
              for (let i = 0; i < currentGroup.childs.length; i++) {
                newStructure[currentGroup.childs[i]].index = i
              }
            }

          } else {
            originGroup.childs = originGroup.childs.filter(child => child !== item.id);
            originGroup.tabs = originGroup.tabs.filter(tab => tab !== item.id);

            draggedTab.group = currentGroup.id;
            currentGroup.childs = [...currentGroup.childs.slice(0, droppedTab.index), draggedTab.id, ...currentGroup.childs.slice(droppedTab.index)];

            for (let i = 0; i < originGroup.childs.length; i++) {
              newStructure[originGroup.childs[i]].index = i;
            }
            for (let i = 0; i < currentGroup.childs.length; i++) {
              newStructure[currentGroup.childs[i]].index = i;
            }
            // await dispatch(updateTabToGroup())
          }
        }
        dispatch(setStructure(newStructure));

      }

      // if(dropped) return;
      // case 1 item is tab
      // case 1-1 same group
      // case 1-2 different group => 

      // case 2 item is group
      // case 2-1 same group
      // case 2-2 different group
      // console.log(dropped);
      // dispatch(setDroppedStatus(true));
      // console.log(monitor.isOver());
    },
    canDrop: (item, monitor) => {
      return true;
    },
    isOver: monitor => {
      isOver: monitor.isOver();
      canDrop: monitor.canDrop();
    }
  })

  function attachRef(el) {
    drag(el)
    drop(el)
  }


  function getTabStatus() {
    if (tab.status === "unloaded") {
      return "freeze";
    } else if (tab.tabId === -1) {
      return "close";
    } else {
      return "open"
    }
  }

  function getStatusElement() {
    let status = getTabStatus();
    if (status === "freeze") {
      return (
        <>
          <div>Freezed</div>
        </>
      );
    } else if (status === "close") {
      return (
        <>
          <div>Closed</div>
        </>
      );
    } else {
      return (
        <>
          <div>Opened</div>
        </>
      );
    }
  }

  function openNewTabEvent() {
    if (tab.tabId !== -1) {
      dispatch(reloadChromeTab(tab));
    } else {
      dispatch(createChromeTab(tab));
    }
  }

  function freezeTabEvent() {
    dispatch(freezeChromeTab(tab));
  }

  function closeTabEvent() {
    dispatch(closeChromeTab(tab));
  }


  return (
    <div className='tab-card-container' ref={attachRef} data-status={getTabStatus()}>
      <Card className='TabCard' data-unsaved={tab.group === firestore.workspaces[0].id} sx={{ backgroundColor: "#606060", color: "white" }}>
        <CardContent>
          <div className='tab-card-content' data-unsaved={tab.group === firestore.workspaces[0].id}>
            {tab.tabIconUrl.length > 0
              ? <img src={tab.tabIconUrl} alt="tab icon" width="24" height="24"></img>
              : <WindowIcon sx={{ color: "#ccccd7" }}></WindowIcon>}
            <div className='tab-card-content-text'>{tab.alias}</div>
          </div>
          <div className='tab-card-content-2'>
            {getStatusElement()}
          </div>
        </CardContent>

        <CardActions disableSpacing>
          <IconButton onClick={openNewTabEvent}>
            <OpenInNewIcon sx={{ color: "#ccccd7" }}></OpenInNewIcon>
          </IconButton>

          <IconButton onClick={freezeTabEvent}>
            <PauseOutlinedIcon sx={{ color: "#ccccd7" }}></PauseOutlinedIcon>
          </IconButton>

          <IconButton onClick={closeTabEvent}>
            <DeleteIcon sx={{ color: "#ccccd7" }}></DeleteIcon>
          </IconButton>
        </CardActions>
      </Card>
    </div>
  );
}

export default Tab;
