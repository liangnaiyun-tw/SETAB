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


const ReactDND = () => {


  const { currentWorkspace, currentGroup, workspaces, groups, tabs } = useSelector(store => store.firestore);
  const { structure } = useSelector(store => store.dnd);

  const dispatch = useDispatch();


  useEffect(() => {

    let newRoot = {};
    currentGroup.length === 0 ?
      newRoot = workspaces.filter(workspace => workspace.id === currentWorkspace)[0] :
      newRoot = groups.filter(group => group.id === currentGroup[currentGroup.length - 1])[0];

    let newStructure = {
      gid: newRoot.id,
      name: newRoot.name,
      groups: newRoot.groups,
      tabs: newRoot.tabs,
      childs: []
    }
    if (newRoot.tabs) {
      newStructure.childs = [...newRoot.tabs, ...newRoot.groups];
    } else {
      newStructure.childs = [...newRoot.groups];
    }

    createStructure(newStructure, newStructure);
    dispatch(setStructure(newStructure));
    console.log(newStructure);
  }, [currentWorkspace, currentGroup, workspaces, groups])

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
        } else {
          let obj = JSON.parse(JSON.stringify(tabObj))
          obj.type = 'tab';
          obj.index = index;
          newStructure[obj.id] = obj
        }

      })
      // parent.groups.map(group => {

      // });
    }

    // if(parent.tabs !== null && parent.tabs !== undefined) {
    //   parent.tabs = parent.tabs.map((tid, index) => {
    //     let tab = JSON.parse(JSON.stringify(tabs.filter(tab => tab.id === tid)[0]));
    //     tab.type = 'tab';
    //     return tab;
    //   })
    // }
    // parent.childs = [...parent.tabs, ...parent.groups];
  }


  // const onDrop = (item, monitor, status) => {
  //   setItems((prevState) => {
  //     const newItems = prevState
  //       .filter((i) => i.id !== item.id)
  //       .concat({ ...item, status });
  //     return [...newItems];
  //   });
  // };

  // const moveItem = (dragIndex, hoverIndex) => {
  //   const item = items[dragIndex];
  //   setItems((prevState) => {
  //     const newItems = prevState.filter((i, idx) => idx !== dragIndex);
  //     newItems.splice(hoverIndex, 0, item);
  //     return [...newItems];
  //   });
  // };



  return (
    <div className="board">
      {/* <div className="board" style={{ width: `${structure.name === "Unsaved" ? 250 : structure.groups.length * 250}px` }}> */}
      <DndProvider backend={HTML5Backend} >
        <Masonry columns={structure.groups.length}>
          {structure.childs.map((child) => {
            return structure[child].type === 'group' ?
              <Group group={structure[child]} /> :
              <Tab tab={structure[child]} />
          })}
        </Masonry>
      </DndProvider>
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
