import React from 'react';
import "./Tab.css"
import { useDrag, useDrop } from 'react-dnd';
import { ItemTypes } from './ItemType';
import { setStructure } from "../../../features/dnd/DndSlice";
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardContent, CardHeader, Paper } from '@mui/material';
import WindowIcon from '@mui/icons-material/Window';


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

  const findElement = (id, parent) => {


  }

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
          let index = tab.index + 1;

          originGroup.childs = originGroup.childs.filter(child => child !== item.id);
          originGroup.groups = originGroup.groups.filter(group => group !== item.id);

          draggedGroup.parent = currentGroup.id;
          draggedGroup.index = index;
          currentGroup.childs = [...currentGroup.childs.slice(0, index), draggedGroup.id, ...currentGroup.childs.slice(index)];
          // currentGroup.group = [draggedGroup.id]

          dispatch(setStructure(newStructure));
          // for(let i=0; i<group.childs.length; i++){
          //     if(group.childs[i].index>tab.index) group.childs[i].index = group.childs[i].index+1;
          // }
          // item.index = tab.index+1;
          // item.parnet = group.id;
          // group.childs = [...group.childs.slice(0, tab.index+1), item, group.childs.slice(tab.index+1)];
          // const originGroupId = item.parent;
          // const newGroupId = tab.group;
          // if(originGroupId === newGroupId) {
          //     // same group, change index

          // }
        } else {
          const newGroupId = item.group;
        }
        console.log("Drop on group", item, tab);

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
    } else if (tab.tabId.length === 0) {
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
      </Card>
    </div>
  );
}

export default Tab;
