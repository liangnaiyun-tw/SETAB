import React, { useState } from 'react'
import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import CreateNewFolderTwoToneIcon from '@mui/icons-material/CreateNewFolderTwoTone';
import PostAddIcon from '@mui/icons-material/PostAdd';
import "./Structure.css";

import { createGroup, setCurrentGroup } from '../../../features/firebase/firestore/firestoreSlice';
import { useDispatch } from 'react-redux';
import FolderTwoToneIcon from '@mui/icons-material/FolderTwoTone';
import { Dialog, Button, Modal, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import Group from '../../../interface/Group';


const actions = [
    { icon: <CreateNewFolderTwoToneIcon />, name: 'addGroup' },
    { icon: <PostAddIcon />, name: 'addTab' }
];

const Structure = () => {

    const { workspaces, groups, currentWorkspace, currentGroup } = useSelector((store) => store.firestore);
    const dispatch = useDispatch()
    const [newGroupName, setNewGroupName] = useState("")


    const [openCreateGroupDialog, setOpenCreateGroupDialog] = useState(false);
    const handleCreateGroupDialogOpen = () => setOpenCreateGroupDialog(true);
    const handleCreateGroupDialogClose = () => {
        setNewGroupName("");
        setOpenCreateGroupDialog(false);
    }

    const handleCreateGroup = () => {
        const group = Group;
        group.name = newGroupName;
        dispatch(createGroup(group));
        handleCreateGroupDialogClose();
    }

    const handleStructureOpenGroup = (group) => {
        dispatch(setCurrentGroup([...currentGroup, group.id]));
    }

    return (
        <div className='structure'>
            <div className='groupDiv'>
                {
                    currentGroup.length === 0 ?
                        workspaces
                            .filter(workspace => {
                                return workspace.id === currentWorkspace
                            })[0].groups
                            .map(group => {
                                return groups.filter(groupInDB => groupInDB.id === group)[0]
                            })
                            .map((group) => {
                                return (
                                    <Button onClick={() => { handleStructureOpenGroup(group) }} className='group' key={group.id} variant="contained" startIcon={<FolderTwoToneIcon />}>
                                        {group.name}
                                    </Button>
                                )
                            })
                        :
                        groups
                            .filter(group => group.id === currentGroup[currentGroup.length - 1])[0].groups
                            .map(group => {
                                return groups.filter(groupInDB => groupInDB.id === group)[0]
                            })
                            .map(group =>
                                (<Button onClick={() => { handleStructureOpenGroup(group) }} className='group' key={group.id} variant="contained" startIcon={<FolderTwoToneIcon />}>
                                    {group.name}
                                </Button>))
                }
            </div>
            <hr />
            <div className='tabDiv'>
            </div>
            <Box className="speedDial" sx={{ height: "20vh", transform: 'translateZ(0px)', flexGrow: 1 }}>
                <SpeedDial
                    ariaLabel="SpeedDial basic example"
                    sx={{ position: 'absolute', bottom: 16, right: 16 }}
                    icon={<SpeedDialIcon />}
                >
                    <SpeedDialAction
                        icon={actions[1].icon}
                        tooltipTitle="create new tab"
                    />
                    <SpeedDialAction
                        icon={actions[0].icon}
                        tooltipTitle="create new group"
                        onClick={handleCreateGroupDialogOpen}
                    />
                </SpeedDial>
            </Box>

            <Dialog open={openCreateGroupDialog} onClose={handleCreateGroupDialogClose}>
                <DialogTitle>Create new group</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        What would you like to name this group?
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="group name"
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
                    <Button onClick={handleCreateGroupDialogClose}>Cancel</Button>
                    <Button disabled={newGroupName.length === 0} onClick={handleCreateGroup}>Create</Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}


export default Structure
