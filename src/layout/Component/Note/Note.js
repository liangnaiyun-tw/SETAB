import * as React from 'react';
import { useEffect } from 'react'
import BackspaceIcon from '@mui/icons-material/Backspace';
import CreateNewNoteModal from '../CreateNewNoteModal/CreateNewNoteModal';
import { Button, Skeleton } from '@mui/material';
import OutboundIcon from '@mui/icons-material/Outbound';

import NoteCard from '../NoteCard/NoteCard';
import "./Note.css";
import { useDispatch, useSelector } from 'react-redux';

import { getNotes, handleEdit, pickNewNote, finishEdit, iframeFinishLoading } from '../../../features/note/noteSlice';

export default function Note() {

    const { isLoadingNote, fileList, isEditing, editingUrl, isIframeLoading } = useSelector((store) => store.note);
    const { user, accessToken } = useSelector((store) => store.auth);
    const { currentWorkspace, currentGroup } = useSelector((store) => store.firestore);


    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getNotes(accessToken));
    }, [accessToken, dispatch])

    useEffect(() => {
        dispatch(getNotes(accessToken));
    }, [currentWorkspace, currentGroup])

    const onEdit = (alternateLink) => {
        dispatch(handleEdit(alternateLink));
    }

    const onPickNewNote = (newNoteDetail) => {
        dispatch(pickNewNote({ newNoteDetail, accessToken }));
    }

    

    return (

        <>
            {
                isEditing ?
                    <div className='Edit'>
                        <div className='buttonGroup'>
                            <Button variant="outlined" onClick={() => { dispatch(finishEdit()); }} startIcon={<BackspaceIcon />}>
                                Note List
                            </Button>
                            <Button variant="outlined" color="error" href={editingUrl} target="_blank" endIcon={<OutboundIcon />}>
                                Edit in new tab
                            </Button>
                        </div>

                        <hr />

                        {isIframeLoading ?
                            <>
                                <Skeleton animation="wave" variant="rectangular" width="100%" height="50%" /></>
                            : null}
                        <iframe onLoad={() => { dispatch(iframeFinishLoading()); document.querySelector("iframe").style.height = "100%" }} frameborder="0" style={{ overflow: "hidden", height: "0", width: "100%" }} height="100%" width="100%" src={editingUrl} allowFullScreen="true"></iframe>
                    </div>
                    :
                    <div className='note'>
                        <CreateNewNoteModal token={accessToken} onPickNewNote={onPickNewNote} />
                        {
                            isLoadingNote ?
                                <>
                                    <Skeleton variant="rectangular" height="100%" width="100%" style={{ borderRadius: "25px" }} />
                                    <Skeleton variant="rectangular" height="100%" width="100%" style={{ borderRadius: "25px" }} />
                                </>
                                :
                                fileList.map(({ id, iconLink, title, thumbnailLink, modifiedDate, alternateLink }) =>
                                    <NoteCard key={id} icon={iconLink} name={title} preview={thumbnailLink} lastAccess={modifiedDate} embedLink={alternateLink} onClick={onEdit} />
                                )
                        }
                    </div>
            }
        </>

    );
}