

import 'react-complex-tree/lib/style-modern.css';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentWorkspace, createGroup, updateWorkspace, updateGroupName, updateGroupGroups, updateGroupWorkspace, updateWorkspaceGroups, deleteWorkspace, setCurrentGroup, deleteGroup } from '../../../features/firebase/firestore/firestoreSlice';

import React, { useEffect, useState, useRef } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
import {
  CssBaseline,
  Dialog,
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  ThemeProvider,
  Divider,
} from "@mui/material";

import Group from "../../../interface/Group";
import EditIcon from '@mui/icons-material/Edit';
import Workspace from '../../../interface/Workspace';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchBar from '../SearchBar';
import {
  Tree,
  getBackendOptions,
  MultiBackend,
} from "@minoru/react-dnd-treeview";
import { DndProvider } from "react-dnd";
import { CustomDragPreview } from "./CustomDragPreview";
import { CustomNode } from "./CustomNode";
import { theme } from "./theme";

export default function MenuList() {
  // To retrieve the workspaces of the current user.
  const { workspaces, groups, currentGroup, currentWorkspace, tabs } = useSelector((store) => store.firestore);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [currnetNode, setCurrentNode] = useState(null);
  const [rename, setRename] = useState("")
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const handleDeleteDialogOpen = () => setOpenDeleteDialog(true)
  const handleDeleteDialogClose = () => setOpenDeleteDialog(false)
  const [openRenameDialog, setOpenRenameDialog] = useState(false)
  const handleRenameDialogOpen = () => setOpenRenameDialog(true)
  const handleRenameDialogClose = () => setOpenRenameDialog(false)
  const [openAddGroupDialogDialog, setOpenAddGroupDialogDialog] = useState(false);
  const handleAddGroupDialogOpen = () => setOpenAddGroupDialogDialog(true);
  const handleAddGroupDialogClose = () => setOpenAddGroupDialogDialog(false);
  const open = Boolean(anchorEl);
  const [treeData, setTreeData] = useState([]);
  const [draggingNode, setDraggingNode] = useState();
  const [nodeList, setNodeList] = useState([]);
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
    children: [],
    data: 'Root item',
    canRename: true,
    folderId: ""
  }

  const [items, setItems] = useState({
    root: rootNode
  });

  const dispatch = useDispatch();

  const handleNodeMoreClose = () => {
    setAnchorEl(null);
  };

  const handleNodeMoreOpen = (event, node) => {
    event.stopPropagation();

    if (node.nodeType === nodeType.Workspace) {
      dispatch(setCurrentWorkspace(node.id));
    } else if (node.nodeType === nodeType.Group) {
      dispatch(setCurrentGroup([...currentGroup, node.id]));
    }

    setCurrentNode(node);
    setRename(node.text);

    setAnchorEl(event.currentTarget);
  };

  // Workspace or Group rename
  const handleRename = () => {
    if (currnetNode && currnetNode.nodeType === nodeType.Workspace) {
      let workspace = Workspace;
      workspace.id = currnetNode.id;
      workspace.name = rename;
      dispatch(updateWorkspace(workspace))
    } else if (currnetNode && currnetNode.nodeType === nodeType.Group) {
      let group = Group;
      group.id = currnetNode.id;
      group.name = rename;
      dispatch(updateGroupName(group))
    }
    handleRenameDialogClose();

  }

  const handleDelete = () => {
    if (currnetNode.nodeType === nodeType.Workspace) {
      dispatch(deleteWorkspace(currnetNode.id))
    } else if (currnetNode.nodeType === nodeType.Group) {
      dispatch(deleteGroup(currnetNode.id))
    }
    handleDeleteDialogClose()
  }

  const handleCreateGroup = () => {
    const group = Group;
    group.name = newGroupName;
    dispatch(createGroup(group));

    console.log(currentGroup);
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

  useEffect(() => {
    console.log('workspace', workspaces)
    console.log('groups', groups)
    setTreeData((prev) => {
      prev = [];
      for (let index = 0; index < workspaces.length; index++) {
        let ws = workspaces[index];
        if (index !== 0) {
          prev.push({
            id: ws.id,
            parent: 0,
            droppable: false,
            text: ws.name,
            nodeType: nodeType.Workspace,
            groups: ws.groups,
            workspace: ws.id
          })
        } else {
          prev.push({
            id: ws.id,
            parent: 0,
            droppable: false,
            text: ws.name,
            nodeType: nodeType.UnsavedWorkspace,
            groups: [],
            workspace: ws.id
          })
          ws.tabs.forEach(tabid => {
            let tab = tabs.filter(t => t.id === tabid)[0];
            prev.push({
              id: tab.id,
              parent: ws.id,
              droppable: false,
              text: tab.alias,
              nodeType: nodeType.Tab,
              groups: [],
              workspace: ws.id
            })
          })
        }

      }

      for (let index = 0; index < groups.length; index++) {
        const g = groups[index];
        prev.push({
          id: g.id,
          parent: g.workspace,
          droppable: true,
          text: g.name,
          nodeType: nodeType.Group,
          groups: g.groups,
          workspace: g.workspace
        })
      }

      // updated group parent
      for (let index = 0; index < groups.length; index++) {
        const g = groups[index];
        if (g.groups.length > 0) {
          g.groups.forEach(gid => {
            prev.filter(p => p.id === gid)[0].parent = g.id;
          })
        }

      }

      return [...prev]
    })

  }, [groups, currentWorkspace, currentGroup, workspaces]);


  const handleDrop = (newTree, { dragSourceId, dropTargetId, dragSource, dropTarget }) => {

    console.log('handleDrop')
    console.log(dragSourceId, dropTargetId, dragSource, dropTarget)
    console.log(newTree)
    // setTreeData(newTree);

    // newTree.filter(x => x.nodeType === nodeType.Workspace).forEach(workspaceNode => {
    //   dispatch(updateWorkspaceGroups({ workspaceId: workspaceNode.id, groups: [...newTree.filter(t => t.parent === workspaceNode.id)].map(x => x.id) }))
    //   newTree.filter(t => t.parent === workspaceNode.id).forEach(n => {
    //     if (n.workspace !== workspaceNode.id) {
    //       dispatch(updateGroupWorkspace({ id: n.id, workspace: workspaceNode.id }))
    //     }
    //   })
    // })

    // newTree.filter(x => x.nodeType === nodeType.Group).forEach(groupNode => {
    //   dispatch(updateGroupGroups({ id: groupNode.id, groups: [...newTree.filter(t => t.parent === groupNode.id)].map(x => x.id) }))
    //   newTree.filter(t => t.parent === groupNode.id).forEach(n => {
    //     if (n.workspace !== groupNode.workspace) {
    //       dispatch(updateGroupWorkspace({ id: n.id, workspace: groupNode.id }))
    //     }
    //   })
    // })


    // console.log('handleDrop')
    // console.log(dragSourceId, dropTargetId, dragSource, dropTarget)
    // if (dragSource.parent === dropTarget.parent) {
    //   if (dragSource.nodeType === nodeType.Group && dropTarget.nodeType === nodeType.Group) {

    //     dispatch(updateGroupGroups({ id: dropTarget.id, groups: [...dropTarget.groups, dragSource.id] }))
    //     const isWorkspace = workspaces.filter(ws => ws.id === dragSource.parent).length > 0;
    //     if (isWorkspace) {
    //       let parentWorkspace = workspaces.filter(ws => ws.id === dragSource.parent)[0]
    //       dispatch(updateWorkspaceGroups({ workspaceId: parentWorkspace.id, groups: [...parentWorkspace.groups.filter(gid => gid !== dragSource.id)] }))
    //     } else {
    //       let parentGroup = groups.filter(gs => gs.id === dragSource.parent)[0];
    //       dispatch(updateGroupGroups({ id: parentGroup.id, groups: [...parentGroup.groups.filter(pg => pg.id !== dragSource.id)] }))
    //     }

    //   }

    // } else {
    //   // group to workspace
    //   if (dragSource.nodeType === nodeType.Group && dropTarget.nodeType === nodeType.Workspace) {
    //     // dispatch(setCurrentWorkspace(dropTarget.id))
    //     dispatch(updateGroupWorkspace({ id: dragSource.id, workspace: dropTarget.workspace }))
    //     console.log('updateWorkspaceGroups', dropTarget.id, [...dropTarget.groups, dragSource.id])
    //     dispatch(updateWorkspaceGroups({ workspaceId: dropTarget.id, groups: [...dropTarget.groups, dragSource.id] }))
    //     const isWorkspace = workspaces.filter(ws => ws.id === dragSource.parent).length > 0;
    //     if (isWorkspace) {
    //       let parentWorkspace = workspaces.filter(ws => ws.id === dragSource.parent)[0]
    //       dispatch(updateWorkspaceGroups({ workspaceId: parentWorkspace.id, groups: [...parentWorkspace.groups.filter(gid => gid !== dragSource.id)] }))
    //     } else {
    //       let parentGroup = groups.filter(gs => gs.id === dragSource.parent)[0];
    //       dispatch(updateGroupGroups({ id: parentGroup.id, groups: [...parentGroup.groups.filter(pg => pg.id !== dragSource.id)] }))
    //     }
    //   }
    //   // group to other group
    //   if (dragSource.nodeType === nodeType.Group && dropTarget.nodeType === nodeType.Group) {
    //     // dispatch(setCurrentWorkspace(dropTarget.workspace))
    //     dispatch(updateGroupWorkspace({ id: dragSource.id, workspace: dropTarget.workspace }))
    //     dispatch(updateGroupGroups({ id: dropTarget.id, groups: [...dropTarget.groups, dragSource.id] }))
    //     let dragSourceWS = workspaces.filter(ws => ws.id === dragSource.parent);
    //     if (dragSourceWS) {
    //       dispatch(updateWorkspaceGroups({ workspaceId: dragSourceWS[0].id, groups: [...dragSourceWS[0].groups.filter(gid => gid !== dragSource.id)] }))
    //     } else {
    //       let dragSourceGroup = groups.filter(g => g.id === dragSource.parent)[0];
    //       dispatch(updateGroupGroups({ id: dragSourceGroup.id, groups: [...dragSourceGroup.groups.filter(gid => gid !== dragSource.id)] }))
    //     }

    //   }
    // }

  }


  const updateNode = (node, depth, hasChild) => {
    let checkExist = false;
    nodeList.map((value) => {
      if (value.id == node.id) {
        value.depth = depth;
        value.hasChild = hasChild;
        value.parent = node.parent;
        checkExist = true;
      }
    });
    if (checkExist) {
      setNodeList(nodeList);
    } else {
      node.depth = depth;
      node.hasChild = hasChild;
      nodeList.push(node);
      setNodeList(nodeList);
    }
  }

  const handleSearch = (searchStr) => {
    const expandTargets = [];

    Object.entries(items).forEach(entry => {
      const [key, value] = entry;
      if (value.data.includes(searchStr)) {
        expandTargets.push(key);
      }
    })
  }


  return (
    <>
      <SearchBar handleSearch={handleSearch} />
      <div style={{ height: '100%', color: '#e3e3e3' }}>
        <ThemeProvider theme={theme} >
          <CssBaseline />
          <DndProvider backend={MultiBackend} options={getBackendOptions()} >
            <Tree

              tree={treeData}
              rootId={0}
              onDrop={handleDrop}
              render={(node, { depth, isOpen, onToggle, isDragging, isDropTarget, hasChild }) => (
                <CustomNode
                  node={node}
                  depth={depth}
                  isOpen={isOpen}
                  onToggle={onToggle}
                  isDragging={isDragging}
                  isDropTarget={isDropTarget}
                  draggingNode={draggingNode}
                  hasChild={hasChild}
                  updateNode={(value) => {
                    updateNode(value, depth, hasChild);
                  }}
                  handleNodeMoreOpen={(event, node) => {
                    handleNodeMoreOpen(event, node);
                  }}
                />
              )}
              dragPreviewRender={(monitorProps) => (
                <CustomDragPreview monitorProps={monitorProps} />
              )}
            />
          </DndProvider>
        </ThemeProvider >
      </div>

      <Divider light />

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
        <MenuItem onClick={() => handleDeleteDialogOpen()}>
          <ListItemIcon>
            <DeleteIcon fontSize='small' />
          </ListItemIcon>
          Delete
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
            disabled={newGroupName === ""}
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
            disabled={rename === ""}
            onClick={handleRename}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
      {/* delete dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Are you sure you want to delete?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDelete} autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
