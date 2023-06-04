// import React, { useCallback, useState } from 'react'
// import { DndProvider } from 'react-dnd'
// import { HTML5Backend } from 'react-dnd-html5-backend'
// import { Card } from './Card/Card'
// import update from 'immutability-helper'




import React, { useState, useEffect } from "react";
// import Item from "./CardItem/CardItem";
// import DropWrapper from "./DropContainer/DropContainer";
// import Col from "./Column/Column";
import { data, statuses } from "./data/data";
import { useSelector, useDispatch } from "react-redux";
import { Group } from "./Group";
import "./ReactDND.css"
import { Masonry } from "@mui/lab";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { setStructure } from "../../../features/dnd/DndSlice";
import Tab from "./Tab";
import { ItemTypes } from "./ItemType";
import { useDrop } from "react-dnd";
import { useRef } from 'react';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import { Box, SpeedDial, SpeedDialAction, SpeedDialIcon } from "@mui/material";
import OpenInFullIcon from '@mui/icons-material/OpenInFull';

const actions = [
  { icon: <UnfoldMoreIcon />, name: 'expaned' },
  { icon: <UnfoldLessIcon />, name: 'collapse' },
];


const ReactDND = () => {


  const { currentWorkspace, currentGroup, workspaces, groups, tabs } = useSelector(store => store.firestore);
  const { structure } = useSelector(store => store.dnd);
  const [allExpaned, setAllExpaned] = useState(false);

  const dispatch = useDispatch();


  useEffect(() => {
    let newRoot = {};
    currentGroup.length === 0 ?
      newRoot = workspaces.filter(workspace => workspace.id === currentWorkspace)[0] :
      newRoot = groups.filter(group => group.id === currentGroup[currentGroup.length - 1])[0];


    let newStructure = {
      root: newRoot.id,
      columns: 0
    }
    newStructure[newRoot.id] = {
      ...newRoot
    }
    if (newRoot.tabs) {
      newStructure[newRoot.id].childs = [...newRoot.tabs, ...newRoot.groups];
    } else {
      newStructure[newRoot.id].childs = [...newRoot.groups];
    }

    newStructure.columns = newStructure[newRoot.id].groups.length;
    createStructure(newStructure, newStructure[newRoot.id]);
    console.log(newStructure);
    dispatch(setStructure(newStructure));
  }, [currentWorkspace, currentGroup])

  useEffect(() => {
    let newRoot = {};
    currentGroup.length === 0 ?
      newRoot = workspaces.filter(workspace => workspace.id === currentWorkspace)[0] :
      newRoot = groups.filter(group => group.id === currentGroup[currentGroup.length - 1])[0];


    let newStructure = {
      root: newRoot.id,
      columns: 0
    }
    newStructure[newRoot.id] = {
      ...newRoot
    }
    if (newRoot.tabs) {
      newStructure[newRoot.id].childs = [...newRoot.tabs, ...newRoot.groups];
    } else {
      newStructure[newRoot.id].childs = [...newRoot.groups];
    }

    newStructure.columns = newStructure[newRoot.id].groups.length;
    createStructure(newStructure, newStructure[newRoot.id]);
    console.log(newStructure);
    dispatch(setStructure(newStructure));
  }, [])

  const createStructure = (newStructure, parent) => {
    if (parent.tabs) {
      parent.childs = [...parent.tabs, ...parent.groups];
    } else {
      parent.childs = [...parent.groups];
    }

    if (parent.childs !== undefined && parent.childs !== null) {
      parent.childs.map((id, index) => {
        let groupObj = groups.filter((group) => group.id === id)[0];
        let tabObj = tabs.filter((tab) => tab.id === id)[0];


        if (groupObj !== undefined && groupObj !== null) {
          let obj = JSON.parse(JSON.stringify(groupObj))
          obj.type = 'group';
          obj.parent = parent.id;
          obj.index = index
          createStructure(newStructure, obj);
          newStructure[obj.id] = obj
        } else if (tabObj !== undefined && tabObj !== null) {
          let obj = JSON.parse(JSON.stringify(tabObj))
          obj.type = 'tab';
          obj.index = index;
          newStructure[obj.id] = obj
        }
      })
      // parent.groups.map(group => {

      // });
    }
  }

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: [ItemTypes.Group],
    drop: (item, monitor) => {

      let newStructure = JSON.parse(JSON.stringify(structure));

      if (monitor.isOver({ shallow: true })) {
        // insert to first
        // modify origin parent group and dropped group (structure root)
        if (item.type === 'group') {
          let originParentGroup = newStructure[item.parent];
          let draggedGroup = newStructure[item.id];

          if (originParentGroup.id === newStructure.id) {
            newStructure.childs.splice(draggedGroup.index, 1);
            newStructure.childs.splice(0, 0, draggedGroup);
            for (let i = 0; i < newStructure.childs.length; i++) {
              newStructure.childs[i].index = i;
            }
          } else {
            originParentGroup.childs = originParentGroup.childs.filter(child => child !== item.id);
            originParentGroup.groups = originParentGroup.groups.filter(group => group !== item.id);

            draggedGroup.parent = newStructure.id;
            newStructure.childs = [draggedGroup.id, ...newStructure.childs];
            for (let i = 0; i < originParentGroup.childs.length; i++) {
              originParentGroup.childs[i].index = i;
            }
            for (let i = 0; i < newStructure.childs.length; i++) {
              newStructure.childs[i].index = i;
            }
          }

        }
        dispatch(setStructure(newStructure));
      }
    },
    canDrop: (item, monitor) => {
      return true;
    },
    isOver: monitor => {
      isOver: monitor.isOver();
      canDrop: monitor.canDrop();
    }
  })

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const modalGlobalHandle = (isExpaned) => {
    setAllExpaned(isExpaned);
  }

  return (
    <div className="wrapper">
      <div className="board">
        <DndProvider backend={HTML5Backend} >
          <Masonry columns={structure.columns} spacing={1} useRef={drop}>
            {structure[structure.root]?.childs.map((child) => {
              return structure[child].type === 'group' ?
                <Group group={structure[child]} allExpaned={allExpaned} /> :
                <Tab tab={structure[child]} />
            })}
          </Masonry>
        </DndProvider>

      </div>
      <Box sx={{ height: 320, transform: 'translateZ(0px)', flexGrow: 1 }}>
        <SpeedDial
          ariaLabel="SpeedDial controlled open example"
          sx={{ position: 'absolute', bottom: 16, right: 16 }}
          icon={<OpenInFullIcon />}
          onClose={handleClose}
          onOpen={handleOpen}
          open={open}
        >
          {actions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={() => { handleClose(); action.name === 'expaned' ? modalGlobalHandle(true) : modalGlobalHandle(false) }}
            />
          ))}
        </SpeedDial>
      </Box>
    </div>

  );
};

