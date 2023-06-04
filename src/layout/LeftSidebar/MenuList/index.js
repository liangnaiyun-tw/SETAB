

import { UncontrolledTreeEnvironment, Tree, StaticTreeDataProvider } from 'react-complex-tree';
import 'react-complex-tree/lib/style-modern.css';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentWorkspace, createGroup, updateWorkspace, updateGroup, updateUserWorkspaces, updateWorkspaceGroups, deleteWorkspace, createWorkSpace, setCurrentGroup, deleteGroup } from '../../../features/firebase/firestore/firestoreSlice';

import React, { useEffect, useState, useRef } from "react";
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
  IconButton,
  Divider
} from "@mui/material";
import Group from "../../../interface/Group";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from '@mui/icons-material/Edit';
import Workspace from '../../../interface/Workspace';
import DeleteIcon from '@mui/icons-material/Delete';
import { PropaneSharp } from '@mui/icons-material';
import SearchBar from '../SearchBar';

export default function MenuList() {
  // To retrieve the workspaces of the current user.
  const { workspaces, groups, currentGroup, currentWorkspace } = useSelector((store) => store.firestore);
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
  // tree state control
  const [expandedItems, setExpandedItems] = useState([""])
  const [focusedItem, setFocusedItem] = useState("")
  const [selectedItems, setSelectedItems] = useState([""])

  const treeEnvironment = useRef();
  const tree = useRef();
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

  const updateItemParent = (item) => {

    if (item.parent !== 'root') {
      let parent = treeEnvironment.current.items[item.parent];
      let newGroups = [...parent.children].filter(x => x !== "" && x !== item.index)
      if (workspaces.filter(ws => ws.id === item.parent)) {
        dispatch(updateWorkspaceGroups({ workspaceId: parent.index, groups: newGroups }))
      } else {
        dispatch(updateGroup({ name: parent.data, groups: newGroups }))
      }
    }
    if (item.parent === 'root' && item.nodeType === nodeType.Workspace) {
      dispatch(updateUserWorkspaces([...treeEnvironment.current.items.root.children]));
    }
  }

  const onDrop = (items, target) => {
    console.log('items', items)
    console.log('target', target)

    items.forEach(i => {

      updateItemParent(i);
      if ('targetItem' in target) {

        if (target.targetItem !== 'root') {
          let targetItem = treeEnvironment.current.items[target.targetItem];
          let newGroups = targetItem.children.filter(x => x !== "");
          if (i.nodeType === nodeType.Workspace) {

            dispatch(deleteWorkspace(i.index));
            dispatch(createGroup({ name: i.data, groups: i.children, workspace: targetItem.index }))
            newGroups = newGroups.filter(x => x !== i.index);
          }
          if (targetItem.nodeType === nodeType.Workspace) {
            dispatch(updateWorkspaceGroups({ workspaceId: targetItem.index, groups: newGroups }))
          } else {
            dispatch(updateGroup({ name: targetItem.data, groups: newGroups }))
          }
        } else {
          let newUserWorkspaces = [...treeEnvironment.current.items.root.children];
          if (i.nodeType === nodeType.Group) {
            dispatch(deleteGroup(i.index))
            dispatch(createWorkSpace({ name: i.data, groups: i.children }));
            newUserWorkspaces = newUserWorkspaces.filter(x => x !== "" && x !== i.index);
          }

          dispatch(updateUserWorkspaces(newUserWorkspaces));
        }
      } else if ('parentItem' in target && target.parentItem === 'root') {
        let newUserWorkspaces = [...treeEnvironment.current.items.root.children];
        if (i.nodeType === nodeType.Group) {
          dispatch(deleteGroup(i.index))
          dispatch(createWorkSpace({ name: i.data, groups: i.children }));
          newUserWorkspaces = newUserWorkspaces.filter(x => x !== "" && x !== i.index);
        }
        dispatch(updateUserWorkspaces(newUserWorkspaces));
      } else if ('parentItem' in target && target.parentItem !== 'root') {
        let targetItem = treeEnvironment.current.items[target.parentItem];
        let newGroups = targetItem.children;
        if (targetItem.nodeType === nodeType.Workspace) {
          dispatch(updateWorkspaceGroups({ workspaceId: targetItem.index, groups: newGroups }))
        } else {
          dispatch(updateGroup({ name: targetItem.data, groups: newGroups }))
        }
      }

    })


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
    if (currnetNode && currnetNode.nodeType === nodeType.Workspace) {
      let workspace = Workspace;
      workspace.id = currnetNode.index;
      workspace.name = rename;
      dispatch(updateWorkspace(workspace))
    } else if (currnetNode && currnetNode.nodeType === nodeType.Group) {
      let group = Group;
      group.id = currnetNode.index;
      group.name = rename;
      dispatch(updateGroup(group))
    }
    handleRenameDialogClose();

  }

  const handleRenameItem = (item, newName) => {
    setRename(newName);
    if (item.nodeType === nodeType.Workspace) {
      let workspace = Workspace;
      workspace.id = item.index;
      workspace.name = newName;
      workspace.groups = item.children;
      dispatch(updateWorkspace(workspace))
    } else if (item.nodeType === nodeType.Group) {
      let group = Group;
      group.id = item.index;
      group.name = newName;
      group.groups = item.children;
      dispatch(updateGroup(group))
    }
    setRename('')
  }

  const handleDelete = () => {
    if (currnetNode.nodeType === nodeType.Workspace) {
      // todo delete workspace should also delete 
      dispatch(deleteWorkspace(currnetNode.index))
    } else if (currnetNode.nodeType === nodeType.Group) {
      dispatch(deleteGroup(currnetNode.index))
    }
    handleDeleteDialogClose()
  }

  const handleCreateGroup = () => {
    const newGroup = Group;
    newGroup.name = newGroupName;

    dispatch(createGroup(newGroup)).then((data) => {
      const returnGroup = data.payload;
      if (currnetNode.nodeType === nodeType.Group) {
        debugger;
        let group = groups.filter(g => g.id === currnetNode.index)[0];
        let groupOfGroups = group.groups;
        let newGroup = Group;
        newGroup.name = group.name;
        newGroup.groups = groupOfGroups.concat([returnGroup.id]);
        newGroup.id = group.id;
        dispatch(updateGroup(newGroup));
      }
    })

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
            case 2:
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
            case 3:
              return <div>{node.data}</div>;
          }
        })()}
      </div>
    );
  };

  const onExpandNode = (node) => {
    if (node.nodeType === nodeType.Workspace) {
      dispatch(setCurrentWorkspace(node.index))
      if (workspaces) {
        let currWorkspace = workspaces.filter(w => w.id === node.index)[0];
        setItems((prev) => {
          prev[node.index].children = [...currWorkspace.groups]
          return { ...prev };
        })
      }

    } else if (node.nodeType === nodeType.Group) {
      if (currentGroup) {
        let newGroup = currentGroup;
        newGroup = newGroup.concat([node.index]);
        dispatch(setCurrentGroup(newGroup))
        let currGroup = groups.filter(g => g.id === node.index)[0];

        setItems((prev) => {
          prev[node.index].children = [...currGroup.groups]
          return { ...prev };
        })

      }
    }
  };

  useEffect(() => {
    console.log('workspaces', workspaces)
    console.log('groups', groups)
    if (workspaces && groups) {
      setItems((prev) => {
        prev.root.children = [...workspaces.map(workspace => workspace.id)];

        for (let i = 0; i < workspaces.length; i++) {
          let type = nodeType.Workspace;
          if (workspaces[i].id === "") {
            type = nodeType.UnsavedWorkspace
          }
          prev[workspaces[i].id] = {
            index: workspaces[i].id,
            canMove: type !== nodeType.UnsavedWorkspace,
            isFolder: type !== nodeType.UnsavedWorkspace,
            children: workspaces[i].groups,
            data: workspaces[i].name,
            canRename: type !== nodeType.UnsavedWorkspace,
            workspaceId: workspaces[i].id,
            nodeType: type,
            parent: 'root'
          }

        }

        groups.forEach(group => {
          let parent = ""
          workspaces.forEach(ws => {
            if (ws.groups.includes(group.id)) {
              parent = ws.id
            }
          })
          if (parent === "") {
            groups.forEach(g => {
              if (g.groups.includes(group.id)) {
                parent = g.id
              }
            })
          }
          prev[group.id] = {
            index: group.id,
            canMove: true,
            isFolder: true,
            children: group.groups,
            data: group.name,
            canRename: true,
            nodeType: nodeType.Group,
            parent: parent
          };
        });
        return { ...prev };
      })
    }




  }, [groups, currentWorkspace, currentGroup, workspaces]);

  const cx = (...classNames) =>
    classNames.filter(cn => !!cn).join(' ');

  const handleSearch = (searchStr) => {
    const expandTargets = [];

    Object.entries(items).forEach(entry => {
      const [key, value] = entry;
      if (value.data.includes(searchStr)) {
        expandTargets.push(key);
      }
    })

    setExpandedItems([...expandTargets])

    treeEnvironment.current.viewState['tree-1'].expandedItems = [...expandTargets]
    treeEnvironment.current.viewState['tree-1'].selectedItems = [...expandTargets]
  }

  return (
    <>
      <SearchBar handleSearch={handleSearch} />
      <Divider light />
      <UncontrolledTreeEnvironment
        ref={treeEnvironment}
        dataProvider={new StaticTreeDataProvider(items, (item, newName) => ({ ...item, data: newName }))}
        getItemTitle={(item) => item.data}
        renderItemTitle={({ title, item }) => getCustomItemTitle(item)}

        viewState={{
          'tree-1': {
            expandedItems: expandedItems,
            focusedItem: focusedItem,
            selectedItems: selectedItems
          }
        }}
        canSearchByStartingTyping={true}
        canDragAndDrop={true}
        canDropOnFolder={true}
        canReorderItems={true}
        canRename={true}
        onRenameItem={(item, name, treeId) => handleRenameItem(item, name)}
        onDrop={(items, target) => { onDrop(items, target) }}
        onFocusItem={(item, treeId) => {
          if (item.nodeType === nodeType.Workspace) {
            dispatch(setCurrentWorkspace(item.workspaceId));
          }
        }}
        onExpandItem={(item) => onExpandNode(item)}


      >
        <div
          className="rct-dark"
          style={{ backgroundColor: '#222', color: '#e3e3e3' }}
        >
          <Tree treeId="tree-1" rootItem="root" treeLabel="Tree Example" ref={tree} />
        </div>
      </UncontrolledTreeEnvironment >

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
        {/* <MenuItem
          onClick={() => {
            handleRenameDialogOpen();
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Rename
        </MenuItem> */}
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
