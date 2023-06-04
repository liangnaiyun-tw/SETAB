import React, { useState, useRef, useEffect } from 'react'
import Tab from './Tab'
import "./Group.css"
import {
    Accordion, Paper, AccordionDetails,
    AccordionSummary,
    Typography,
} from '@mui/material'
import { styled } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useDrop, useDrag } from 'react-dnd';
import { ItemTypes } from './ItemType';
import { useSelector, useDispatch } from 'react-redux';
import { setStructure } from '../../../features/dnd/DndSlice';
import { backgroundColor } from '@xstyled/styled-components';
import { moveTabToOtherGroup } from '../../../features/firebase/firestore/firestoreSlice';
// import { TroubleshootTwoTone } from '@mui/icons-material';

export const Group = ({ group, allExpaned }) => {

    const { structure } = useSelector((store) => store.dnd);
    const dispatch = useDispatch();
    const [expaned, setExpaned] = useState(false)

    // const [dropped, setDropped] = useState(false)

    const index = group.index;
    const id = group.id
    const [{ isDragging }, drag] = useDrag({
        type: ItemTypes.Group,
        item: () => ({ ...group }),
        collect: (monitor) => ({
            isDragging: monitor.isDragging
        })
    })

    useEffect(() => {
        setExpaned(allExpaned);
    }, [allExpaned])

    const [{ isOver, canDrop }, drop] = useDrop({
        accept: [ItemTypes.Tab, ItemTypes.Group],
        drop: async  (item, monitor) => {

            let newStructure = JSON.parse(JSON.stringify(structure));
            let droppedGroup = newStructure[group.id];
            let currentParentGroup = newStructure[group.parent];

            if (monitor.isOver({ shallow: true })) {
                if(item.type === 'group'){
                    let originParentGroup = newStructure[item.parent];
                    let draggedGroup = newStructure[item.id];
                    
                    
                    if(droppedGroup.id === originParentGroup.id) {
                        originParentGroup.childs.splice(draggedGroup.index, 0);
                        for (let i=0; i<originParentGroup.childs.length; i++){
                            newStructure[originParentGroup.childs[i]].index = i
                        }
                        originParentGroup.childs.splice(0, 0, draggedGroup);
                        for (let i=0; i<originParentGroup.childs.length; i++){
                            newStructure[originParentGroup.childs[i]].index = i
                        }
                        
                    } else {
                        originParentGroup.childs = originParentGroup.childs.filter(child => child!==item.id);
                        originParentGroup.groups = originParentGroup.groups.filter(group => group!==item.id);
                        
                        draggedGroup.parent = droppedGroup.id;
                        droppedGroup.childs = [draggedGroup.id, ...droppedGroup.childs];
    
                        for (let i=0; i<originParentGroup.childs.length; i++){
                            newStructure[originParentGroup.childs[i]].index = i;
                        }
                        for (let i=0; i<droppedGroup.childs.length; i++){
                            newStructure[droppedGroup.childs[i]].index = i;
                        }
                        // await dispatch(updateGroupToGroup());
                    }

                } else {

                    let originParentGroup = newStructure[item.group];
                    let draggedTab = newStructure[item.id];

                   if(droppedGroup.id === originParentGroup.id) {
                    droppedGroup.childs.splice(draggedTab.index, 0);
                        for (let i=0; i<droppedGroup.childs.length; i++){
                            newStructure[droppedGroup.childs[i]].index = i
                        }
                        droppedGroup.childs.splice(0, 0, draggedTab);
                        for (let i=0; i<droppedGroup.childs.length; i++){
                            newStructure[droppedGroup.childs[i]].index = i
                        }
                        
                    } else {
                        originParentGroup.childs = originParentGroup.childs.filter(child => child!==item.id);
                        originParentGroup.tabs = originParentGroup.tabs.filter(tab => tab!==item.id);
                        
                        draggedTab.group = droppedGroup.id;
                        droppedGroup.childs = [draggedTab.id, ...droppedGroup.childs];
    
                        for (let i=0; i<originParentGroup.childs.length; i++){
                            newStructure[originParentGroup.childs[i]].index = i;
                        }
                        for (let i=0; i<droppedGroup.childs.length; i++){
                            newStructure[droppedGroup.childs[i]].index = i;
                        }
                        let tabId = draggedTab.id;
                        let newGroupId = droppedGroup.id
                        dispatch(moveTabToOtherGroup({tabId, newGroupId}));
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

    function attachRef(el) {
        drag(el)
        drop(el)
    }

    const isActive = isOver && canDrop;

    return (
        <Paper ref={attachRef} index={group.index} className='Paper'>
            <Accordion className='Column' onDragOver={() => { setExpaned(true) }} onDragLeave={() => { setExpaned(false) }} onMouseOver={() => { setExpaned(true) }}  expanded={expaned} sx={{ minHeight: `${group.childs.length * 50 + 80}` }} >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>{group.name}</Typography>
                </AccordionSummary>
                <AccordionDetails style={{backgroundColor: "white"}}>
                    {
                        group.childs.map((child) =>
                            structure[child]?.type === 'group' ?
                                <Group parentGroup={group} group={structure[child]} allExpaned={allExpaned} /> :
                                <Tab group={group} tab={structure[child]} />
                        )
                    }
                </AccordionDetails>
            </Accordion>
        </Paper>
    )
}