export default ReactDND;



// const style = {
//     width: 400,
//   }

// const ReactDND = () => {
//     const [cards, setCards] = useState([
//         {
//           id: 1,
//           text: 'Write a cool JS library',
//         },
//         {
//           id: 2,
//           text: 'Make it generic enough',
//         },
//         {
//           id: 3,
//           text: 'Write README',
//         },
//         {
//           id: 4,
//           text: 'Create some examples',
//         },
//         {
//           id: 5,
//           text: 'Spam in Twitter and IRC to promote it (note that this element is taller than the others)',
//         },
//         {
//           id: 6,
//           text: '???',
//         },
//         {
//           id: 7,
//           text: 'PROFIT',
//         },
//       ])

//     const moveCard = useCallback((dragIndex, hoverIndex) => {
//         setCards((prevCards) =>
//           update(prevCards, {
//             $splice: [
//               [dragIndex, 1],
//               [hoverIndex, 0, prevCards[dragIndex]],
//             ],
//           }),
//         )
//       }, [])
//       const renderCard = useCallback((card, index) => {
//         return (
//           <Card
//             key={card.id}
//             index={index}
//             id={card.id}
//             text={card.text}
//             moveCard={moveCard}
//           />
//         )
//       }, [])

//     return (
//         <DndProvider backend={HTML5Backend}>
//             <div style={style}>{cards.map((card, i) => renderCard(card, i))}</div>
//         </DndProvider>
//     )
// }

// export default ReactDND
