import React, { useState, useRef } from 'react'
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
import { setDroppedStatus } from '../../../features/dnd/DndSlice';
// import { TroubleshootTwoTone } from '@mui/icons-material';

export const Group = ({ group }) => {

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

    const [{ isOver, canDrop }, drop] = useDrop({
        accept: [ItemTypes.Tab, ItemTypes.Group],
        drop: (item, monitor) => {
            if (monitor.isOver({ shallow: true })) {
                console.log("Drop on group", item, group);
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

    const isActive = isOver && canDrop;

    return (
        <Paper ref={attachRef} index={group.index} className='Paper'>
            <Accordion className='Column' onDragOver={() => { setExpaned(true) }} onDragLeave={() => { setExpaned(false) }} onMouseOver={() => { setExpaned(true) }} onMouseLeave={() => { setExpaned(false) }} expanded={expaned} sx={{ minHeight: `${group.childs.length * 50 + 80}` }} >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>{group.name}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    {
                        group.childs.map((child) =>
                            structure[child].type === 'group' ?
                                <Group parentGroup={group} group={structure[child]} /> :
                                <Tab group={group} tab={structure[child]} />
                        )
                    }
                </AccordionDetails>
            </Accordion>
        </Paper>
    )
}
