import React from "react";
import { useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import Typography from "@mui/material/Typography";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import styles from "./CustomNode.module.css";
import { IconButton } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { setCurrentWorkspace, setCurrentGroup } from "../../../features/firebase/firestore/firestoreSlice";

export const CustomNode = (props) => {
    const { currentGroup } = useSelector((store) => store.firestore);
    const { droppable, data } = props.node;
    const indent = props.depth * 24;

    const handleToggle = (e) => {
        e.stopPropagation();
        props.onToggle(props.node.id);
    };

    const handleNodeClick = (e) => {
        e.stopPropagation();
        console.log('handleNodeClick');
        console.log(props.node);
        if (props.node.nodeType === 0 || props.node.nodeType === 1) {
            setCurrentWorkspace(props.node.id)
        } else if (props.node.nodeType === 2) {
            let currGroup = [...currentGroup];
            currGroup.push(props.node.id);
            setCurrentGroup([...currGroup]);
        }
    }

    useEffect(() => {
        props.updateNode(props.node);
    }, [props.parent]);

    useEffect(() => {
        props.updateNode(props.node);
    }, [props.hasChild]);

    // useEffect(() => {
    //   console.log("Dragging", props.node.text);

    //   props.setDraggingNode(props.node);
    // }, [props.isDragging]);

    const itemTitleContainer = {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "inherit",
        color: "inherit",
    };



    return (
        <div onClick={(e) => { handleToggle(e); handleNodeClick(e) }}
            className={`tree-node ${styles.root}`}
            style={{ paddingInlineStart: indent }}
        >
            <div
                className={`${styles.expandIconWrapper} ${props.isOpen ? styles.isOpen : ""
                    }`}
            >
                {props.node.droppable && (
                    <div onClick={handleToggle}>
                        <ArrowRightIcon />
                    </div>
                )}
            </div>
            <div>
                {/* <TypeIcon droppable={droppable} fileType={data?.fileType} /> */}
            </div>
            <div className={styles.labelGridItem}>
                <div className="item-title-container" style={itemTitleContainer}>
                    {(() => {
                        switch (props.node.nodeType) {
                            case 0:
                            case 3:
                                return <div>{props.node.text}</div>;
                            case 1:
                            case 2:
                                return (
                                    <>
                                        <div>{props.node.text}</div>

                                        <div className="node-icon-container">
                                            <IconButton
                                                aria-label="create group"
                                                size="small"
                                                onClick={(event) => props.handleNodeMoreOpen(event, props.node)}
                                                style={{ color: "inherit" }}
                                            >
                                                <MoreVertIcon fontSize="small" />
                                            </IconButton>
                                        </div>
                                    </>
                                );
                        }
                    })()}
                </div>
                {/* <Typography variant="body2">{props.node.text}</Typography> */}
            </div>
        </div>
    );
};
