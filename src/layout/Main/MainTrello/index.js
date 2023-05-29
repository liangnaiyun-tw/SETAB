import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import MainCard from './MainCard';
import { useState } from 'react';
import Box from '@mui/material/Box';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

export default function MainTrello() {

    const onDragEnd = (result) => {
        console.log('onDragEnd', result)
        if (!result.destination) {
            return;
        }

        const itemsReorder = reorder(
            items,
            result.source.index,
            result.destination.index
        );
        setItems(itemsReorder);
    }
    const reorder = (list, startIndex, endIndex) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);

        return result;
    };
    const grid = 8;
    const getItemStyle = (isDragging, draggableStyle) => ({
        // some basic styles to make the items look a bit nicer
        userSelect: 'none',
        padding: grid,
        margin: `0 ${grid}px 0 0`,

        // change background colour if dragging
        // background: isDragging ? 'lightgreen' : 'grey',

        // styles we need to apply on draggables
        ...draggableStyle,
    });

    const getListStyle = isDraggingOver => ({
        // background: isDraggingOver ? 'lightblue' : 'lightgrey',
        display: 'flex',
        padding: grid,
        overflow: 'auto',
    });
    const getItems = count =>
        Array.from({ length: count }, (v, k) => k).map(k => ({
            id: `item-${k}`,
            content: `item ${k}`,
        }));
    const [items, setItems] = useState(['A', 'B', 'C']);


    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable" direction="horizontal">
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        style={getListStyle(snapshot.isDraggingOver)}
                        {...provided.droppableProps}
                    >
                        {items.map((item, index) => (
                            <Draggable key={item} draggableId={item} index={index}>
                                {(provided, snapshot) => (
                                    <>
                                        <div ref={provided.innerRef} {...provided.draggableProps}>
                                            <div isDragging={snapshot.isDragging}
                                                {...provided.dragHandleProps}
                                                style={getItemStyle(
                                                    snapshot.isDragging,
                                                    provided.draggableProps.style
                                                )}
                                            >
                                                {item}
                                            </div>
                                            <div>
                                                <MainCard></MainCard>
                                            </div>
                                        </div>

                                    </>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>

    );
}