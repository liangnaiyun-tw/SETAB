import React, { useState } from "react";
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import setab_logo from '../../assets/setab.jpg';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import PersonAdd from '@mui/icons-material/PersonAdd';
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';
import Grid from '@mui/material/Grid';
import MenuList from './MenuList';

import Login from "../Component/Login/Login";
import "./index.css";
import { useSelector } from "react-redux";
import SearchBar from './SearchBar';
import { Dialog, Button, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import { createWorkSpace } from "../../features/firebase/firestore/firestoreSlice";
import Workspace from "../../interface/Workspace";
import { useDispatch } from "react-redux";


const LeftSidebar = ({ cssLeftSidebar, styleLeftSidebar }) => {

    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const [openCreateWorkshopDialog, setOpenCreateWorkshopDialog] = useState(false);
    const handleDialogOpen = () => setOpenCreateWorkshopDialog(true);
    const handleDialogClose = () => setOpenCreateWorkshopDialog(false);

    const { user } = useSelector((store) => store.auth)
    const [newWorkSpaceName, setNewWorkSpaceName] = useState("")

    const dispatch = useDispatch();

    const handleCreateWorkSpace = async () => {
        handleDialogClose();
        let workspace = Workspace;
        workspace.name = newWorkSpaceName;
        dispatch(createWorkSpace(workspace));
    }

    return (
        <>

            <div className={cssLeftSidebar} style={styleLeftSidebar}>
                <AppBar position="static" color="inherit" style={{ backgroundColor: '#202020' }}>
                    <Toolbar variant="dense">
                        <Typography variant="h1" color="white" component="div">

                            <Box sx={{ flexGrow: 1 }}>
                                <Grid container style={{ display: 'flex', alignItems: 'center' }}>
                                    <Grid item xs={9}>
                                        < img src={setab_logo} alt="setab_logo" width="100%" style={{ maxHeight: '67px', maxWidth: '240px' }} />
                                    </Grid>
                                    <Grid item xs={3} style={{ lineHeight: '60px' }}>

                                        <IconButton
                                            onClick={handleClick}
                                            size="large"
                                            sx={{ ml: 2 }}
                                            aria-controls={open ? 'account-menu' : undefined}
                                            aria-haspopup="true"
                                            aria-expanded={open ? 'true' : undefined}
                                        >
                                            <Avatar sx={{ width: 36, height: 36 }} style={{ background: '#363636' }}><AddIcon></AddIcon></Avatar>
                                        </IconButton>
                                        <Menu
                                            anchorEl={anchorEl}
                                            id="account-menu"
                                            open={open}
                                            onClose={handleClose}
                                            onClick={handleClose}
                                            PaperProps={{
                                                elevation: 0,
                                                sx: {
                                                    overflow: 'visible',
                                                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                                    mt: 1.5,
                                                    '& .MuiAvatar-root': {
                                                        width: 32,
                                                        height: 32,
                                                        ml: -0.5,
                                                        mr: 1,
                                                    },
                                                    '&:before': {
                                                        content: '""',
                                                        display: 'block',
                                                        position: 'absolute',
                                                        top: 0,
                                                        right: 14,
                                                        width: 10,
                                                        height: 10,
                                                        bgcolor: 'background.paper',
                                                        transform: 'translateY(-50%) rotate(45deg)',
                                                        zIndex: 0,
                                                    },
                                                },
                                            }}
                                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                        >
                                            <MenuItem onClick={handleClose}>
                                                <Avatar /> Profile
                                            </MenuItem>
                                            <MenuItem onClick={handleClose}>
                                                <Avatar /> My account
                                            </MenuItem>
                                            <Divider />
                                            <MenuItem onClick={() => { handleClose(); handleDialogOpen(); }}>
                                                <ListItemIcon>
                                                    <PersonAdd fontSize="small" />
                                                </ListItemIcon>
                                                Add workspace
                                            </MenuItem>
                                            <MenuItem onClick={handleClose}>
                                                <ListItemIcon>
                                                    <Settings fontSize="small" />
                                                </ListItemIcon>
                                                Settings
                                            </MenuItem>
                                            <MenuItem onClick={handleClose}>
                                                <ListItemIcon>
                                                    <Logout fontSize="small" />
                                                </ListItemIcon>
                                                Logout
                                            </MenuItem>
                                        </Menu>
                                    </Grid>

                                </Grid>

                            </Box>


                        </Typography>
                    </Toolbar>
                </AppBar>
                <Divider light />
                <SearchBar />
                <Divider light />
                <MenuList></MenuList>
                <div className="loginBlock">
                    {user === undefined || user === null ?
                        <>
                            <Login />
                        </> :
                        <>
                            <img className="userImage" src={user?.photoURL} alt="" />
                            <span className="userDisplayName">&nbsp; {user?.displayName}</span>
                        </>
                    }
                </div>
            </div>
            <Dialog open={openCreateWorkshopDialog} onClose={handleDialogClose}>
                <DialogTitle>Create new workshop</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        What would you like to name this work area ?
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="name"
                        type="text"
                        fullWidth
                        variant="standard"
                        onChange={(e) => {
                            setNewWorkSpaceName(e.target.value);
                        }}
                        value={newWorkSpaceName}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose}>Cancel</Button>
                    <Button disabled={newWorkSpaceName.length === 0} onClick={handleCreateWorkSpace}>Create</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};


export default LeftSidebar;