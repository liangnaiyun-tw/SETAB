

import { UncontrolledTreeEnvironment, Tree, StaticTreeDataProvider } from 'react-complex-tree';
import 'react-complex-tree/lib/style-modern.css';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentWorkspace, createGroup, updateWorkspace } from '../../../features/firebase/firestore/firestoreSlice';

import React, { useEffect, useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
import {
  Dialog,
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  IconButton
} from "@mui/material";
import Group from "../../../interface/Group";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from '@mui/icons-material/Edit';
import Workspace from '../../../interface/Workspace';

export default function MenuList() {
    // To retrieve the workspaces of the current user.
    const { workspaces, groups, currentGroup, currentWorkspace } = useSelector((store) => store.firestore);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [newGroupName, setNewGroupName] = useState("");
    const [currnetNode, setCurrentNode] = useState(null);
    const [rename, setRename] = useState("")
    const [openRenameDialog, setOpenRenameDialog] = useState(false)
    const handleRenameDialogOpen = () => setOpenRenameDialog(true)
    const handleRenameDialogClose = () => setOpenRenameDialog(false)
    const [openAddGroupDialogDialog, setOpenAddGroupDialogDialog] = useState(false);
    const handleAddGroupDialogOpen = () => setOpenAddGroupDialogDialog(true);
    const handleAddGroupDialogClose = () => setOpenAddGroupDialogDialog(false);
    const open = Boolean(anchorEl);
    const nodeType = {
        UnsavedWorkspace: 0,
        Workspace: 1,
        Group: 2,
        Tab: 3,
      };

      const rootNode = {
        index: 'root',
            canMove: true,
            isFolder: true,
            children: ['child1'],
            data: 'Root item',
            canRename: true,
            folderId: ""
      }

    const [items, setItems] = useState({
        root: rootNode
    });

    const dispatch = useDispatch();
    const onDrop = (items, target) => {
        console.log('dropEvent', items);
        console.log('dropevent target', target);
    };

    const handleNodeMoreClose = () => {
        setAnchorEl(null);
    };

    const handleNodeMoreOpen = (event, node) => {
        event.stopPropagation();
        setCurrentNode(node);
        setRename(node.data);

        setAnchorEl(event.currentTarget);
    };

    // Workspace or Group rename
    const handleRename = () => {
        if(currnetNode && currnetNode.nodeType === nodeType.Workspace){
            let workspace = Workspace;
            workspace.id = currnetNode.index;
            workspace.name = rename;
            dispatch(updateWorkspace(workspace))
        }
        handleRenameDialogClose();
        
    }

    const handleCreateGroup = () => {
    const newGroup = Group;
    newGroup.name = newGroupName;

    dispatch(createGroup(newGroup));

    handleAddGroupDialogClose();
        setNewGroupName("");
    };

    const itemTitleContainer = {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "inherit",
        color: "inherit",
      };
    
      const getCustomItemTitle = (node) => {
        return (
          <div style={itemTitleContainer}>
            {(() => {
              switch (node.nodeType) {
                case 0:
                  return <div>{node.data}</div>;
                case 1:
                  return (
                    <>
                      <div>{node.data}</div>
    
                      <div className="node-icon-container">
                        <IconButton
                          aria-label="create group"
                          size="small"
                          onClick={(event) => handleNodeMoreOpen(event, node)}
                          style={{ color: "inherit" }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </div>
                    </>
                  );
                case 2:
                    return <div>{node.data}</div>;
                case 3:
                  return <div>{node.data}</div>;
              }
            })()}
          </div>
        );
      };

      const onExpandNode = (node) => {
        dispatch(setCurrentWorkspace(node.index));
      };



    useEffect(() => {
        console.log('workspace useEffect', workspaces)
        setItems((prev) => {
            prev.root.children = [...workspaces.map(workspace => workspace.id)];

            for (let i = 0; i < workspaces.length; i++) {
                let type = nodeType.Workspace;
                if(workspaces[i].id === ""){
                    type = nodeType.UnsavedWorkspace
                }
                prev[workspaces[i].id] = {
                    index: workspaces[i].id,
                    canMove: type !== nodeType.UnsavedWorkspace,
                    isFolder: type !== nodeType.UnsavedWorkspace,
                    children: [],
                    data: workspaces[i].name,
                    canRename: type !== nodeType.UnsavedWorkspace,
                    workspaceId: workspaces[i].id,
                    nodeType: type
                }
                
            }
            return { ...prev };
        })
        

    }, [workspaces])


    useEffect(() => {
        const currGroupsByCurrentWorkspace = groups.filter(
          (group) => group.workspace === currentWorkspace
        );
        const currentWorkspaceChildren = currGroupsByCurrentWorkspace.map(group => group.id);

        setItems((prev) => {
            prev[currentWorkspace].children = currentWorkspaceChildren

            currGroupsByCurrentWorkspace.forEach((group) => {
                prev[group.id] = {
                  index: group.id,
                  canMove: true,
                  isFolder: true,
                  children: [],
                  data: group.name,
                  canRename: true,
                  nodeType: nodeType.Group,
                };
            });
            
            return { ...prev };
        })
      }, [groups, currentWorkspace, currentGroup]);


    return (
        <>
            <style>{`
            .rct-tree-item-button{
                color: #e8eaed;
            }
        :root {
          --rct-color-tree-bg: #202020;
          --rct-color-tree-focus-outline: #ffffff;
          --rct-color-focustree-item-selected-bg: #333;
          --rct-color-focustree-item-focused-border: #fff;
          --rct-color-focustree-item-draggingover-bg: #333;
          --rct-color-focustree-item-draggingover-color: inherit;
          --rct-color-search-highlight-bg: #333;
          --rct-color-drag-between-line-bg: #333;
          --rct-color-arrow: #e8eaed;
          --rct-item-height: 30px;
          --rct-search-text: #e8eaed
          --rct-arrow-size: 10px;
          --rct-focus-outline: #e8eaed;
          --rct-color-focustree-item-selected-text: #e8eaed;
          --rct-color-focustree-item-hover-text: #333
        }
      `}</style>
            <UncontrolledTreeEnvironment
                dataProvider={new StaticTreeDataProvider(items, (item, data) => ({ ...item, data }))}
                getItemTitle={(item) => getCustomItemTitle(item)}
                viewState={{}}
                canDragAndDrop={true}
                canDropOnFolder={true}
                canReorderItems={true}
                onDrop={(items, target) => { onDrop(items, target) }}
                onFocusItem={(item, treeId) => {
                    if(item.nodeType === nodeType.Workspace){
                        dispatch(setCurrentWorkspace(item.workspaceId));
                    }
                }}
                onExpandItem={(item) => onExpandNode(item)}
                
            >
                <Tree treeId="tree-1" rootItem="root" treeLabel="Tree Example" />
            </UncontrolledTreeEnvironment>

            <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleNodeMoreClose}
        onClick={handleNodeMoreClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem
          onClick={() => {
            handleAddGroupDialogOpen();
          }}
        >
          <ListItemIcon>
            <DashboardCustomizeIcon fontSize="small" />
          </ListItemIcon>
          Create new group
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleRenameDialogOpen();
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Rename
        </MenuItem>
      </Menu>
      <Dialog
        open={openAddGroupDialogDialog}
        onClose={handleAddGroupDialogClose}
      >
        <DialogTitle>Create new group</DialogTitle>
        <DialogContent>
          <DialogContentText>
            What would you like to name this group area
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Group name"
            type="text"
            fullWidth
            variant="standard"
            onChange={(e) => {
              setNewGroupName(e.target.value);
            }}
            value={newGroupName}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddGroupDialogClose}>Cancel</Button>
          <Button
            disabled={newGroupName.length === 0}
            onClick={handleCreateGroup}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rename dialog */}
      <Dialog
        open={openRenameDialog}
        onClose={handleRenameDialogClose}
      >
        <DialogTitle>Rename</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter the name you would like to change.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Name"
            type="text"
            fullWidth
            variant="standard"
            onChange={(e) => {
                setRename(e.target.value);
              }}
            value={rename}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRenameDialogClose}>Cancel</Button>
          <Button
            disabled={rename.length === 0}
            onClick={handleRename}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
        </>
    );
}
