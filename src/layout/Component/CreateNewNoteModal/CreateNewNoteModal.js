import React, { useState } from "react";
import "./CreateNewNoteModal.css";
import useDrivePicker from 'react-google-drive-picker';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import { styled } from '@mui/material/styles';
import MuiGrid from '@mui/material/Grid';
import { Dialog, Button, Modal, Box, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Divider } from "@mui/material";
import ButtonGroup from '@mui/material/ButtonGroup';
import ArticleIcon from '@mui/icons-material/Article';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import GridOnIcon from '@mui/icons-material/GridOn';

import { useDispatch } from "react-redux";
import { createNewNote } from "../../../features/note/noteSlice";

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
    const [newNoteName, setNewNoteName] = useState("");


    const buttons = [
        <Button key="one" onClick={() => { handleDialogClose(); handleFileCreate(FILE_TYPE.DOCUMENT); }} disabled={newNoteName.length === 0} variant="contained" startIcon={<ArticleIcon />} >document</Button>,
        <Button key="two" onClick={() => { handleDialogClose(); handleFileCreate(FILE_TYPE.SLIDES); }} disabled={newNoteName.length === 0} color="warning" variant="contained" startIcon={<SlideshowIcon />} >slides</Button>,
        <Button key="three" onClick={() => { handleDialogClose(); handleFileCreate(FILE_TYPE.SPREADSHEET); }} disabled={newNoteName.length === 0} color="success" variant="contained" startIcon={<GridOnIcon />} >spreadsheet</Button>,
    ];

    const FILE_TYPE = {
        DOCUMENT: 0,
        SLIDES: 1,
        SPREADSHEET: 2
    }



    const [openDialog, setOpenDialog] = useState(false);
    const handleDialogOpen = () => setOpenDialog(true);
    const handleDialogClose = () => setOpenDialog(false);


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

    const dispatch = useDispatch();

    const handleFileCreate = (type) => {
        dispatch(createNewNote({ type, newNoteName }))
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
                                create new note
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
                <DialogTitle>Create new Note</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        What would you like to name this note ?
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="File Name"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={newNoteName}
                        onChange={(e) => { setNewNoteName(e.target.value) }}
                    />
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            '& > *': {
                                m: 1,
                            },
                        }}
                    >
                        <ButtonGroup size="large" aria-label="large button group" style={{ marginTop: "3vh" }}>
                            {buttons}
                        </ButtonGroup>
                    </Box>
                </DialogContent>
            </Dialog>
        </div>
    );
};


export default CreateNewNoteModal;