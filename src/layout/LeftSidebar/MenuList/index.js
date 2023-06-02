

import { UncontrolledTreeEnvironment, Tree, StaticTreeDataProvider } from 'react-complex-tree';
import 'react-complex-tree/lib/style-modern.css';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentWorkspace, createGroup, updateWorkspace, updateGroup, updateUserWorkspaces, updateWorkspaceGroups, deleteWorkspace, createWorkSpace } from '../../../features/firebase/firestore/firestoreSlice';

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
  IconButton
} from "@mui/material";
import Group from "../../../interface/Group";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from '@mui/icons-material/Edit';
import Workspace from '../../../interface/Workspace';
import DeleteIcon from '@mui/icons-material/Delete';

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
  const onDrop = (items, target) => {
    if (target.targetType === "between-items") {

      if (target.parentItem === "root") {
        items.forEach(item => {
          if (item.nodeType === nodeType.Workspace) {
            updateRootChildren();
          } else {
            updateRootChildren(true, [item]);


            let targetItemWorkspace = workspaces.filter(w => w.id === item.parent)[0];
            dispatch(updateWorkspaceGroups({ groups: [...targetItemWorkspace.groups.filter(g => g !== item.index)], workspaceId: targetItemWorkspace.id }))


            let newWorkspace = Workspace;
            newWorkspace.name = item.data;
            newWorkspace.groups = groups.filter(g => g.id === item.index)[0].groups;
            dispatch(createWorkSpace(newWorkspace))
          }
        })

      } else {

        updateParentChildren(target.parentItem);
      }
    } else if (target.targetType === "item") {
      if (target.targetItem === "root") {
        updateRootChildren();
      } else {
        setCurrentWorkspace(target.targetItem);
        let targetItem = treeEnvironment.current.items[target.targetItem];
        if (targetItem.nodeType === nodeType.Workspace) {
          updateParentChildren(targetItem.index, items);
        } else {
          debugger;
          updateParentChildren(targetItem.index);
        }
      }

      // To simultaneously update the parentItem and targetItem's children
      if (target.parentItem === "root") {
        updateRootChildren(true, items);
        items.forEach(item => {
          if (item.nodeType === nodeType.Workspace) {
            dispatch(deleteWorkspace(item.index))
            let newGroup = Group;
            newGroup.name = item.data;
            newGroup.workspace = target.targetItem;
            dispatch(createGroup(newGroup));
          }
        });

      } else {
        updateParentChildren(target.parentItem);
      }


    }
  };

  const updateRootChildren = (removeTarget = false, items = []) => {

    let children = [...treeEnvironment.current.items.root.children];
    children = [...children.filter(c => c !== "")];
    if (removeTarget && items.length > 0) {
      items.forEach(item => {
        children = [...children.filter(c => c !== item)];
      })
    }

    dispatch(updateUserWorkspaces(children));
  }

  const updateParentChildren = (target, deleteItems = []) => {
    const parent = treeEnvironment.current.items[target];
    let children = [...parent.children]
    if (deleteItems.length > 0) {
      deleteItems.forEach(i => {
        children = children.filter(c => c !== i.index);
      })
    }
    if (parent.nodeType === nodeType.Workspace) {
      dispatch(updateWorkspaceGroups({ groups: children, workspaceId: parent.index }))
    } else {
      // todo update group's group
    }
  }

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
    } else if (currnetNode && currentGroup.nodeType === nodeType.Group) {
      let group = Group;
      group.id = currnetNode.index;
      group.name = rename;
      dispatch(updateGroup(group))
    }
    handleRenameDialogClose();

  }

  const handleDelete = () => {
    if (currnetNode.nodeType === nodeType.Workspace) {
      // todo delete workspace should also delete 
      dispatch(deleteWorkspace(currnetNode.index))
    } else {
      // todo when deleting a workspace, it is common to also delete its associated groups
      // dispatch(deleteGroup(currnetNode.index))
    }
    handleDeleteDialogClose()
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
          children: [],
          data: workspaces[i].name,
          canRename: type !== nodeType.UnsavedWorkspace,
          workspaceId: workspaces[i].id,
          nodeType: type,
          parent: 'root'
        }

      }
      return { ...prev };
    })


  }, [workspaces])


  useEffect(() => {

    const currGroupsByCurrentWorkspace = groups.filter(
      (group) => group.workspace === currentWorkspace
    );

    // To retrieve groups from the current workspace in the correct order.
    let currWorkspace = [];
    currWorkspace = workspaces.filter(x => x.id === currentWorkspace)[0];
    let currentWorkspaceChildren = [];
    if (currWorkspace) {
      currentWorkspaceChildren = currWorkspace.groups
    }

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
          parent: group.workspace
        };
      });

      return { ...prev };
    })

  }, [groups, currentWorkspace, currentGroup]);


  return (
    <>
      <UncontrolledTreeEnvironment
        ref={treeEnvironment}
        dataProvider={new StaticTreeDataProvider(items, (item, data) => ({ ...item, data }))}
        getItemTitle={(item) => getCustomItemTitle(item)}
        // getItemTitle={item => item.data}
        // renderItem={({ item, depth, children, title, context, arrow }) => {
        //   const InteractiveComponent = context.isRenaming ? 'div' : 'button';
        //   const type = context.isRenaming ? undefined : 'button';
        //   return (
        //     <li
        //       {...(context.itemContainerWithChildrenProps)}
        //       className="rct-tree-item-li"
        //     >
        //       <div
        //         {...(context.itemContainerWithoutChildrenProps)}
        //         style={{ paddingLeft: `${(depth + 1) * 4}px` }}
        //         className={[
        //           'rct-tree-item-title-container',
        //           item.isFolder && 'rct-tree-item-title-container-isFolder',
        //           context.isSelected && 'rct-tree-item-title-container-selected',
        //           context.isExpanded && 'rct-tree-item-title-container-expanded',
        //           context.isFocused && 'rct-tree-item-title-container-focused',
        //           context.isDraggingOver &&
        //             'rct-tree-item-title-container-dragging-over',
        //           context.isSearchMatching &&
        //             'rct-tree-item-title-container-search-match',
        //         ].join(' ')}
        //       >
        //         {arrow}
        //         <InteractiveComponent
        //           type={type}
        //           {...(context.interactiveElementProps)}
        //           className="rct-tree-item-button"
        //         >
        //           {title}
        //         </InteractiveComponent>
        //         <button onClick={context.startRenamingItem} type="button">
        //           Rename
        //         </button>
        //       </div>
        //       {children}
        //     </li>
        //   );
        // }}
        viewState={{
          'tree-1': {
            expandedItems: expandedItems,
            focusedItem: focusedItem,
            selectedItems: selectedItems
          }
        }}
        canSearchByStartingTyping={false}
        canDragAndDrop={true}
        canDropOnFolder={true}
        canReorderItems={true}
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
