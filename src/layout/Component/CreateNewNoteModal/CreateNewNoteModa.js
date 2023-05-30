import React, { useState } from "react";
import "./CreateNewNoteModal.css";
import useDrivePicker from 'react-google-drive-picker';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import { styled } from '@mui/material/styles';
import MuiGrid from '@mui/material/Grid';
import { Dialog, Button, Modal, Box, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Divider } from "@mui/material";

const Grid = styled(MuiGrid)(({ theme }) => ({
    width: '100%',
    ...theme.typography.body2,
    '& [role="separator"]': {
        margin: theme.spacing(0, 2),
    },
}));


const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const CreateNewNoteModal = ({ token, onPickNewNote }) => {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);


    const handleClickOpen = () => {
        setOpen(true);
    };


    const [openDialog, setOpenDialog] = useState(false);
    const handleDialogOpen = () => setOpenDialog(true);
    const handleDialogClose = () => setOpenDialog(false);

    const handleClickDialogOpen = () => {
        setOpenDialog(true);
    };

    const [openPicker, data, authResponse] = useDrivePicker();

    const handleOpenPicker = () => {
        openPicker({
            clientId: "1001399891070-ia1ccg3fsooonoo06iamokoeb1ca2n55.apps.googleusercontent.com",
            developerKey: "AIzaSyBAUKHaFviUHK2rYrE7vMzLJl8CG5ZcaiU",
            viewId: "DOCS",
            token: token, // pass oauth token in case you already have one
            showUploadView: true,
            showUploadFolders: true,
            supportDrives: true,
            multiselect: true,
            // customViews: customViewsArray, // custom view
            callbackFunction: (data) => {
                if (data.action === 'cancel' || data.action === 'loaded') {
                    return;
                }
                if (data !== undefined)
                    onPickNewNote(data);
            },
        })
    }

    const handleFileCreate = async (data) => {
        const response = await fetch("https://www.googleapis.com/upload/drive/v3/files", {
            method: "POST",
            body: JSON.stringify(data)
        })
    }

    return (
        <div>
            <div className='AddNote' onClick={handleOpen}>
                <div className="plusIcon">+</div>
            </div>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                className="CreateNoteModal"
            >
                <Box sx={style}>
                    <Grid container className="SelectCreateMethod">
                        <Grid item xs>
                            <Button variant="outlined" startIcon={<NoteAddIcon />} onClick={() => { handleClose(); handleDialogOpen(); }} >
                                create new file
                            </Button>
                        </Grid>
                        <Divider orientation="vertical" flexItem>
                            |
                        </Divider>
                        <Grid item xs>
                            <Button variant="outlined" startIcon={<CloudDownloadIcon />} onClick={() => { handleClose(); handleOpenPicker(); }}>
                                import exist file
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Modal>

            <Dialog open={openDialog} onClose={handleDialogClose}>
                <DialogTitle>Create new File</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Setting File Metadata
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="File Name"
                        type="text"
                        fullWidth
                        variant="standard"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose}>Cancel</Button>
                    <Button onClick={() => { handleDialogClose(); handleFileCreate(); }}>Create</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};


export default CreateNewNoteModal;