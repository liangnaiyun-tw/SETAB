import React from 'react';
import "./Tab.css"
import { useDrag, useDrop } from 'react-dnd';
import { ItemTypes } from './ItemType';
import { backgroundColor } from '@xstyled/styled-components';
import { setStructure } from "../../../features/dnd/DndSlice";
import { useSelector, useDispatch } from 'react-redux';


const Tab = ({tab}) => {

    const { structure } = useSelector(store => store.dnd);

    const index = tab.index;
    const id = tab.id;

    const [{ isDragging }, drag] = useDrag({
        type: ItemTypes.Tab,
        item: () => ({...tab}),
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

            if(monitor.isOver({shallow: true})){
                if(item.type === 'group'){
                    let originGroup = newStructure[item.parent];
                    let draggedGroup = newStructure[item.id];
                    
                    
                    if(currentGroup.id === originGroup.id) {
                        currentGroup.childs.splice(draggedGroup.index, 0);
                        for (let i=0; i<currentGroup.childs.length; i++){
                            newStructure[currentGroup.childs[i]].index = i
                        }
                        currentGroup.childs.splice(droppedTab.index, 0, draggedGroup);
                        for (let i=0; i<currentGroup.childs.length; i++){
                            newStructure[currentGroup.childs[i]].index = i
                        }
                        
                    } else {
                        originGroup.childs = originGroup.childs.filter(child => child!==item.id);
                        originGroup.groups = originGroup.groups.filter(group => group!==item.id);
                        
                        draggedGroup.parent = currentGroup.id;
                        currentGroup.childs = [...currentGroup.childs.slice(0, index), draggedGroup.id, ...currentGroup.childs.slice(index)];
    
                        for (let i=0; i<originGroup.childs.length; i++){
                            newStructure[originGroup.childs[i]].index = i;
                        }
                        for (let i=0; i<currentGroup.childs.length; i++){
                            newStructure[currentGroup.childs[i]].index = i;
                        }
                    }

                } else {

                    let originGroup = newStructure[item.group];
                    let draggedTab = newStructure[item.id];

                   if(currentGroup.id === originGroup.id) {
                        currentGroup.childs.splice(draggedTab.index, 0);
                        for (let i=0; i<currentGroup.childs.length; i++){
                            newStructure[currentGroup.childs[i]].index = i
                        }
                        currentGroup.childs.splice(droppedTab.index, 0, draggedTab);
                        for (let i=0; i<currentGroup.childs.length; i++){
                            newStructure[currentGroup.childs[i]].index = i
                        }
                        
                    } else {
                        originGroup.childs = originGroup.childs.filter(child => child!==item.id);
                        originGroup.tabs = originGroup.tabs.filter(tab => tab!==item.id);
                        
                        draggedTab.group = currentGroup.id;
                        currentGroup.childs = [...currentGroup.childs.slice(0, droppedTab.index), draggedTab.id, ...currentGroup.childs.slice(droppedTab.index)];
    
                        for (let i=0; i<originGroup.childs.length; i++){
                            newStructure[originGroup.childs[i]].index = i;
                        }
                        for (let i=0; i<currentGroup.childs.length; i++){
                            newStructure[currentGroup.childs[i]].index = i;
                        }
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


    return (
        <div className='TabCard' ref={attachRef} style={{backgroundColor: `${isDragging? "whitesmoke": "white"}`}}>
            {isDragging?tab.title:"null"}
        </div>
    );
}

export default Tab;
